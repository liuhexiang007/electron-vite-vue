<template>
  <div class="countdown-wrap">
    <img class="timer-icon" src="@/assets/folder/1/icon(timer).png" />
    <div class="countdown-content">
      <span class="countdown-num">{{ countdown }}</span>
      <span class="countdown-s">s</span>
    </div>
    <span class="countdown-label">倒計時</span>
    <span class="countdown-label-en">Countdown</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  initialCount: {
    type: Number,
    default: 30
  }
})

const emit = defineEmits(['timeout'])

const countdown = ref(props.initialCount)
let timer: number | null = null

const startCountdown = () => {
  clearTimer()
  timer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearTimer()
      emit('timeout')
    }
  }, 1000)
}

const clearTimer = () => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

const reset = () => {
  clearTimer()
  countdown.value = props.initialCount
  startCountdown()
}

onMounted(() => {
  countdown.value = props.initialCount
  startCountdown()
})

onUnmounted(() => {
  clearTimer()
})

defineExpose({ reset })
</script>

<style scoped>
.countdown-wrap {
  position: absolute;
  bottom: 50px;
  right: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-icon {
  width: 270px;
}

.countdown-content {
  position: absolute;
  top: 68px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.countdown-num {
  font-size: 86px;
  color: #278eee;
  font-weight: bold;
}

.countdown-s {
  font-size: 32px;
  color: #278eee;
  font-weight: bold;
  margin-top: 48px;
}

.countdown-label {
  position: absolute;
  bottom: 95px;
  font-size: 34px;
  color: #278eee;
  font-weight: bold;
}

.countdown-label-en {
  position: absolute;
  bottom: 55px;
  font-size: 32px;
  color: #278eee;
  font-weight: bold;
}
</style>
