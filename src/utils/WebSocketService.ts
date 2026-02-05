/**
 * WebSocket 服务封装类
 * 适配 Electron + Vue 环境
 */
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
  END: 'END'
}

export class WebSocketService {
  private static instance: WebSocketService | null = null
  private ws: WebSocket | null = null
  private connected = false
  private serverUrl = 'ws://192.168.0.101:7580/ws-link/websocket'
  private mockMode = false
  private reconnectTimer: number | null = null

  // 业务状态
  public currentUser: Record<string, any> = {}
  public deviceStatus = '待机'
  public uiAction = 'HOME'
  public lastItemType = ''
  public uiType = 1  // 0=4种类型回收, 1=2种类型回收(电子产品)

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
      return
    }

    if (this.connected) {
      this.log('已经连接，无需重复连接')
      return
    }

    this.log('正在连接: ' + this.serverUrl)

    try {
      this.ws = new WebSocket(this.serverUrl)

      this.ws.onopen = () => {
        this.connected = true
        this.log('WebSocket 连接成功!')
        eventBus.emit('ws-connection', true)
        // 发送订阅消息（如果需要STOMP协议，这里需要调整）
        this.subscribe()
      }

      this.ws.onmessage = (event) => {
        this.handleBackendMessage(event.data)
      }

      this.ws.onerror = (error) => {
        this.log('WebSocket 错误: ' + JSON.stringify(error))
        eventBus.emit('ws-connection', false)
      }

      this.ws.onclose = () => {
        this.connected = false
        this.log('WebSocket 连接断开')
        eventBus.emit('ws-connection', false)
        this.scheduleReconnect()
      }
    } catch (e) {
      this.log('连接失败: ' + e)
    }
  }

  private subscribe(): void {
    // 简单WebSocket不需要订阅，如果是STOMP协议需要发送SUBSCRIBE帧
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.log('尝试重新连接...')
      this.connect()
    }, 5000)
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.connected = false
    eventBus.emit('ws-connection', false)
    this.log('已断开连接')
  }

  public sendToServer(action: string, data: Record<string, any> = {}): boolean {
    if (this.mockMode) {
      this.log(`[模拟发送] Action: ${action}, Data: ${JSON.stringify(data)}`)
      this.mockResponse(action, data)
      return true
    }

    if (!this.connected || !this.ws) {
      this.log('未连接服务器，无法发送')
      return false
    }

    const payload = { action, data, timestamp: Date.now() }
    this.ws.send(JSON.stringify(payload))
    this.log(`[发送] Action: ${action}, Data: ${JSON.stringify(data)}`)
    return true
  }

  private mockResponse(action: string, data: Record<string, any>): void {
    if (action === 'OPEN') {
      const isAuth = data.isAuth as boolean
      // 先设置 UI_TYPE（不触发跳转）
      this.uiType = 1
      this.log(`[模拟响应] UI_TYPE: ${this.uiType}`)
      
      // 延迟后直接跳转到对应页面
      setTimeout(() => {
        if (isAuth) {
          this.log('[模拟响应] UI_ACTION: SHOW_QR_SCANNER')
          this.handleBackendMessage('{"action":"UI_ACTION","data":"SHOW_QR_SCANNER"}')
        } else {
          this.log('[模拟响应] UI_ACTION: OPEN_DOOR')
          this.handleBackendMessage('{"action":"UI_ACTION","data":"OPEN_DOOR"}')
        }
      }, 500)
    } else if (action === 'CLOSE') {
      setTimeout(() => {
        this.log('[模拟响应] UI_ACTION: END')
        this.handleBackendMessage('{"action":"UI_ACTION","data":"END"}')
      }, 500)
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

    // 广播原始消息
    eventBus.emit('ws-message', { action, data })

    // 业务逻辑处理
    if (action === 'UI_ERROR') {
      const errorMsg = data as string
      this.log(`❌ 错误: ${errorMsg}`)
      router.replace('/error')
    } else if (action === 'UI_ACTION') {
      const uiAction = data as string
      this.uiAction = uiAction
      this.navigateByAction(uiAction)
    } else if (action === 'UI_STATUS') {
      this.deviceStatus = data as string
      this.log(`设备状态: ${this.deviceStatus}`)
    } else if (action === 'UI_TYPE') {
      this.uiType = data as number
      this.log(`UI类型: ${this.uiType} (${this.uiType === 0 ? '4种类型' : '2种类型-电子产品'})`)
      if (this.uiType === 1) {
        router.replace('/recycle')
      } else {
        router.replace('/')
      }
    } else if (action === 'UI_USER_INFO') {
      this.currentUser = data as Record<string, any>
      const userName = this.currentUser.name
      this.log(`用户登录成功: ${userName}`)
    } else if (action === 'UI_UPDATE') {
      const updateData = data as Record<string, any>
      const itemType = updateData.type as string
      this.lastItemType = itemType
      this.log(`♻️ 识别到物品: ${itemType}`)
      eventBus.emit('ws-item-update', updateData)
    } else if (action === 'UI_VOICE') {
      const voiceText = data as string
      this.log(`语音播报: "${voiceText}"`)
    } else if (action === 'UI_RATE') {
      const rateData = data as Record<string, any>
      this.log(`积分费率: ${JSON.stringify(rateData)}`)
      eventBus.emit('ws-rate-config', rateData)
    }
  }

  private navigateByAction(action: string): void {
    let url = ''

    if (action === 'INDEX') {
      url = this.uiType === 1 ? '/recycle' : '/'
      router.replace(url)
      return
    } else if (action === 'SHOW_QR_SCANNER') {
      url = '/scan'
    } else if (action === 'OPEN_DOOR') {
      url = this.uiType === 1 ? '/nonmember-elec' : '/nonmember'
    } else if (action === 'END') {
      url = '/thankyou'
    } else {
      this.log(`未知的 UI_ACTION: ${action}`)
      return
    }

    this.log(`跳转页面: ${url}`)
    router.push(url)
  }

  // ============ 业务方法 ============
  public openAsMember(): void {
    this.sendToServer('OPEN', { isAuth: true })
  }

  public openAsNonMember(): void {
    this.sendToServer('OPEN', { isAuth: false })
  }

  public close(): void {
    this.sendToServer('CLOSE', {})
  }

  public isConnected(): boolean {
    return this.connected
  }

  private log(text: string): void {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    console.log(`[WS ${time}] ${text}`)
  }
}
