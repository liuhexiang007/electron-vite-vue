<template>
  <GlobalBg>
    <!-- 标题：请将回收物放入回收槽 -->
    <img class="title-img" src="@/assets/folder/2/请将回收物放入回收槽.png" />

    <!-- 四个分类区域 -->
    <div class="category-row">
      <div class="category-item">
        <img class="icon-plastic" src="@/assets/folder/2/plastic.png" />
        <span class="label-zh">膠樽</span>
        <span class="label-en">Plastic Bottles</span>
      </div>
      <div class="category-item">
        <img class="icon-metal" src="@/assets/folder/2/metal.png" />
        <span class="label-zh">金屬罐</span>
        <span class="label-en">Aluminium</span>
        <span class="label-en">Cans</span>
      </div>
      <div class="category-item">
        <img class="icon-glass" src="@/assets/folder/2/glass.png" />
        <span class="label-zh">玻璃樽</span>
        <span class="label-en">Glass Bottles</span>
      </div>
      <div class="category-item">
        <img class="icon-paper" src="@/assets/folder/2/fileee.png" />
        <span class="label-zh">紙張</span>
        <span class="label-en">Paper</span>
      </div>
    </div>

    <!-- 四个数量显示 -->
    <div class="count-row">
      <div class="count-item">
        <span class="count-num">{{ plasticCount }}</span>
        <span class="count-unit">PCS</span>
      </div>
      <div class="count-item">
        <span class="count-num">{{ metalCount }}</span>
        <span class="count-unit">PCS</span>
      </div>
      <div class="count-item">
        <span class="count-num">{{ glassCount }}</span>
        <span class="count-unit">PCS</span>
      </div>
      <div class="count-item">
        <span class="count-num">{{ (paperWeight / 1000).toFixed(2) }}</span>
        <span class="count-unit">kg</span>
      </div>
    </div>

    <!-- 完成按钮 -->
    <LoadingButton class="finish-btn-wrap" @click="onFinish">
      <img class="finish-btn" src="@/assets/folder/2/button.png" />
    </LoadingButton>

    <!-- 底部banner -->
    <img class="bottom-banner" src="@/assets/folder/2/point banner.png" />
    <!-- 底部积分数字覆盖 -->
    <span class="pt-overlay pt-plastic">{{ plasticPt }}</span>
    <span class="pt-overlay pt-metal">{{ metalPt }}</span>
    <span class="pt-overlay pt-glass">{{ glassPt }}</span>
    <span class="pt-overlay pt-paper">{{ paperPt }}</span>

    <!-- 倒计时 -->
    <CountdownSmall :initialCount="30" @timeout="onTimeout" />
  </GlobalBg>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GlobalBg from '@/components/GlobalBg.vue'
import CountdownSmall from '@/components/CountdownSmall.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { WebSocketService, eventBus } from '@/utils/WebSocketService'

const plasticCount = ref(0)
const metalCount = ref(0)
const glassCount = ref(0)
const paperWeight = ref(0)

const plasticPt = ref(1)
const metalPt = ref(1)
const glassPt = ref(1)
const paperPt = ref(1)

const handleItemUpdate = (data: Record<string, any>) => {
  if (data.plastic_bottle != null) {
    plasticCount.value = Math.round((plasticCount.value + data.plastic_bottle) * 10) / 10
  }
  if (data.can != null) {
    metalCount.value = Math.round((metalCount.value + data.can) * 10) / 10
  }
  if (data.glass_bottle != null) {
    glassCount.value = Math.round((glassCount.value + data.glass_bottle) * 10) / 10
  }
  if (data.carton != null) {
    paperWeight.value = Math.round((paperWeight.value + data.carton) * 10) / 10
  }
}

const handleRateConfig = (config: Record<string, any>) => {
  if (config.plastic != null) plasticPt.value = config.plastic
  if (config.metal != null) metalPt.value = config.metal
  if (config.glass != null) glassPt.value = config.glass
  if (config.paper != null) paperPt.value = config.paper
}

const onFinish = () => {
  WebSocketService.getInstance().close()
}

const onTimeout = () => {
  WebSocketService.getInstance().close()
}

onMounted(() => {
  eventBus.on('ws-item-update', handleItemUpdate)
  eventBus.on('ws-rate-config', handleRateConfig)
})

onUnmounted(() => {
  eventBus.off('ws-item-update', handleItemUpdate)
  eventBus.off('ws-rate-config', handleRateConfig)
})
</script>

<style scoped>
.title-img {
  position: absolute;
  width: 800px;
  top: 420px;
  left: 50%;
  transform: translateX(-50%);
}

.category-row {
  position: absolute;
  top: 720px;
  left: 0;
  width: 1080px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 60px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 190px;
}

.icon-plastic,
.icon-metal {
  width: 95px;
  height: 135px;
  object-fit: contain;
}

.icon-glass {
  width: 68px;
  height: 135px;
  object-fit: contain;
}

.icon-paper {
  width: 88px;
  height: 135px;
  object-fit: contain;
}

.label-zh {
  font-size: 35px;
  color: #333333;
  font-weight: bold;
  margin-top: 20px;
}

.label-en {
  font-size: 24px;
  color: #666666;
  text-align: center;
  line-height: 1.3;
}

.count-row {
  position: absolute;
  top: 1000px;
  left: 0;
  width: 1080px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 60px;
}

.count-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 190px;
}

.count-num {
  font-size: 80px;
  font-weight: bold;
  color: #ff6f11;
}

.count-unit {
  font-size: 32px;
  font-weight: bold;
  color: #ff6f11;
}

.finish-btn-wrap {
  position: absolute;
  bottom: 504px;
  left: 50%;
  transform: translateX(-50%);
}

.finish-btn {
  width: 403px;
}

.bottom-banner {
  position: absolute;
  width: 100%;
  height: auto;
  bottom: 0;
  left: 0;
}

/* 底部积分数字覆盖 - 均匀分布在 banner 上 */
.pt-overlay {
  position: absolute;
  font-size: 54px;
  font-weight: bold;
  color: #ff6f11;
  bottom: 150px;
}

.pt-plastic {
  left: 90px;
}

.pt-metal {
  left: 290px;
}

.pt-glass {
  left: 490px;
}

.pt-paper {
  left: 690px;
}
</style>
