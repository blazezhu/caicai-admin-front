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

    <div v-if="pendingPlans.length > 0" class="pending-section">
      <div class="pending-title">待完成</div>
      <div class="pending-list">
        <div v-for="plan in pendingPlans" :key="plan.instanceId" class="pending-item">
          <span class="pending-icon">○</span>
          <span class="pending-name">{{ plan.planName }}</span>
        </div>
      </div>
    </div>

    <div class="week-summary">
      <div class="week-item">
        <span class="week-label">本周完成</span>
        <span class="week-value">{{ planStatus.weekCompleted || 0 }} / {{ planStatus.weekTotal || 0 }}</span>
      </div>
      <el-progress
        :percentage="Math.round(planStatus.weekRate || 0)"
        :stroke-width="8"
        :show-text="false"
        color="#667eea"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PlanStatus, PendingPlan } from '@/api/kids/dashboard'

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
      pendingToday: []
    })
  }
)

const pendingPlans = computed(() => {
  return (props.planStatus.pendingToday || []).slice(0, 3)
})

const getStars = (rate: number) => {
  if (rate >= 100) return '⭐⭐⭐'
  if (rate >= 66) return '⭐⭐'
  if (rate >= 33) return '⭐'
  return ''
}
</script>

<style lang="scss" scoped>
.plan-status-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.status-item {
  text-align: center;

  .status-value {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    line-height: 1;

    &.completed {
      color: #67c23a;
    }
  }

  .status-label {
    font-size: 12px;
    color: #909399;
  }
}

.status-divider {
  font-size: 24px;
  color: #c0c4cc;
}

.status-rate {
  margin-left: auto;
  text-align: right;

  .rate-value {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: #667eea;
  }

  .rate-stars {
    font-size: 14px;
  }
}

.pending-section {
  background: #fef0f0;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}

.pending-title {
  font-size: 12px;
  color: #f56c6c;
  margin-bottom: 8px;
  font-weight: 600;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pending-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;

  .pending-icon {
    color: #f56c6c;
  }
}

.week-summary {
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
}

.week-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .week-label {
    font-size: 13px;
    color: #606266;
  }

  .week-value {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
