<template>
  <GlobalBg>
    <!-- 感谢回收标题 -->
    <img class="thankyou-img" src="@/assets/folder/4/感谢回收.png" />

    <!-- 中心coins图案 -->
    <img class="coins-img" src="@/assets/folder/3/coins.png" />

    <!-- 获得Green Point -->
    <img class="greenpoint-img" src="@/assets/folder/4/获得Green point.png" />

    <!-- 积分数字和叶子 -->
    <div class="points-wrap">
      <span class="points-num">10</span>
      <img class="leaf-icon" src="@/assets/folder/3/ic_green_point_gp_currency.png" />
    </div>

    <!-- 完成按钮 -->
    <Clickable class="finish-btn-wrap" @click="goHome">
      <img class="finish-btn" src="@/assets/folder/3/button.png" />
    </Clickable>

    <!-- 倒计时 -->
    <Countdown :initialCount="30" @timeout="goHome" />
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

.greenpoint-img {
  position: absolute;
  width: 350px;
  top: 1030px;
  left: 200px;
}

.points-wrap {
  position: absolute;
  top: 1000px;
  right: 240px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.points-num {
  font-size: 120px;
  color: #88bc10;
  font-weight: bold;
}

.leaf-icon {
  width: 80px;
  height: 80px;
  margin-left: 10px;
}

.finish-btn-wrap {
  position: absolute;
  bottom: 480px;
  left: 50%;
  transform: translateX(-50%);
}

.finish-btn {
  width: 360px;
}
</style>
