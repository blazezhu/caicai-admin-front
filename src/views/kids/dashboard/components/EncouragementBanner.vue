<template>
  <div class="encouragement-banner" :class="type">
    <span class="encouragement-emoji">{{ emoji }}</span>
    <span class="encouragement-message">{{ message }}</span>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'EncouragementBanner' })

withDefaults(
  defineProps<{
    message?: string
    emoji?: string
    type?: string
  }>(),
  {
    message: '每天进步一点点，未来会更棒！',
    emoji: '🌱',
    type: 'default'
  }
)
</script>

<style lang="scss" scoped>
.encouragement-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  animation: pulse 2s ease-in-out infinite;

  &.complete {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    box-shadow: 0 4px 20px rgba(103, 194, 58, 0.4);
  }

  &.streak {
    background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
    box-shadow: 0 4px 20px rgba(245, 108, 108, 0.4);
  }
}

.encouragement-emoji {
  font-size: 28px;
  animation: bounce 1s ease-in-out infinite;
}

.encouragement-message {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
