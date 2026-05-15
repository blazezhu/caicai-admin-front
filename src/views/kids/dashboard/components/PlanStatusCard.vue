<template>
  <div class="plan-status-card">
    <h3 class="section-title">今日计划</h3>

    <div class="status-summary">
      <div class="status-item">
        <span class="status-value completed">{{ planStatus.todayCompleted || 0 }}</span>
        <span class="status-label">已完成</span>
      </div>
      <div class="status-divider">/</div>
      <div class="status-item">
        <span class="status-value">{{ planStatus.todayTotal || 0 }}</span>
        <span class="status-label">总计</span>
      </div>
      <div class="status-rate">
        <span class="rate-value">{{ Math.round(planStatus.todayRate || 0) }}%</span>
        <span class="rate-stars">{{ getStars(planStatus.todayRate || 0) }}</span>
      </div>
    </div>

    <!-- 今日计划详情列表 - 滚动显示 -->
    <div v-if="planStatus.todayPlans && planStatus.todayPlans.length > 0" class="plans-container">
      <!-- 滚动区域 -->
      <div class="plans-scroll-wrapper" :style="scrollWrapperStyle">
        <div class="plans-scroll-content" :class="{ scrolling: isScrolling }">
          <!-- 第一份数据 -->
          <div
            v-for="plan in planStatus.todayPlans"
            :key="'first-' + plan.instanceId"
            class="plan-item"
            :class="{ 'plan-completed': plan.status === 2 }"
          >
            <div class="plan-header">
              <div class="plan-info">
                <span class="plan-status-icon" :class="getStatusClass(plan.status)">
                  {{ getStatusIcon(plan.status) }}
                </span>
                <span class="plan-name">{{ plan.planName }}</span>
              </div>
              <span class="plan-status-text" :class="getStatusTextClass(plan.status)">
                {{ plan.statusText }}
              </span>
            </div>
            <div v-if="plan.actions && plan.actions.length > 0" class="action-list">
              <div
                v-for="action in plan.actions"
                :key="action.actionId"
                class="action-item"
                :class="{ 'action-completed': action.isCompleted === 1 }"
              >
                <span class="action-check">
                  {{ action.isCompleted === 1 ? '✓' : '○' }}
                </span>
                <span class="action-name">{{ action.actionName }}</span>
                <span
                  class="action-points"
                  :class="{ 'points-positive': action.pointDelta > 0, 'points-negative': action.pointDelta < 0 }"
                >
                  {{ formatPointDelta(action.pointDelta) }}
                </span>
              </div>
            </div>
          </div>
          <!-- 第二份数据（无缝滚动用） -->
          <div
            v-for="plan in planStatus.todayPlans"
            :key="'second-' + plan.instanceId"
            class="plan-item"
            :class="{ 'plan-completed': plan.status === 2 }"
          >
            <div class="plan-header">
              <div class="plan-info">
                <span class="plan-status-icon" :class="getStatusClass(plan.status)">
                  {{ getStatusIcon(plan.status) }}
                </span>
                <span class="plan-name">{{ plan.planName }}</span>
              </div>
              <span class="plan-status-text" :class="getStatusTextClass(plan.status)">
                {{ plan.statusText }}
              </span>
            </div>
            <div v-if="plan.actions && plan.actions.length > 0" class="action-list">
              <div
                v-for="action in plan.actions"
                :key="'second-action-' + action.actionId"
                class="action-item"
                :class="{ 'action-completed': action.isCompleted === 1 }"
              >
                <span class="action-check">
                  {{ action.isCompleted === 1 ? '✓' : '○' }}
                </span>
                <span class="action-name">{{ action.actionName }}</span>
                <span
                  class="action-points"
                  :class="{ 'points-positive': action.pointDelta > 0, 'points-negative': action.pointDelta < 0 }"
                >
                  {{ formatPointDelta(action.pointDelta) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 滚动指示器 -->
      <div v-if="needsScroll && planStatus.todayPlans.length > visibleCount" class="scroll-indicator">
        <span class="indicator-dot" :class="{ active: !isScrolling }"></span>
        <span class="indicator-text">{{ currentIndex + 1 }}/{{ planStatus.todayPlans.length }}</span>
        <span class="indicator-dot" :class="{ active: isScrolling }"></span>
      </div>
    </div>

    <!-- 无计划时的提示 -->
    <div v-else class="no-plans">
      <span class="no-plans-icon">📋</span>
      <span class="no-plans-text">今日暂无计划</span>
    </div>

    <div class="week-summary">
      <div class="week-item">
        <span class="week-label">本周</span>
        <span class="week-value">{{ planStatus.weekCompleted || 0 }}/{{ planStatus.weekTotal || 0 }}</span>
      </div>
      <el-progress
        :percentage="Math.round(planStatus.weekRate || 0)"
        :stroke-width="6"
        :show-text="false"
        color="#667eea"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PlanStatus } from '@/api/kids/dashboard'

defineOptions({ name: 'PlanStatusCard' })

const props = withDefaults(
  defineProps<{
    planStatus: PlanStatus
  }>(),
  {
    planStatus: () => ({
      todayTotal: 0,
      todayCompleted: 0,
      todayRate: 0,
      weekCompleted: 0,
      weekTotal: 0,
      weekRate: 0,
      pendingToday: [],
      todayPlans: []
    })
  }
)

// 自动滚动相关
const scrollWrapperRef = ref<HTMLElement>()
const isScrolling = ref(false)
const currentIndex = ref(0)
const scrollInterval = ref<number>()
const animationFrame = ref<number>()

// 每次显示的计划数量
const visibleCount = ref(3)

// 是否需要滚动
const needsScroll = computed(() => {
  return (props.planStatus.todayPlans?.length || 0) > visibleCount.value
})

// 滚动配置
const scrollDuration = 800 // 滚动动画时长(ms)
const pauseDuration = 3000 // 滚动间隔时间(ms)

// 计算单个计划项的高度
const singlePlanHeight = 90 // 估算每个计划项的高度

// 滚动容器样式
const scrollWrapperStyle = computed(() => ({
  '--scroll-height': `${singlePlanHeight * visibleCount.value}px`
}))

// 开始自动滚动
const startAutoScroll = () => {
  if (!needsScroll.value) return

  scrollInterval.value = window.setInterval(() => {
    scrollToNext()
  }, pauseDuration)
}

// 滚动到下一个
const scrollToNext = () => {
  const wrapper = scrollWrapperRef.value
  if (!wrapper) return

  const plans = props.planStatus.todayPlans || []
  if (plans.length <= 1) return

  isScrolling.value = true
  currentIndex.value = (currentIndex.value + 1) % plans.length

  const scrollTop = singlePlanHeight
  const startTop = wrapper.scrollTop
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / scrollDuration, 1)

    // 使用 easeInOutCubic 缓动函数
    const easeProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2

    wrapper.scrollTop = startTop + (scrollTop - startTop) * easeProgress

    if (progress < 1) {
      animationFrame.value = requestAnimationFrame(animate)
    } else {
      // 滚动完成，复位到起点实现无缝
      if (currentIndex.value === 0) {
        wrapper.scrollTop = 0
      }
      isScrolling.value = false
    }
  }

  animationFrame.value = requestAnimationFrame(animate)
}

// 停止滚动
const stopAutoScroll = () => {
  if (scrollInterval.value) {
    clearInterval(scrollInterval.value)
    scrollInterval.value = undefined
  }
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = undefined
  }
}

// 监听数据变化，重新启动滚动
watch(() => props.planStatus.todayPlans, (newPlans) => {
  stopAutoScroll()
  currentIndex.value = 0
  if (scrollWrapperRef.value) {
    scrollWrapperRef.value.scrollTop = 0
  }
  if (newPlans && newPlans.length > visibleCount.value) {
    nextTick(() => {
      startAutoScroll()
    })
  }
}, { immediate: true })

// 组件卸载时清理
onUnmounted(() => {
  stopAutoScroll()
})

const getStars = (rate: number) => {
  if (rate >= 100) return '⭐⭐⭐'
  if (rate >= 66) return '⭐⭐'
  if (rate >= 33) return '⭐'
  return ''
}

const getStatusIcon = (status: number) => {
  switch (status) {
    case 0: return '⏳'
    case 1: return '🔄'
    case 2: return '✅'
    case 3: return '❌'
    default: return '❓'
  }
}

const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'status-pending'
    case 1: return 'status-doing'
    case 2: return 'status-completed'
    case 3: return 'status-expired'
    default: return ''
  }
}

const getStatusTextClass = (status: number) => {
  switch (status) {
    case 0: return 'text-pending'
    case 1: return 'text-doing'
    case 2: return 'text-completed'
    case 3: return 'text-expired'
    default: return ''
  }
}

const formatPointDelta = (delta: number) => {
  if (delta > 0) return `+${delta}`
  if (delta < 0) return `${delta}`
  return '0'
}
</script>

<style lang="scss" scoped>
.plan-status-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  min-height: 380px;
  max-height: 480px;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.status-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.status-item {
  text-align: center;

  .status-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    line-height: 1;

    &.completed {
      color: #67c23a;
    }
  }

  .status-label {
    font-size: 11px;
    color: #909399;
  }
}

.status-divider {
  font-size: 20px;
  color: #c0c4cc;
}

.status-rate {
  margin-left: auto;
  text-align: right;

  .rate-value {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #667eea;
  }

  .rate-stars {
    font-size: 12px;
  }
}

// 滚动容器
.plans-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.plans-scroll-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  max-height: var(--scroll-height, 270px);
}

.plans-scroll-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

// 计划项
.plan-item {
  background: #f8f9fb;
  border-radius: 10px;
  padding: 10px;
  border-left: 3px solid #e0e0e0;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &.plan-completed {
    background: #f0f9eb;
    border-left-color: #67c23a;
  }
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.plan-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.plan-status-icon {
  font-size: 14px;

  &.status-pending { color: #909399; }
  &.status-doing { color: #409eff; }
  &.status-completed { color: #67c23a; }
  &.status-expired { color: #f56c6c; }
}

.plan-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.plan-status-text {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 8px;

  &.text-pending {
    color: #909399;
    background: #f4f4f5;
  }
  &.text-doing {
    color: #409eff;
    background: #ecf5ff;
  }
  &.text-completed {
    color: #67c23a;
    background: #f0f9eb;
  }
  &.text-expired {
    color: #f56c6c;
    background: #fef0f0;
  }
}

// 动作列表
.action-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 20px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
  padding: 2px 0;

  &.action-completed {
    color: #67c23a;

    .action-check {
      color: #67c23a;
    }
  }
}

.action-check {
  font-size: 11px;
  color: #c0c4cc;
  width: 14px;
}

.action-name {
  flex: 1;
}

.action-points {
  font-size: 11px;
  font-weight: 600;
  min-width: 32px;
  text-align: right;

  &.points-positive {
    color: #67c23a;
  }
  &.points-negative {
    color: #f56c6c;
  }
}

// 滚动指示器
.scroll-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0 4px;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d0d0d0;
  transition: all 0.3s ease;

  &.active {
    background: #667eea;
    width: 18px;
    border-radius: 3px;
  }
}

.indicator-text {
  font-size: 11px;
  color: #909399;
  min-width: 40px;
  text-align: center;
}

// 无计划提示
.no-plans {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #909399;

  .no-plans-icon {
    font-size: 28px;
    margin-bottom: 6px;
  }

  .no-plans-text {
    font-size: 13px;
  }
}

.week-summary {
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  margin-top: auto;
}

.week-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  .week-label {
    font-size: 12px;
    color: #606266;
  }

  .week-value {
    font-size: 12px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
