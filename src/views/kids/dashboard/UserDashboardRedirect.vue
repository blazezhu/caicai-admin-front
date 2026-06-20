<template>
  <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;">
    <div class="spinner"></div>
    <div style="color:#666;">正在跳转到大屏...</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 获取当前 URL 的查询参数
  const params = new URLSearchParams(window.location.search)
  const queryString = params.toString()
  // 跳转到独立的大屏页面
  window.location.href = `/dashboard.html${queryString ? '?' + queryString : ''}`
})
</script>

<style scoped>
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #FF8C61;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
