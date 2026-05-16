<template>
  <div class="goal-progress-ring">
    <svg :width="size" :height="size" class="progress-svg">
      <!-- 背景圆环 -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="bgColor"
        :stroke-width="strokeWidth"
      />
      <!-- 进度圆环 -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="progress-circle"
        :style="{ transform: 'rotate(-90deg)', transformOrigin: 'center' }"
      />
    </svg>
    <div class="progress-content">
      <div class="progress-value">{{ Math.round(progress) }}%</div>
      <div class="progress-label">{{ label }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue'

defineOptions({ name: 'GoalProgressRing' })

const props = withDefaults(
  defineProps<{
    progress: number
    label?: string
    size?: number
    strokeWidth?: number
    progressColor?: string
    bgColor?: string
  }>(),
  {
    progress: 0,
    label: '今日目标',
    size: 120,
    strokeWidth: 8,
    progressColor: '#667eea',
    bgColor: 'rgba(255,255,255,0.3)'
  }
)

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = ref(circumference.value)

watch(
  () => props.progress,
  (newProgress) => {
    const targetOffset = circumference.value * (1 - Math.min(newProgress, 100) / 100)
    animateProgress(targetOffset)
  }
)

const animateProgress = (targetOffset: number) => {
  const startOffset = dashOffset.value
  const duration = 1000
  const startTime = performance.now()

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    dashOffset.value = startOffset + (targetOffset - startOffset) * easeOut

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

onMounted(() => {
  const targetOffset = circumference.value * (1 - Math.min(props.progress, 100) / 100)
  animateProgress(targetOffset)
})
</script>

<style lang="scss" scoped>
.goal-progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 16px;
  padding: 18px;
  color: #fff;
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3);
}

.progress-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.progress-circle {
  transition: stroke-dashoffset 0.1s linear;
}

.progress-content {
  text-align: center;
  z-index: 1;

  .progress-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }

  .progress-label {
    font-size: 10px;
    opacity: 0.9;
    margin-top: 2px;
  }
}
</style>
