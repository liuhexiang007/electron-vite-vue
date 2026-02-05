<template>
  <GlobalBg>
    <!-- 扫描二维码整体图片 -->
    <img class="scan-qr-img" src="@/assets/folder/4/扫描二维码.png" />

    <!-- 中心扫码图案 -->
    <img class="scan-icon" src="@/assets/folder/1/scan_qr.png" />

    <!-- 取消按钮 -->
    <Clickable class="cancel-btn-wrap" @click="goBack">
      <img class="cancel-btn" src="@/assets/folder/1/button.png" />
    </Clickable>

    <!-- 倒计时 -->
    <Countdown :initialCount="30" @timeout="goBack" />
  </GlobalBg>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import GlobalBg from '@/components/GlobalBg.vue'
import Countdown from '@/components/Countdown.vue'
import Clickable from '@/components/Clickable.vue'
import { WebSocketService } from '@/utils/WebSocketService'

const router = useRouter()

const goBack = () => {
  const ws = WebSocketService.getInstance()
  if (ws.uiType === 1) {
    router.replace('/recycle')
  } else {
    router.replace('/')
  }
}
</script>

<style scoped>
.scan-qr-img {
  position: absolute;
  width: 820px;
  top: 450px;
  left: 50%;
  transform: translateX(-50%);
}

.scan-icon {
  position: absolute;
  width: 400px;
  top: 700px;
  left: 50%;
  transform: translateX(-50%);
}

.cancel-btn-wrap {
  position: absolute;
  bottom: 480px;
  left: 50%;
  transform: translateX(-50%);
}

.cancel-btn {
  width: 360px;
}
</style>
