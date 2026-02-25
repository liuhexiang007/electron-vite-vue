<template>
  <GlobalBg>
    <!-- 標題：請關閉回收機櫃門 -->
    <img class="title-img" src="@/assets/folder/hkstp-rvm/請關閉回收機櫃門 Please close the door manually.png" />

    <!-- 中間手動關門 icon -->
    <img class="center-icon" src="@/assets/folder/hkstp-rvm/手动关门icon.png" />

    <!-- 確認按鈕 -->
    <!-- <LoadingButton class="confirm-btn-wrap" @click="onConfirm">
      <img class="confirm-btn" src="@/assets/folder/hkstp-rvm/button.png" />
    </LoadingButton> -->
  </GlobalBg>
</template>

<script setup lang="ts">
import GlobalBg from '@/components/GlobalBg.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { WebSocketService } from '@/utils/WebSocketService'

const onConfirm = () => {
  // 上報 CONFIRM 動作到 /app/report
  WebSocketService.getInstance().sendToServer('CONFIRM', {})
}
</script>

<style scoped>
.title-img {
  position: absolute;
  width: 750px;
  top: 280px;
  left: 50%;
  transform: translateX(-50%);
}

.center-icon {
  position: absolute;
  width: 360px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
}

.confirm-btn-wrap {
  position: absolute;
  bottom: 420px;
  left: 50%;
  transform: translateX(-50%);
}

.confirm-btn {
  width: 320px;
}
</style>
