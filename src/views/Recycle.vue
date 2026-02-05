<template>
  <GlobalBg>
    <!-- 标题图片 -->
    <img class="title-img" src="@/assets/folder/1/title.png" />
    <!-- 会员卡片 -->
    <Clickable class="member-wrap" @click="goToRecycle">
      <img class="member-img" src="@/assets/folder/1/member.png" />
    </Clickable>
    <!-- 非会员卡片 -->
    <Clickable class="non-member-wrap" @click="goToNonmember">
      <img class="non-member-img" src="@/assets/folder/1/non-member.png" />
    </Clickable>
    <!-- 请按按钮开始回收 -->
    <img class="btn-hint-img" src="@/assets/folder/1/btn-hint.png" />
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
import Clickable from '@/components/Clickable.vue'
import CategoryIcon from '@/components/CategoryIcon.vue'
import { WebSocketService, eventBus } from '@/utils/WebSocketService'

const elecPt = ref(0.5)
const powerPt = ref(0.5)

const goToRecycle = () => {
  WebSocketService.getInstance().openAsMember()
}

const goToNonmember = () => {
  WebSocketService.getInstance().openAsNonMember()
}

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

.volume-label-img {
  position: absolute;
  width: 160px;
  bottom: 330px;
  left: 40px;
}

.group-img {
  position: absolute;
  width: 100px;
  bottom: 80px;
  left: 55px;
}

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
  font-size: 35px;
  color: #666666;
  margin-left: 14px;
}

/* 分类图标位置 - 两个图标均匀分布，避开左侧容量组 */
/* 图标宽度 340px，从 250px 开始 */
.elec-pos {
  position: absolute;
  bottom: 80px;
  left: 250px;
}

.power-pos {
  position: absolute;
  bottom: 80px;
  left: 680px;
}
</style>
