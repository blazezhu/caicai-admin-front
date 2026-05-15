<template>
  <div class="dashboard-view" :class="{ loading: pageLoading }">
    <!-- 访问码输入页面 -->
    <div v-if="!isValidated" class="code-entry-page">
      <div class="code-entry-card">
        <div class="entry-header">
          <span class="entry-emoji">🎯</span>
          <h1>欢迎来到我的大屏</h1>
          <p>请输入访问码进入</p>
        </div>
        <el-form ref="codeFormRef" :model="codeForm" :rules="codeRules" @submit.prevent="handleValidate">
          <el-form-item prop="code">
            <el-input
              v-model="codeForm.code"
              placeholder="请输入6位访问码"
              size="large"
              maxlength="6"
              class="code-input"
              @input="codeForm.code = codeForm.code.toUpperCase()"
            >
              <template #prefix>
                <Icon icon="ep:tickets" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="validating"
              class="validate-btn"
              native-type="submit"
            >
              进入大屏
            </el-button>
          </el-form-item>
        </el-form>
        <div v-if="validateError" class="error-message">
          <Icon icon="ep:circle-close" />
          {{ validateError }}
        </div>
      </div>
    </div>

    <!-- 大屏主页面 -->
    <div v-else class="dashboard-content">
      <!-- 顶部导航 -->
      <header class="dashboard-header">
        <div class="header-left">
          <span class="header-title">我的大屏</span>
        </div>
        <div class="header-right">
          <el-button circle @click="handleRefresh">
            <Icon icon="ep:refresh" :class="{ spinning: refreshing }" />
          </el-button>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <main class="dashboard-main">
        <!-- 第一行：用户信息 + 积分余额 + 目标进度 -->
        <div class="dashboard-row row-1">
          <ProfileCard
            :nickname="summary.bookName || summary.nickname"
            :avatar="summary.avatar"
            :level-name="summary.levelName"
            :level-icon="summary.levelIcon"
            class="animate-item"
          />
          <BalanceDisplay
            :amount="summary.currentBalance || 0"
            :today-income="summary.todayIncome || 0"
            :today-expense="summary.todayExpense || 0"
            class="animate-item"
          />
          <GoalProgressRing
            :progress="summary.dailyProgress || 0"
            label="今日目标"
            :size="120"
            class="animate-item"
          />
        </div>

        <!-- 第二行：积分趋势 + 心愿进度 -->
        <div class="dashboard-row row-2">
          <WeekTrendChart
            :data="summary.weekTrend || []"
            class="animate-item"
          />
          <WishProgressList
            :wishes="wishes"
            class="animate-item"
          />
        </div>

        <!-- 第三行：计划状态 + 成就徽章 -->
        <div class="dashboard-row row-3">
          <PlanStatusCard
            :plan-status="planStatus"
            class="animate-item"
          />
          <AchievementWall
            :achievements="achievements"
            class="animate-item"
          />
        </div>

        <!-- 底部鼓励语 -->
        <div class="dashboard-row row-4 animate-item">
          <EncouragementBanner
            :message="encouragement.message"
            :emoji="encouragement.emoji"
            :type="encouragement.type"
          />
        </div>
      </main>
    </div>

    <!-- 加载状态 -->
    <div v-if="pageLoading" class="page-loading">
      <div class="loading-spinner"></div>
      <p>正在加载...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import * as DashboardApi from '@/api/kids/dashboard'

import ProfileCard from './components/ProfileCard.vue'
import BalanceDisplay from './components/BalanceDisplay.vue'
import GoalProgressRing from './components/GoalProgressRing.vue'
import WeekTrendChart from './components/WeekTrendChart.vue'
import WishProgressList from './components/WishProgressList.vue'
import PlanStatusCard from './components/PlanStatusCard.vue'
import AchievementWall from './components/AchievementWall.vue'
import EncouragementBanner from './components/EncouragementBanner.vue'

defineOptions({ name: 'KidsDashboardView', class: 'kids-dashboard-view' })

const route = useRoute()

// 状态
const pageLoading = ref(false)
const isValidated = ref(false)
const validating = ref(false)
const refreshing = ref(false)
const validateError = ref('')

const codeFormRef = ref()
const codeForm = reactive({
  code: route.query.code as string || ''
})

const codeRules = {
  code: [
    { required: true, message: '请输入访问码', trigger: 'blur' },
    { min: 6, max: 6, message: '访问码长度为6位', trigger: 'blur' }
  ]
}

// 数据
const summary = ref<DashboardApi.DashboardSummary>({
  nickname: '',
  bookName: '',
  avatar: '',
  currentBalance: 0,
  todayIncome: 0,
  todayExpense: 0,
  dailyGoal: 10,
  todayAmount: 0,
  dailyProgress: 0,
  weeklyGoal: 50,
  weekAmount: 0,
  weeklyProgress: 0,
  levelName: '',
  levelIcon: '🌱',
  consecutiveDays: 0,
  streakStatus: '',
  weekTrend: []
})

const wishes = ref<DashboardApi.WishProgress[]>([])
const planStatus = ref<DashboardApi.PlanStatus>({
  todayTotal: 0,
  todayCompleted: 0,
  todayRate: 0,
  weekCompleted: 0,
  weekTotal: 0,
  weekRate: 0,
  pendingToday: [],
  todayPlans: []
})
const achievements = ref<DashboardApi.Achievement[]>([])
const encouragement = ref<DashboardApi.Encouragement>({
  message: '每天进步一点点，未来会更棒！',
  emoji: '🌱',
  type: 'default'
})

// 当前绑定的账本和用户ID
const currentBookId = ref<number>()
const currentUserId = ref<number>()

// 获取设备ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('dashboard_device_id')
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('dashboard_device_id', deviceId)
  }
  return deviceId
}

// 验证访问码
const handleValidate = async () => {
  if (!codeFormRef.value) return
  try {
    await codeFormRef.value.validate()
  } catch {
    return
  }

  validating.value = true
  validateError.value = ''

  try {
    const deviceId = getDeviceId()
    const res = await DashboardApi.validateAccessCode(codeForm.code, deviceId)

    if (res.valid) {
      isValidated.value = true
      currentBookId.value = res.bookId
      currentUserId.value = res.userId
      await loadAllData()
    } else {
      validateError.value = res.message || '访问码无效'
    }
  } catch (e: any) {
    validateError.value = e.message || '验证失败，请重试'
  } finally {
    validating.value = false
  }
}

// 加载所有数据
const loadAllData = async () => {
  if (!currentBookId.value) return

  pageLoading.value = true
  try {
    const [summaryRes, wishesRes, planRes, achievementsRes, encouragementRes] = await Promise.all([
      DashboardApi.getDashboardSummary(currentBookId.value, currentUserId.value),
      DashboardApi.getWishProgress(currentBookId.value, currentUserId.value),
      DashboardApi.getPlanStatus(currentBookId.value, currentUserId.value),
      DashboardApi.getAchievements(currentBookId.value, currentUserId.value),
      DashboardApi.getEncouragement(currentBookId.value, currentUserId.value)
    ])

    summary.value = summaryRes
    wishes.value = wishesRes || []
    planStatus.value = planRes || planStatus.value
    achievements.value = achievementsRes || []
    encouragement.value = encouragementRes || encouragement.value
  } catch (e: any) {
    ElMessage.error('加载数据失败：' + (e.message || '未知错误'))
  } finally {
    pageLoading.value = false
  }
}

// 刷新数据
const handleRefresh = async () => {
  refreshing.value = true
  await loadAllData()
  refreshing.value = false
}

// 初始化
onMounted(async () => {
  // 如果URL有访问码，自动验证
  if (codeForm.code) {
    await handleValidate()
  }
})
</script>

<style lang="scss" scoped>
.dashboard-view {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }

  &.loading {
    overflow: hidden;
  }
}

// 访问码输入页面
.code-entry-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.code-entry-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.entry-header {
  margin-bottom: 30px;

  .entry-emoji {
    font-size: 64px;
    display: block;
    margin-bottom: 16px;
  }

  h1 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #303133;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.code-input {
  :deep(.el-input__wrapper) {
    padding: 16px 20px;
  }

  :deep(.el-input__inner) {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 8px;
    text-align: center;
  }
}

.validate-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 16px;
  color: #f56c6c;
  font-size: 14px;
}

// 大屏主页面
.dashboard-content {
  min-height: 100vh;
  padding: 16px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #fff;

  .header-title {
    font-size: 18px;
    font-weight: 600;
  }

  :deep(.el-button) {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-row {
  margin-bottom: 16px;

  &.row-1 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &.row-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &.row-3 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &.row-4 {
    text-align: center;
  }
}

// 动画效果
.animate-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;
}

.row-1 .animate-item:nth-child(1) { animation-delay: 0.1s; }
.row-1 .animate-item:nth-child(2) { animation-delay: 0.2s; }
.row-1 .animate-item:nth-child(3) { animation-delay: 0.3s; }

.row-2 .animate-item:nth-child(1) { animation-delay: 0.4s; }
.row-2 .animate-item:nth-child(2) { animation-delay: 0.5s; }

.row-3 .animate-item:nth-child(1) { animation-delay: 0.6s; }
.row-3 .animate-item:nth-child(2) { animation-delay: 0.7s; }

.row-4 .animate-item { animation-delay: 0.8s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Spinning animation for refresh button
:deep(.spinning) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 加载状态
.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 1000;

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
  }
}
</style>

<style lang="scss">
// 全局样式覆盖
.kids-dashboard-view {
  // 不覆盖 overflow，让页面自然滚动
}
</style>
