<template>
  <GlobalBg>
    <!-- 标题图片 -->
    <img class="title-img" src="@/assets/folder/1/title.png" />

    <!-- 中心离线图标 -->
    <Clickable class="block-wrap" @click="onBlockClick">
      <img class="block-icon" src="@/assets/folder/5/block.png" />
    </Clickable>

    <!-- 提示文字 -->
    <div class="hint-wrap">
      <span class="hint-zh">請按按鈕開始回收</span>
      <span class="hint-en">Please Click the Button to Start</span>
    </div>

    <!-- 底部banner -->
    <img class="bg-banner-img" src="@/assets/folder/1/bg-banner.png" />
    <!-- 容量 -->
    <img class="volume-label-img" src="@/assets/folder/1/volume-label.png" />
    <!-- 分类组 -->
    <img class="group-img" src="@/assets/folder/1/group.png" />
    <!-- 本機可回收 Recyclables -->
    <div class="recyclables-label">
      <span class="recyclables-zh">本機可回收</span>
      <span class="recyclables-en">Recyclables</span>
    </div>
    <!-- 分类图标 -->
    <CategoryIcon class="plastic-pos" type="plastic" :pt="plasticPt" :size="172" />
    <CategoryIcon class="metal-pos" type="metal" :pt="metalPt" :size="172" />
    <CategoryIcon class="glass-pos" type="glass" :pt="glassPt" :size="172" />
    <CategoryIcon class="paper-pos" type="paper" :pt="paperPt" :size="172" />
  </GlobalBg>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlobalBg from '@/components/GlobalBg.vue'
import Clickable from '@/components/Clickable.vue'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { WebSocketService, eventBus } from '@/utils/WebSocketService'

const router = useRouter()

const plasticPt = ref(1)
const metalPt = ref(1)
const glassPt = ref(1)
const paperPt = ref(1)

const onBlockClick = () => {
  const ws = WebSocketService.getInstance()
  if (ws.uiType === 1) {
    router.replace('/recycle')
  } else {
    router.replace('/')
  }
}

const handleRateConfig = (config: Record<string, any>) => {
  if (config.plastic != null) plasticPt.value = config.plastic
  if (config.metal != null) metalPt.value = config.metal
  if (config.glass != null) glassPt.value = config.glass
  if (config.paper != null) paperPt.value = config.paper
}

onMounted(() => {
  eventBus.on('ws-rate-config', handleRateConfig)
})

onUnmounted(() => {
  eventBus.off('ws-rate-config', handleRateConfig)
})
</script>

<style scoped>
.title-img {
  position: absolute;
  width: 749px;
  top: 259px;
  left: 50%;
  transform: translateX(-50%);
}

.block-wrap {
  position: absolute;
  top: 576px;
  left: 50%;
  transform: translateX(-50%);
}

.block-icon {
  width: 576px;
  height: 461px;
  object-fit: contain;
}

.hint-wrap {
  position: absolute;
  top: 1123px;
  left: 0;
  width: 1080px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hint-zh {
  font-size: 52px;
  color: #333333;
  font-weight: bold;
  margin-bottom: 14px;
}

.hint-en {
  font-size: 40px;
  color: #666666;
}

.bg-banner-img {
  position: absolute;
  width: 100%;
  height: auto;
  bottom: 0;
  left: 0;
}

.volume-label-img {
  position: absolute;
  width: 160px;
  bottom: 370px;
  left: 40px;
}

.group-img {
  position: absolute;
  width: 140px;
  bottom: 120px;
  left: 55px;
}

.recyclables-label {
  position: absolute;
  bottom: 320px;
  right: 60px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.recyclables-zh {
  font-size: 40px;
  color: #333333;
  font-weight: bold;
}

.recyclables-en {
  font-size: 35px;
  color: #666666;
  margin-left: 14px;
}

/* 分类图标位置 - 四个图标均匀分布，避开左侧容量组 */
.plastic-pos {
  position: absolute;
  bottom: 90px;
  left: 250px;
}

.metal-pos {
  position: absolute;
  bottom: 90px;
  left: 449px;
}

.glass-pos {
  position: absolute;
  bottom: 90px;
  left: 648px;
}

.paper-pos {
  position: absolute;
  bottom: 90px;
  left: 847px;
}
</style>
