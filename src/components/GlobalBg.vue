<template>
  <div class="global-bg-wrapper">
    <div class="scale-container" :style="scaleContainerStyle">
      <img class="bg-img" src="@/assets/folder/1/bg-main.png" />
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 设计稿尺寸（纵向屏幕）
const DESIGN_WIDTH = 1080
const DESIGN_HEIGHT = 1920

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)

const updateScale = () => {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  // 计算缩放比例，保持宽高比
  const scaleX = windowWidth / DESIGN_WIDTH
  const scaleY = windowHeight / DESIGN_HEIGHT

  // 使用较小的缩放比例，确保内容完全可见
  scale.value = Math.min(scaleX, scaleY)

  // 计算居中偏移
  const scaledWidth = DESIGN_WIDTH * scale.value
  const scaledHeight = DESIGN_HEIGHT * scale.value
  translateX.value = (windowWidth - scaledWidth) / 2
  translateY.value = (windowHeight - scaledHeight) / 2
}

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})

const scaleContainerStyle = computed(() => ({
  width: `${DESIGN_WIDTH}px`,
  height: `${DESIGN_HEIGHT}px`,
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: 'top left'
}))
</script>

<style scoped>
.global-bg-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #e8f4fc;
}

.scale-container {
  position: absolute;
  top: 0;
  left: 0;
}

.bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 1080px;
  height: 1920px;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  width: 1080px;
  height: 1920px;
}
</style>
