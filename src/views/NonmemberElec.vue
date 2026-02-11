<template>
  <GlobalBg>
    <!-- 标题：请将回收物放入回收槽 -->
    <img class="title-img" src="@/assets/folder/2/请将回收物放入回收槽.png" />

    <!-- 两个分类区域 -->
    <div class="category-row">
      <div class="category-item">
        <img class="icon-elec" src="@/assets/folder/2/Layer 27.png" />
        <span class="label-zh">小型家電</span>
        <span class="label-en">Electronic</span>
        <span class="label-en">Appliances</span>
      </div>
      <div class="category-item">
        <img class="icon-power" src="@/assets/folder/2/Layer 28.png" />
        <span class="label-zh">充電池</span>
        <span class="label-en">Rechargeable</span>
        <span class="label-en">Batteries</span>
      </div>
    </div>

    <!-- 两个数量显示 -->
    <div class="count-row">
      <div class="count-item">
        <span class="count-num">{{ (electronicWeight / 1000).toFixed(2) }}</span>
        <span class="count-unit">kg</span>
      </div>
      <div class="count-item">
        <span class="count-num">{{ (batteryWeight / 1000).toFixed(2) }}</span>
        <span class="count-unit">kg</span>
      </div>
    </div>

    <!-- 完成按钮 -->
    <LoadingButton class="finish-btn-wrap" @click="onFinish">
      <img class="finish-btn" src="@/assets/folder/2/button.png" />
    </LoadingButton>

    <!-- 底部banner -->
    <img class="bottom-banner" src="@/assets/folder/2/banner-elec.png" />
    <!-- 底部积分数字覆盖 -->
    <span class="pt-overlay pt-elec">{{ elecPt }}</span>
    <span class="pt-overlay pt-power">{{ powerPt }}</span>

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

const electronicWeight = ref(0)
const batteryWeight = ref(0)

const elecPt = ref(0.5)
const powerPt = ref(0.5)

const handleItemUpdate = (data: Record<string, any>) => {
  if (data.appliance != null) {
    electronicWeight.value = Math.round((electronicWeight.value + data.appliance) * 10) / 10
  }
  if (data.power_bank != null) {
    batteryWeight.value = Math.round((batteryWeight.value + data.power_bank) * 10) / 10
  }
}

const handleRateConfig = (config: Record<string, any>) => {
  if (config.electronicWaste != null) elecPt.value = config.electronicWaste
  if (config.battery != null) powerPt.value = config.battery
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
  top: 680px;
  left: 0;
  width: 1080px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 200px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 280px;
}

.icon-elec {
  width: 160px;
  height: 135px;
  object-fit: contain;
}

.icon-power {
  width: 135px;
  height: 135px;
  object-fit: contain;
}

.label-zh {
  font-size: 38px;
  color: #333333;
  font-weight: bold;
  margin-top: 20px;
}

.label-en {
  font-size: 27px;
  color: #666666;
  text-align: center;
  line-height: 1.4;
}

.count-row {
  position: absolute;
  top: 960px;
  left: 0;
  width: 1080px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 200px;
}

.count-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 280px;
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
  bottom: 145px;
}

.pt-elec {
  left: 250px;
}

.pt-power {
  left: 640px;
}
</style>
