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

    <!-- 今日计划详情列表 -->
    <div v-if="planStatus.todayPlans && planStatus.todayPlans.length > 0" class="plans-container">
      <div class="plans-scroll-wrapper" ref="scrollWrapperRef">
        <div class="plans-scroll-content">
          <div
            v-for="plan in planStatus.todayPlans"
            :key="plan.instanceId"
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
                class="action-item-wrapper"
              >
                <div
                  class="action-item"
                  :class="{
                    'action-completed': action.isCompleted === 1,
                    'action-clickable': action.isCompleted !== 1 && !isPendingAction(action) && action.hasBranch !== 1,
                    'action-pending': isPendingAction(action),
                    'action-branch-pending': action.hasBranch === 1 && isSelectingBranch(action)
                  }"
                  @click="handleActionClick(plan.instanceId, action)"
                >
                  <span class="action-check">
                    {{ action.isCompleted === 1 ? '✓' : isPendingAction(action) ? '?' : isSelectingBranch(action) ? '!' : '○' }}
                  </span>
                  <span class="action-name">{{ action.actionName }}</span>
                  <span v-if="isPendingAction(action)" class="confirm-hint">点击确认</span>
                  <span v-else-if="isSelectingBranch(action)" class="confirm-hint">选分支</span>
                  <span
                    v-else
                    class="action-points"
                    :class="{ 'points-positive': action.pointDelta > 0, 'points-negative': action.pointDelta < 0 }"
                  >
                    {{ formatPointDelta(action.pointDelta) }}
                  </span>
                </div>
                <div v-if="action.hasBranch === 1 && isSelectingBranch(action)" class="branch-options">
                  <div
                    v-for="branch in action.branches"
                    :key="branch.id"
                    class="branch-item"
                    :class="{ 'branch-selected': selectedBranchId === branch.id }"
                    @click.stop="handleBranchSelect(plan.instanceId, action, branch)"
                  >
                    <span class="branch-name">{{ branch.branchName }}</span>
                    <span v-if="branch.conditionDesc" class="branch-desc">{{ branch.conditionDesc }}</span>
                    <span
                      class="branch-points"
                      :class="{ 'points-positive': branch.pointDelta > 0, 'points-negative': branch.pointDelta < 0 }"
                    >
                      {{ branch.pointDelta > 0 ? '+' : '' }}{{ branch.pointDelta }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
import { ElMessage } from 'element-plus'
import * as DashboardApi from '@/api/kids/dashboard'
import type { PlanStatus, PlanAction } from '@/api/kids/dashboard'

defineOptions({ name: 'PlanStatusCard' })

const props = withDefaults(
  defineProps<{
    planStatus: PlanStatus
    ownerUserId?: number
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
    }),
    ownerUserId: undefined
  }
)

// 事件
const emit = defineEmits<{
  (e: 'action-completed'): void
}>()

// 确认状态相关
const pendingAction = ref<{ instanceId: number; action: PlanAction } | null>(null)
const pendingTimer = ref<number>()
const selectedBranchId = ref<number | null>(null)

// 处理动作点击
const handleActionClick = async (instanceId: number, action: PlanAction) => {
  // 已完成的动作不能点击
  if (action.isCompleted === 1) return

  // 没有 ownerUserId 则无法完成
  if (!props.ownerUserId) {
    ElMessage.warning('无法完成动作：缺少用户信息')
    return
  }

  // 如果有分支且没有选中分支，进入选择分支状态
  if (action.hasBranch === 1 && selectedBranchId.value === null) {
    cancelPending()
    pendingAction.value = { instanceId, action }
    selectedBranchId.value = null  // 重置分支选择
    return
  }

  // 如果已有待确认的动作，点击其他动作会取消当前选择
  if (pendingAction.value && pendingAction.value.action.actionId !== action.actionId) {
    cancelPending()
  }

  // 如果是同一动作再次点击，确认完成
  if (pendingAction.value && pendingAction.value.action.actionId === action.actionId) {
    clearTimeout(pendingTimer.value)
    pendingAction.value = null
    await confirmAction(instanceId, action)
    selectedBranchId.value = null
    return
  }

  // 第一次点击，进入待确认状态
  pendingAction.value = { instanceId, action }
  pendingTimer.value = window.setTimeout(() => {
    pendingAction.value = null
    selectedBranchId.value = null
  }, 1500)  // 1.5秒后自动取消
}

// 选择分支
const handleBranchSelect = async (instanceId: number, action: PlanAction, branch: BranchOption) => {
  selectedBranchId.value = branch.id

  // 短暂延迟后自动确认
  await new Promise(resolve => setTimeout(resolve, 300))
  pendingAction.value = null
  selectedBranchId.value = null
  await confirmActionWithBranch(instanceId, action, branch.id)
}

// 取消待确认状态
const cancelPending = () => {
  if (pendingTimer.value) {
    clearTimeout(pendingTimer.value)
    pendingTimer.value = undefined
  }
  pendingAction.value = null
  selectedBranchId.value = null
}

// 判断是否在选择分支状态
const isSelectingBranch = (action: PlanAction) => {
  return pendingAction.value?.action.actionId === action.actionId && action.hasBranch === 1 && selectedBranchId.value === null
}

// 判断动作是否处于待确认状态
const isPendingAction = (action: PlanAction) => {
  return pendingAction.value?.action.actionId === action.actionId
}

// 确认完成动作（无分支）
const confirmAction = async (instanceId: number, action: PlanAction) => {
  try {
    await DashboardApi.completeAction(instanceId, action.actionId, props.ownerUserId!)
    ElMessage.success(`${action.actionName} 已完成！`)
    emit('action-completed')
  } catch (e: any) {
    ElMessage.error('完成动作失败：' + (e.message || '未知错误'))
  }
}

// 确认完成动作（有分支）
const confirmActionWithBranch = async (instanceId: number, action: PlanAction, branchId: number) => {
  try {
    await DashboardApi.completeActionWithBranch(instanceId, action.actionId, branchId, props.ownerUserId!)
    ElMessage.success(`${action.actionName} 已完成！`)
    emit('action-completed')
  } catch (e: any) {
    ElMessage.error('完成动作失败：' + (e.message || '未知错误'))
  }
}

// 滚动相关变量（保留用于手动滚动场景）
const scrollWrapperRef = ref<HTMLElement>()

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
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  min-height: 600px;
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
  overflow-y: auto;
  position: relative;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a1a1a1;
    }
  }
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

  &.action-clickable {
    cursor: pointer;
    border-radius: 4px;
    padding: 2px 4px;
    margin: 0 -4px;
    transition: all 0.2s ease;

    &:hover {
      background: #e8f4ff;
      color: #409eff;
    }

    .action-check {
      color: #409eff;
    }
  }

  &.action-pending {
    cursor: pointer;
    border-radius: 4px;
    padding: 4px 6px;
    margin: 0 -4px;
    background: #fff3e0;
    border: 1px solid #ffb800;
    color: #fa8c16;
    animation: pulse 0.6s ease-in-out infinite alternate;

    .action-check {
      color: #fa8c16;
      font-weight: bold;
    }
  }

  &.action-branch-pending {
    cursor: pointer;
    border-radius: 4px;
    padding: 4px 6px;
    margin: 0 -4px;
    background: #e3f2fd;
    border: 1px solid #409eff;
    color: #409eff;

    .action-check {
      color: #409eff;
    }
  }

  &.action-completed {
    color: #67c23a;

    .action-check {
      color: #67c23a;
    }
  }
}

.action-item-wrapper {
  display: flex;
  flex-direction: column;
}

// 分支选项
.branch-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 0 4px 24px;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f9eb;
  border: 1px solid #67c23a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #d4edda;
    transform: scale(1.02);
  }

  &.branch-selected {
    background: #67c23a;
    border-color: #67c23a;
    color: #fff;

    .branch-points {
      color: #fff;
    }
  }
}

.branch-name {
  font-size: 12px;
  font-weight: 600;
  color: inherit;
}

.branch-desc {
  font-size: 10px;
  color: #909399;
  flex: 1;
}

.branch-points {
  font-size: 11px;
  font-weight: 600;
}

@keyframes pulse {
  from {
    background: #fff3e0;
    transform: scale(1);
  }
  to {
    background: #ffe7b3;
    transform: scale(1.02);
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

.confirm-hint {
  font-size: 10px;
  color: #fa8c16;
  font-weight: 600;
  white-space: nowrap;
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
