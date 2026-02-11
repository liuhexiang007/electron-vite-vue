<template>
  <div class="volume-bar-group" :style="groupStyle">
    <div v-for="item in items" :key="item.key" class="volume-bar-item">
      <!-- 进度条外框（灰色边框+圆角胶囊） -->
      <div class="bar-outer" :style="outerStyle">
        <div class="bar-inner" :style="innerStyle">
          <!-- 蓝色填充 -->
          <div class="bar-fill" :style="fillStyle(item.value)" />
        </div>
      </div>
      <!-- 标签 -->
      <span v-if="item.label && showLabel" class="bar-label" :style="labelStyle">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface VolumeItem {
  key: string
  label?: string
  value: number // 0~1
}

const props = defineProps({
  items: {
    type: Array as () => VolumeItem[],
    required: true
  },
  barHeight: {
    type: Number,
    default: 200
  },
  barWidth: {
    type: Number,
    default: 28
  },
  gap: {
    type: Number,
    default: 16
  },
  labelSize: {
    type: Number,
    default: 28
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  /** 外框边框粗细 */
  borderWidth: {
    type: Number,
    default: 4
  },
  /** 外框与内部填充的间距 */
  padding: {
    type: Number,
    default: 4
  },
  fillColor: {
    type: String,
    default: '#2B8FE8'
  },
  borderColor: {
    type: String,
    default: '#B0B0B0'
  },
  trackColor: {
    type: String,
    default: '#FFFFFF'
  }
})

const groupStyle = computed(() => ({
  gap: `${props.gap}px`
}))

// 外框：灰色边框 + 圆角胶囊
const outerStyle = computed(() => {
  const totalWidth = props.barWidth + props.padding * 2 + props.borderWidth * 2
  const totalHeight = props.barHeight + props.padding * 2 + props.borderWidth * 2
  return {
    width: `${totalWidth}px`,
    height: `${totalHeight}px`,
    borderRadius: `${totalWidth / 2}px`,
    border: `${props.borderWidth}px solid ${props.borderColor}`,
    padding: `${props.padding}px`,
    backgroundColor: props.borderColor
  }
})

// 内部白色轨道
const innerStyle = computed(() => ({
  width: `${props.barWidth}px`,
  height: `${props.barHeight}px`,
  borderRadius: `${props.barWidth / 2}px`,
  backgroundColor: props.trackColor
}))

// 蓝色填充
const fillStyle = (value: number) => {
  const clamped = Math.max(0, Math.min(1, value))
  return {
    height: `${clamped * 100}%`,
    backgroundColor: props.fillColor,
    borderRadius: `${props.barWidth / 2}px`
  }
}

const labelStyle = computed(() => ({
  fontSize: `${props.labelSize}px`
}))
</script>

<style scoped>
.volume-bar-group {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

.volume-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-outer {
  box-sizing: border-box;
}

.bar-inner {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
}

.bar-fill {
  width: 100%;
  transition: height 0.6s ease;
}

.bar-label {
  margin-top: 16px;
  color: #ff6f11;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 1px;
}
</style>