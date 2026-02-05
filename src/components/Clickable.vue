<template>
  <div 
    class="clickable-wrap" 
    :class="{ 'clickable-pressed': isPressed }"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @click="onClick"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const isPressed = ref(false)

const onMouseDown = () => {
  if (!props.disabled) {
    isPressed.value = true
  }
}

const onMouseUp = () => {
  isPressed.value = false
}

const onClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.clickable-wrap {
  transition: transform 0.15s ease, opacity 0.15s ease;
  cursor: pointer;
}

.clickable-pressed {
  transform: scale(0.95);
  opacity: 0.8;
}
</style>
