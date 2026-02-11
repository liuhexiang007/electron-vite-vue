<template>
  <GlobalBg>
    <!-- 標題：請手動打開回收機櫃門 -->
    <img class="title-img" src="@/assets/folder/hkstp-rvm/請手動打開回收機櫃門 Please open the door manually.png" />

    <!-- 中間手動開門 icon -->
    <img class="center-icon" src="@/assets/folder/hkstp-rvm/手动开门icon.png" />

    <!-- 確認按鈕 -->
    <LoadingButton class="confirm-btn-wrap" @click="onConfirm">
      <img class="confirm-btn" src="@/assets/folder/hkstp-rvm/button.png" />
    </LoadingButton>
  </GlobalBg>
</template>

<script setup lang="ts">
import GlobalBg from '@/components/GlobalBg.vue'
import LoadingButton from '@/components/LoadingButton.vue'
import { WebSocketService } from '@/utils/WebSocketService'

const onConfirm = () => {
  // 確認已開門，通知後端
  WebSocketService.getInstance().sendToServer('DOOR_OPENED', {})
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
