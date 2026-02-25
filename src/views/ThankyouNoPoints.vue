<template>
  <GlobalBg>
    <!-- 感谢回收标题 -->
    <img class="thankyou-img" src="@/assets/folder/4/感谢回收.png" />

    <!-- 中心coins图案 -->
    <img class="coins-img" src="@/assets/folder/3/coins.png" />

    <!-- 完成按钮 -->
    <Clickable class="finish-btn-wrap" @click="goHome">
      <img class="finish-btn" src="@/assets/folder/3/button.png" />
    </Clickable>

    <!-- 倒计时 -->
    <Countdown :initialCount="60" @timeout="goHome" />
  </GlobalBg>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import GlobalBg from '@/components/GlobalBg.vue'
import Countdown from '@/components/Countdown.vue'
import Clickable from '@/components/Clickable.vue'
import { WebSocketService } from '@/utils/WebSocketService'

const router = useRouter()

const goHome = () => {
  const ws = WebSocketService.getInstance()
  // uiType=1 是二合一(电子产品) → /recycle, uiType=0 是四合一 → /
  if (ws.uiType === 1) {
    router.replace('/recycle')
  } else {
    router.replace('/')
  }
}
</script>

<style scoped>
.thankyou-img {
  position: absolute;
  width: 400px;
  top: 380px;
  left: 50%;
  transform: translateX(-50%);
}

.coins-img {
  position: absolute;
  width: 220px;
  top: 700px;
  left: 50%;
  transform: translateX(-50%);
}

.finish-btn-wrap {
  position: absolute;
  bottom: 700px;
  left: 50%;
  transform: translateX(-50%);
}

.finish-btn {
  width: 360px;
}
</style>
