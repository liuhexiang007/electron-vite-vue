<template>
  <router-view />
  <AdminExit />
  <!-- 全局错误弹窗 -->
  <Teleport to="body">
    <div v-if="errorMsg" class="error-toast" @click="errorMsg = ''">
      <div class="error-toast-content">
        <span class="error-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </span>
        <span class="error-text">{{ errorMsg }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AdminExit from '@/components/AdminExit.vue'
import { eventBus } from '@/utils/WebSocketService'

const errorMsg = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

const showError = (msg: string) => {
  errorMsg.value = msg
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => { errorMsg.value = '' }, 5000)
}

onMounted(() => { eventBus.on('ws-error', showError) })
onUnmounted(() => { eventBus.off('ws-error', showError) })
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.error-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  cursor: pointer;
}

.error-toast-content {
  background: rgba(220, 38, 38, 0.95);
  color: #fff;
  padding: 24px 48px;
  border-radius: 16px;
  font-size: 36px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.error-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
