<template>
  <GlobalBg>
    <!-- 标题图片 -->
    <img class="title-img" src="@/assets/folder/1/title.png" />
    <!-- 会员卡片 -->
    <LoadingButton class="member-wrap" @click="goToRecycle">
      <img class="member-img" src="@/assets/folder/1/member.png" />
    </LoadingButton>
    <!-- 非会员卡片 -->
    <LoadingButton class="non-member-wrap" @click="goToNonmember">
      <img class="non-member-img" src="@/assets/folder/1/non-member.png" />
    </LoadingButton>
    <!-- 请按按钮开始回收 -->
    <img class="btn-hint-img" src="@/assets/folder/1/btn-hint.png" />
    <!-- 底部banner -->
    <img class="bg-banner-img" src="@/assets/folder/1/bg-banner.png" />
    <!-- 容量 -->
    <img class="volume-label-img" src="@/assets/folder/1/volume-label.png" />
    <!-- 动态容量进度条 -->
    <VolumeBar
      class="volume-bar-pos"
      :items="volumeItems"
      :barHeight="240"
      :barWidth="18"
      :gap="8"
      :borderWidth="3"
      :padding="3"
    />
    <!-- 本機可回收 Recyclables -->
    <div class="recyclables-label">
      <span class="recyclables-zh">本機可回收</span>
      <span class="recyclables-en">Recyclables</span>
    </div>
    <!-- 分类图标 -->
    <CategoryIcon class="plastic-pos" type="plastic" :pt="plasticPt" :size="175" :ptTop="24" :ptRight="66"
      :ptSize="50" />
    <CategoryIcon class="metal-pos" type="metal" :pt="metalPt" :size="175" :ptTop="24" :ptRight="66" :ptSize="50" />
    <CategoryIcon class="glass-pos" type="glass" :pt="glassPt" :size="175" :ptTop="24" :ptRight="66" :ptSize="50" />
    <CategoryIcon class="paper-pos" type="paper" :pt="paperPt" :size="175" :ptTop="24" :ptRight="66" :ptSize="50" />
  </GlobalBg>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GlobalBg from '@/components/GlobalBg.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import CategoryIcon from '@/components/CategoryIcon.vue'
import VolumeBar from '@/components/VolumeBar.vue'
import { WebSocketService, eventBus } from '@/utils/WebSocketService'

const plasticPt = ref(1)
const metalPt = ref(1)
const glassPt = ref(1)
const paperPt = ref(1)

const paperProportion = ref(0)
const metalProportion = ref(0)
const plasticProportion = ref(0)
const glassProportion = ref(0)

const volumeItems = computed(() => [
  { key: 'plastic', label: '膠樽', value: plasticProportion.value },
  { key: 'metal', label: '金屬', value: metalProportion.value },
  { key: 'glass', label: '玻璃', value: glassProportion.value },
  { key: 'paper', label: '紙張', value: paperProportion.value }
])

const goToRecycle = () => {
  WebSocketService.getInstance().openAsMember()
}

const goToNonmember = () => {
  WebSocketService.getInstance().openAsNonMember()
}

const handleRateConfig = (config: Record<string, any>) => {
  if (config.plastic != null) plasticPt.value = config.plastic
  if (config.metal != null) metalPt.value = config.metal
  if (config.glass != null) glassPt.value = config.glass
  if (config.paper != null) paperPt.value = config.paper
}

const handleProportion = (data: Record<string, number>) => {
  if (data.paper != null) paperProportion.value = data.paper
  if (data.metal != null) metalProportion.value = data.metal
  if (data.plastic != null) plasticProportion.value = data.plastic
  if (data.glass != null) glassProportion.value = data.glass
}

onMounted(() => {
  eventBus.on('ws-rate-config', handleRateConfig)
  eventBus.on('ws-proportion', handleProportion)
  // 读取已缓存的容量数据
  const cached = WebSocketService.getInstance().proportion
  handleProportion(cached)
})

onUnmounted(() => {
  eventBus.off('ws-rate-config', handleRateConfig)
  eventBus.off('ws-proportion', handleProportion)
})
</script>

<style scoped>
/* 基于 1080x1920 屏幕 */
.title-img {
  position: absolute;
  width: 749px;
  top: 259px;
  left: 50%;
  transform: translateX(-50%);
}

.member-wrap {
  position: absolute;
  top: 605px;
  left: 86px;
  z-index: 10;
}

.member-img {
  width: 403px;
}

.non-member-wrap {
  position: absolute;
  top: 605px;
  right: 86px;
  z-index: 10;
}

.non-member-img {
  width: 403px;
}

.btn-hint-img {
  position: absolute;
  width: 720px;
  top: 1253px;
  left: 50%;
  transform: translateX(-50%);
}

.bg-banner-img {
  position: absolute;
  width: 100%;
  height: auto;
  bottom: 0;
  left: 0;
}

/* 容量标签 - 放入banner内左上角 */
.volume-label-img {
  position: absolute;
  width: 160px;
  bottom: 330px;
  left: 40px;
}

/* 动态容量进度条 - 在容量标签下方居中 */
.volume-bar-pos {
  position: absolute;
  bottom: 50px;
  left: 120px;
  transform: translateX(-50%);
}

/* 本機可回收标签 - 放入banner内右上角 */
.recyclables-label {
  position: absolute;
  bottom: 270px;
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
  font-size: 30px;
  color: #666666;
  margin-left: 12px;
}

/* 分类图标位置 - 四个图标均匀分布，避开左侧容量组 */
/* 图标宽度 175px，从 250px 开始，间距约 26px */
.plastic-pos {
  position: absolute;
  bottom: 60px;
  left: 250px;
}

.metal-pos {
  position: absolute;
  bottom: 60px;
  left: 451px;
}

.glass-pos {
  position: absolute;
  bottom: 60px;
  left: 652px;
}

.paper-pos {
  position: absolute;
  bottom: 60px;
  left: 853px;
}
</style>
