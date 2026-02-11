<template>
  <GlobalBg>
    <!-- 標題：箱門正在關閉 Door is Closing -->
    <img class="title-img" src="@/assets/folder/hkstp-rvm/箱門正在關閉 Door is Closing.png" />

    <!-- 中間警示 icon -->
    <img class="center-icon" src="@/assets/folder/hkstp-rvm/icon.png" />

    <!-- 底部警告提示 -->
    <img class="caution-img" src="@/assets/folder/hkstp-rvm/caution.png" />
  </GlobalBg>
</template>

<script setup lang="ts">
import GlobalBg from '@/components/GlobalBg.vue'
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
  transform: translate(-50%, -50%);
}

.caution-img {
  position: absolute;
  width: 620px;
  bottom: 360px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
