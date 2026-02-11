<template>
  <div
    class="loading-btn-wrap"
    :class="{ 'loading-btn-pressed': isPressed, 'loading-btn-disabled': isLoading }"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @touchstart.passive="onMouseDown"
    @touchend="onMouseUp"
    @click="onClick"
  >
    <slot></slot>
    <!-- 按钮上的 loading 遮罩 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <!-- 全屏遮罩，阻止所有其他操作 -->
    <Teleport to="body">
      <div v-if="isLoading" class="fullscreen-mask"></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const emit = defineEmits(['click'])

const isPressed = ref(false)
const isLoading = ref(false)
let loadingTimer: ReturnType<typeof setTimeout> | null = null

const onMouseDown = () => {
  if (!isLoading.value) isPressed.value = true
}

const onMouseUp = () => {
  isPressed.value = false
}

const onClick = () => {
  if (isLoading.value) return
  isLoading.value = true
  loadingTimer = setTimeout(() => { isLoading.value = false }, 30000)
  emit('click')
}

onUnmounted(() => {
  if (loadingTimer) clearTimeout(loadingTimer)
})
</script>

<style scoped>
.loading-btn-wrap {
  position: relative;
  transition: transform 0.15s ease, opacity 0.15s ease;
  cursor: pointer;
  display: inline-block;
}

.loading-btn-pressed {
  transform: scale(0.95);
  opacity: 0.8;
}

.loading-btn-disabled {
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: inherit;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.15);
  border-top-color: #ff6f11;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fullscreen-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
}
</style>
