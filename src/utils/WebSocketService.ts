/**
 * WebSocket 服务封装类（STOMP over SockJS）
 * 使用 @stomp/stompjs + sockjs-client
 */
import { Client, IMessage } from '@stomp/stompjs'
// @ts-ignore - 使用浏览器打包版本避免 Node.js crypto 依赖
import SockJS from 'sockjs-client/dist/sockjs'
import router from '../router'

// 事件总线（简单实现）
type EventCallback = (data: any) => void
const eventBus = {
  events: {} as Record<string, EventCallback[]>,
  on(event: string, callback: EventCallback) {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(callback)
  },
  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter(cb => cb !== callback)
  },
  emit(event: string, data: any) {
    if (!this.events[event]) return
    this.events[event].forEach(cb => cb(data))
  }
}

export { eventBus }

// 物品类型
export const ItemType = {
  CAN: 'can',
  CARTON: 'carton',
  PLASTIC_BOTTLE: 'plastic_bottle',
  GLASS_BOTTLE: 'glass_bottle',
  ELECTRONIC: 'electronic',
  BATTERY: 'battery'
}

// UI Action
export const UIAction = {
  INDEX: 'INDEX',
  SHOW_QR_SCANNER: 'SHOW_QR_SCANNER',
  OPEN_DOOR: 'OPEN_DOOR',
  END: 'END',
  END_NO_POINTS: 'END_NO_POINTS',
  TIPS_OPEN_AUTO: 'TIPS_OPEN_AUTO',
  TIPS_CLOSE_AUTO: 'TIPS_CLOSE_AUTO',
  TIPS_OPEN: 'TIPS_OPEN',
  TIPS_CLOSE: 'TIPS_CLOSE'
}

export class WebSocketService {
  private static instance: WebSocketService | null = null
  private stompClient: Client | null = null
  private connected = false
  //private serverUrl = 'ws://172.20.10.2:7580/ws-link/websocket'
  private serverUrl = 'http://192.168.0.173:7580/ws-link'
  private mockMode = false

  // STOMP 目标地址
  private sendDestination = '/app/report'
  private subscribeDestination = '/topic/device'

  // 业务状态
  public currentUser: Record<string, any> = {}
  public deviceStatus = '待机'
  public uiAction = 'HOME'
  public lastItemType = ''
  public uiType = 0  // 0=4种类型回收, 1=2种类型回收(电子产品)

  // 容量比例（持久化，页面切换不丢失，后端 UI_PROPORTION 更新时覆盖）
  public proportion: Record<string, number> = {
    paper: 0, metal: 0, plastic: 0, glass: 0,
    electronicWaste: 0, battery: 0
  }

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  public setServerUrl(url: string): WebSocketService {
    this.serverUrl = url
    return this
  }

  public enableMockMode(enable = true): WebSocketService {
    this.mockMode = enable
    if (enable) this.log('⚠️ 模拟模式已启用')
    return this
  }

  public connect(): void {
    if (this.mockMode) {
      this.connected = true
      this.log('🔗 模拟连接成功')
      eventBus.emit('ws-connection', true)
      setTimeout(() => {
        this.handleBackendMessage(JSON.stringify({
          action: 'UI_PROPORTION',
          data: {
            paper: 0.95, metal: 0.95, plastic: 0.95,
            glass: 0.95, electronicWaste: 0.95, battery: 0.95
          }
        }))
      }, 500)
      return
    }

    if (this.connected) {
      this.log('已经连接，无需重复连接')
      return
    }

    this.log('正在连接: ' + this.serverUrl)

    this.stompClient = new Client({
      // 使用 SockJS 作为传输层（跟后端 SockJS 端点匹配）
      webSocketFactory: () => new SockJS(this.serverUrl) as any,
      reconnectDelay: 5000,
      debug: (str) => {
        this.log(`[STOMP DEBUG] ${str}`)
      },
      onConnect: () => {
        this.connected = true
        this.log('STOMP 连接成功!')
        eventBus.emit('ws-connection', true)

        // 订阅后端推送
        this.stompClient!.subscribe(this.subscribeDestination, (message: IMessage) => {
          this.log(`[STOMP 收到] destination=${this.subscribeDestination}, body=${message.body}`)
          this.handleBackendMessage(message.body)
        })
        this.log(`已订阅: ${this.subscribeDestination}`)

        // 订阅完成后主动请求 UI_TYPE，防止后端发得太早前端没收到
        this.sendToServer('GET_UI_TYPE', {})
      },
      onDisconnect: () => {
        this.connected = false
        this.log('STOMP 连接断开')
        eventBus.emit('ws-connection', false)
      },
      onStompError: (frame) => {
        this.log(`STOMP 错误: ${frame.headers['message']} / ${frame.body}`)
        eventBus.emit('ws-connection', false)
      },
      onWebSocketError: (event) => {
        this.log('WebSocket 错误: ' + JSON.stringify(event))
        eventBus.emit('ws-connection', false)
      },
      onWebSocketClose: () => {
        this.connected = false
        eventBus.emit('ws-connection', false)
      },
      onUnhandledMessage: (message: IMessage) => {
        this.log(`[未匹配消息] destination=${message.headers['destination']}, body=${message.body}`)
      }
    })

    this.stompClient.activate()
  }

  public disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate()
      this.stompClient = null
    }
    this.connected = false
    eventBus.emit('ws-connection', false)
    this.log('已断开连接')
  }

  public sendToServer(action: string, data: Record<string, any> = {}, destination?: string): boolean {
    if (this.mockMode) {
      this.log(`[模拟发送] Action: ${action}, Data: ${JSON.stringify(data)}`)
      this.mockResponse(action, data)
      return true
    }

    if (!this.connected || !this.stompClient) {
      this.log('未连接服务器，无法发送')
      return false
    }

    const dest = destination || this.sendDestination
    const payload = { action, data, timestamp: Date.now() }
    this.stompClient.publish({
      destination: dest,
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' }
    })
    this.log(`[STOMP 发送] -> ${dest} Action: ${action}`)
    return true
  }

  private mockResponse(action: string, data: Record<string, any>): void {
    if (action === 'OPEN') {
      const isAuth = data.isAuth as boolean
      if (this.uiType === 1) {
        setTimeout(() => {
          this.log('[模拟响应] UI_ACTION: TIPS_OPEN')
          this.handleBackendMessage('{"action":"UI_ACTION","data":"TIPS_OPEN"}')
        }, 500)
      } else {
        setTimeout(() => {
          this.log('[模拟响应] UI_ACTION: TIPS_OPEN_AUTO')
          this.handleBackendMessage('{"action":"UI_ACTION","data":"TIPS_OPEN_AUTO"}')
        }, 500)
        setTimeout(() => {
          if (isAuth) {
            this.handleBackendMessage('{"action":"UI_ACTION","data":"SHOW_QR_SCANNER"}')
          } else {
            this.handleBackendMessage('{"action":"UI_ACTION","data":"OPEN_DOOR"}')
          }
        }, 3000)
      }
    } else if (action === 'CONFIRM_START') {
      // ManualOpen.vue 发送 CONFIRM_START 后，模拟后端返回跳转到投放页面
      setTimeout(() => {
        this.log('[模拟响应] CONFIRM_START -> OPEN_DOOR')
        this.handleBackendMessage('{"action":"UI_ACTION","data":"OPEN_DOOR"}')
      }, 500)
    } else if (action === 'DOOR_OPENED') {
      setTimeout(() => {
        this.handleBackendMessage('{"action":"UI_ACTION","data":"OPEN_DOOR"}')
      }, 500)
    } else if (action === 'CONFIRM') {
      // ManualClose.vue 发送 CONFIRM 后，根据用户状态决定跳转到哪个感谢页面
      setTimeout(() => {
        const hasUser = this.currentUser && Object.keys(this.currentUser).length > 0
        const endAction = hasUser ? 'END' : 'END_NO_POINTS'
        this.log(`[模拟响应] CONFIRM -> ${endAction}`)
        this.handleBackendMessage(`{"action":"UI_ACTION","data":"${endAction}"}`)
      }, 500)
    } else if (action === 'CLOSE') {
      // 根据用户状态决定跳转到哪个感谢页面
      const hasUser = this.currentUser && Object.keys(this.currentUser).length > 0
      const endAction = hasUser ? 'END' : 'END_NO_POINTS'
      
      if (this.uiType === 1) {
        setTimeout(() => {
          this.handleBackendMessage('{"action":"UI_ACTION","data":"TIPS_CLOSE"}')
        }, 500)
        setTimeout(() => {
          this.handleBackendMessage(`{"action":"UI_ACTION","data":"${endAction}"}`)
        }, 4000)
      } else {
        setTimeout(() => {
          this.handleBackendMessage('{"action":"UI_ACTION","data":"TIPS_CLOSE_AUTO"}')
        }, 500)
        setTimeout(() => {
          this.handleBackendMessage(`{"action":"UI_ACTION","data":"${endAction}"}`)
        }, 3000)
      }
    }
  }

  private handleBackendMessage(rawData: string): void {
    let msg: Record<string, any>
    try {
      msg = JSON.parse(rawData)
    } catch (e) {
      this.log('消息解析失败: ' + rawData)
      return
    }

    const action = msg.action as string
    const data = msg.data

    this.log(`[收到] Action: ${action}, Data: ${JSON.stringify(data)}`)
    eventBus.emit('ws-message', { action, data })

    if (action === 'UI_ERROR') {
      this.log(`❌ 错误: ${data}`)
      eventBus.emit('ws-error', data as string)
    } else if (action === 'UI_ACTION') {
      this.uiAction = data as string
      this.navigateByAction(data as string)
    } else if (action === 'UI_STATUS') {
      this.deviceStatus = data as string
      this.log(`设备状态: ${this.deviceStatus}`)
    } else if (action === 'UI_TYPE') {
      this.uiType = Number(data)
      this.log(`UI类型: ${this.uiType} (${this.uiType === 0 ? '4种类型' : '2种类型-电子产品'})`)
      if (this.uiType === 1) {
        router.replace('/recycle')
      } else {
        router.replace('/')
      }
    } else if (action === 'UI_USER_INFO') {
      this.currentUser = data as Record<string, any>
      this.log(`用户登录成功: ${this.currentUser.name}`)
    } else if (action === 'UI_UPDATE') {
      const updateData = data as Record<string, any>
      this.lastItemType = updateData.type as string
      this.log(`♻️ 识别到物品: ${this.lastItemType}`)
      eventBus.emit('ws-item-update', updateData)
    } else if (action === 'UI_VOICE') {
      this.log(`语音播报: "${data}"`)
    } else if (action === 'UI_RATE') {
      this.log(`积分费率: ${JSON.stringify(data)}`)
      eventBus.emit('ws-rate-config', data)
    } else if (action === 'UI_PROPORTION') {
      this.log(`容量比例: ${JSON.stringify(data)}`)
      // 持久化容量数据
      const d = data as Record<string, number>
      for (const key of Object.keys(this.proportion)) {
        if (d[key] != null) this.proportion[key] = d[key]
      }
      eventBus.emit('ws-proportion', data)
    }
  }

  private navigateByAction(action: string): void {
    let url = ''
    if (action === 'INDEX') {
      url = this.uiType === 1 ? '/recycle' : '/'
      router.replace(url)
      return
    } else if (action === 'SHOW_QR_SCANNER') { url = '/scan' }
    else if (action === 'OPEN_DOOR') { url = this.uiType === 1 ? '/nonmember-elec' : '/nonmember' }
    else if (action === 'END') { url = '/thankyou' }
    else if (action === 'END_NO_POINTS') { url = '/thankyou-no-points' }
    else if (action === 'TIPS_OPEN_AUTO') { url = '/door-opening' }
    else if (action === 'TIPS_CLOSE_AUTO') { url = '/door-closing' }
    else if (action === 'TIPS_OPEN') { url = '/manual-open' }
    else if (action === 'TIPS_CLOSE') { url = '/manual-close' }
    else { this.log(`未知的 UI_ACTION: ${action}`); return }
    this.log(`跳转页面: ${url}`)
    router.push(url)
  }

  // ============ 业务方法 ============
  public openAsMember(): void { this.sendToServer('OPEN', { isAuth: true }) }
  public openAsNonMember(): void { this.sendToServer('OPEN', { isAuth: false }) }
  public close(): void { this.sendToServer('CLOSE', {}) }
  public isConnected(): boolean { return this.connected }

  private log(text: string): void {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    console.log(`[WS ${time}] ${text}`)
  }
}
