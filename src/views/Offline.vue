<template>
  <GlobalBg>
    <!-- 标题图片 -->
    <img class="title-img" src="@/assets/folder/1/title.png" />

    <!-- 中心离线图标 -->
    <img class="block-icon" src="@/assets/folder/5/block.png" />

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
    <img class="group-img" src="@/assets/folder/1/group-elec.png" />
    <!-- 本機可回收 Recyclables -->
    <div class="recyclables-label">
      <span class="recyclables-zh">本機可回收</span>
      <span class="recyclables-en">Recyclables</span>
    </div>
    <!-- 分类图标 -->
    <CategoryIcon class="elec-pos" type="elec" :pt="elecPt" :size="340" :ptTop="20" :ptRight="66" :ptSize="58" />
    <CategoryIcon class="power-pos" type="power" :pt="powerPt" :size="340" :ptTop="20" :ptRight="66" :ptSize="58" />
  </GlobalBg>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GlobalBg from '@/components/GlobalBg.vue'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { eventBus } from '@/utils/WebSocketService'

const elecPt = ref(0.5)
const powerPt = ref(0.5)

const handleRateConfig = (config: Record<string, any>) => {
  if (config.electronicWaste != null) elecPt.value = config.electronicWaste
  if (config.battery != null) powerPt.value = config.battery
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

.block-icon {
  position: absolute;
  width: 576px;
  height: 461px;
  top: 576px;
  left: 50%;
  transform: translateX(-50%);
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
  width: 100px;
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

/* 分类图标位置 - 两个图标均匀分布，避开左侧容量组 */
.elec-pos {
  position: absolute;
  bottom: 100px;
  left: 250px;
}

.power-pos {
  position: absolute;
  bottom: 100px;
  left: 680px;
}
</style>
