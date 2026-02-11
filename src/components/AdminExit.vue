<template>
  <!-- 隐藏触发区：屏幕右上角透明区域，连续点击5次触发 -->
  <div class="admin-trigger" @click="onTriggerClick" />

  <!-- 密码弹窗 -->
  <Teleport to="body">
    <div v-if="showDialog" class="admin-overlay" @click.self="onCancel">
      <div class="admin-dialog">
        <div class="admin-icon">🔐</div>
        <p class="admin-title">管理员验证</p>
        <p class="admin-subtitle">请输入密码以执行管理操作</p>

        <input
          ref="inputRef"
          v-model="password"
          type="password"
          class="admin-input"
          placeholder="输入密码"
          @keyup.enter="onExitKiosk"
        />

        <Transition name="fade">
          <p v-if="errorMsg" class="admin-error">{{ errorMsg }}</p>
        </Transition>

        <div class="admin-buttons">
          <button class="admin-btn btn-cancel" @click="onCancel">取消</button>
          <button class="admin-btn btn-exit" @click="onExitKiosk">退出Kiosk</button>
          <button class="admin-btn btn-quit" @click="onQuitApp">关闭应用</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const showDialog = ref(false)
const password = ref('')
const errorMsg = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

let clickCount = 0
let clickTimer: number | null = null

const onTriggerClick = () => {
  clickCount++
  if (clickTimer) clearTimeout(clickTimer)
  if (clickCount >= 5) {
    clickCount = 0
    showDialog.value = true
    password.value = ''
    errorMsg.value = ''
    nextTick(() => inputRef.value?.focus())
  }
  clickTimer = window.setTimeout(() => { clickCount = 0 }, 2000)
}

const onCancel = () => {
  showDialog.value = false
  password.value = ''
  errorMsg.value = ''
}

const onExitKiosk = async () => {
  if (!password.value) { errorMsg.value = '请输入密码'; return }
  try {
    const res = await (window as any).ipcRenderer.invoke('admin-exit-kiosk', password.value)
    if (res.success) {
      showDialog.value = false
    } else {
      errorMsg.value = '密码错误'
      password.value = ''
    }
  } catch {
    errorMsg.value = '操作失败'
  }
}

const onQuitApp = async () => {
  if (!password.value) { errorMsg.value = '请输入密码'; return }
  try {
    const res = await (window as any).ipcRenderer.invoke('admin-quit-app', password.value)
    if (!res.success) {
      errorMsg.value = '密码错误'
      password.value = ''
    }
  } catch {
    errorMsg.value = '操作失败'
  }
}
</script>

<style scoped>
.admin-trigger {
  position: fixed;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  z-index: 9999;
}

.admin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.admin-dialog {
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  border-radius: 20px;
  padding: 48px 40px 36px;
  width: 460px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.admin-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.admin-title {
  font-size: 30px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 6px;
}

.admin-subtitle {
  font-size: 18px;
  color: #888;
  margin-bottom: 28px;
}

.admin-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 22px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: #fff;
}

.admin-input:focus {
  border-color: #2B8FE8;
  box-shadow: 0 0 0 3px rgba(43, 143, 232, 0.15);
}

.admin-error {
  color: #e53935;
  font-size: 17px;
  margin-top: 10px;
  margin-bottom: 0;
}

.admin-buttons {
  margin-top: 28px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.admin-btn {
  padding: 12px 22px;
  font-size: 19px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.1s, box-shadow 0.2s;
}

.admin-btn:active {
  transform: scale(0.96);
}

.btn-cancel {
  background: #eee;
  color: #555;
}

.btn-exit {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.btn-quit {
  background: linear-gradient(135deg, #ef5350, #c62828);
  color: #fff;
  box-shadow: 0 4px 12px rgba(239, 83, 80, 0.3);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
