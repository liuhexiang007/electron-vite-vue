<template>
  <div class="category-icon-wrap" :style="wrapStyle">
    <img class="category-img" :src="imageSrc" :style="imgStyle" />
    <span class="overlay-pt" :style="ptStyle">{{ pt }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 图片导入
import plasticImg from '@/assets/folder/1/plastic.png'
import metalImg from '@/assets/folder/1/metal.png'
import glassImg from '@/assets/folder/1/glass.png'
import paperImg from '@/assets/folder/1/paper.png'
import elecImg from '@/assets/folder/1/elec.png'
import powerImg from '@/assets/folder/1/power.png'

const props = defineProps({
  type: {
    type: String,
    default: 'plastic'
  },
  pt: {
    type: Number,
    default: 1
  },
  size: {
    type: Number,
    default: 120
  },
  ptTop: {
    type: Number,
    default: 8
  },
  ptRight: {
    type: Number,
    default: 22
  },
  ptSize: {
    type: Number,
    default: 48
  }
})

const imageSrc = computed(() => {
  const map: Record<string, string> = {
    plastic: plasticImg,
    metal: metalImg,
    glass: glassImg,
    paper: paperImg,
    elec: elecImg,
    power: powerImg
  }
  return map[props.type] || plasticImg
})

const wrapStyle = computed(() => ({
  width: `${props.size}px`
}))

const imgStyle = computed(() => ({
  width: `${props.size}px`
}))

const ptStyle = computed(() => ({
  top: `${props.ptTop}px`,
  right: `${props.ptRight}px`,
  fontSize: `${props.ptSize}px`
}))
</script>

<style scoped>
.category-icon-wrap {
  position: relative;
}

.category-img {
  display: block;
}

.overlay-pt {
  position: absolute;
  font-weight: bold;
  color: #ff6f11;
}
</style>
