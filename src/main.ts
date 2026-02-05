import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { WebSocketService } from './utils/WebSocketService'

import './style.css'

// 初始化 WebSocket 服务（启用模拟模式用于测试）
const ws = WebSocketService.getInstance()
ws.enableMockMode(true)  // 开发时启用模拟模式，正式环境改为 false
// ws.setServerUrl('ws://your-server:port/ws-link/websocket')
// ws.connect()

const app = createApp(App)
app.use(router)
app.mount('#app')

// 根据 uiType 跳转到初始页面
router.isReady().then(() => {
  const initialRoute = ws.uiType === 1 ? '/recycle' : '/'
  if (router.currentRoute.value.path !== initialRoute) {
    router.replace(initialRoute)
  }
  postMessage({ payload: 'removeLoading' }, '*')
})
