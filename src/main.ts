import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { WebSocketService } from './utils/WebSocketService'

import './style.css'

// 初始化 WebSocket 服务（启用模拟模式用于测试）
const ws = WebSocketService.getInstance()
ws.enableMockMode(true)  // 开发时启用模拟模式，正式环境改为 false
//ws.setServerUrl('http://192.168.0.105:7580/ws-link')
ws.connect()
  //private serverUrl = 'ws://192.168.0.101:7580/ws-link/websocket'
  //private serverUrl = 'ws://172.20.10.2:7580/ws-link/websocket'

const app = createApp(App)
app.use(router)
app.mount('#app')

// 启动时移除 loading，初始路由由后端 UI_TYPE 消息决定
router.isReady().then(() => {
  postMessage({ payload: 'removeLoading' }, '*')
})
