<template>
  <div class="user-dashboard-view" :class="{ loading: pageLoading }">
    <!-- 访问码输入页面 -->
    <div v-if="!isValidated" class="code-entry-page">
      <div class="code-entry-card">
        <div class="entry-header">
          <span class="entry-emoji">👋</span>
          <h1>欢迎来到大屏</h1>
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
          <span class="header-title">{{ currentBookName || '我的大屏' }}</span>
          <span v-if="isFromAccessCode" class="header-subtitle">我是小主人</span>
        </div>
        <div class="header-right">
          <el-button circle @click="handleRefresh">
            <Icon icon="ep:refresh" :class="{ spinning: refreshing }" />
          </el-button>
        </div>
      </header>

      <!-- 账本Tab切换 -->
      <div v-if="bookList.length > 1" class="book-tabs">
        <div
          v-for="book in bookList"
          :key="book.id"
          class="book-tab"
          :class="{ active: currentBookId === book.id }"
          @click="switchBook(book.id)"
        >
          <span class="book-tab-icon">{{ book.icon || '📒' }}</span>
          <span class="book-tab-name">{{ book.name }}</span>
        </div>
      </div>

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
            :stroke-width="10"
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
import * as DashboardApi from '@/api/kids/dashboard'
import * as BookApi from '@/api/kids/book'
import type { FormInstance, FormRules } from 'element-plus'

import ProfileCard from './components/ProfileCard.vue'
import BalanceDisplay from './components/BalanceDisplay.vue'
import GoalProgressRing from './components/GoalProgressRing.vue'
import WeekTrendChart from './components/WeekTrendChart.vue'
import WishProgressList from './components/WishProgressList.vue'
import PlanStatusCard from './components/PlanStatusCard.vue'
import AchievementWall from './components/AchievementWall.vue'
import EncouragementBanner from './components/EncouragementBanner.vue'

defineOptions({ name: 'KidsUserDashboardPage', class: 'kids-user-dashboard-view' })

// 访问码相关
const isValidated = ref(false)
const validating = ref(false)
const validateError = ref('')
const codeFormRef = ref<FormInstance>()
const codeForm = reactive({
  code: ''
})
const codeRules: FormRules = {
  code: [
    { required: true, message: '请输入访问码', trigger: 'blur' },
    { min: 6, max: 6, message: '访问码为6位', trigger: 'blur' }
  ]
}

// 是否来自访问码
const isFromAccessCode = ref(false)

// 状态
const pageLoading = ref(false)
const refreshing = ref(false)
const bookList = ref<BookApi.AccountBookVO[]>([])
const currentBookId = ref<number>()
const currentUserId = ref<number>()

// 当前账本名称
const currentBookName = computed(() => {
  const book = bookList.value.find(b => b.id === currentBookId.value)
  return book?.name || ''
})

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
  pendingToday: []
})
const achievements = ref<DashboardApi.Achievement[]>([])
const encouragement = ref<DashboardApi.Encouragement>({
  message: '每天进步一点点，未来会更棒！',
  emoji: '🌱',
  type: 'default'
})

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
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId()
    console.log('开始验证访问码:', codeForm.code, 'deviceId:', deviceId)
    const result = await DashboardApi.validateAccessCode(codeForm.code, deviceId)
    console.log('验证结果:', result)

    if (result.valid) {
      currentBookId.value = result.bookId || undefined
      currentUserId.value = result.userId || undefined
      console.log('获取到 userId:', currentUserId.value, 'bookId:', currentBookId.value)
      isValidated.value = true
      isFromAccessCode.value = true
      // 获取该用户的所有账本
      if (currentUserId.value) {
        await loadBooksByUserId(currentUserId.value)
      } else {
        console.error('userId 为空，无法加载账本列表')
      }
      await loadAllData()
    } else {
      validateError.value = result.message || '访问码无效'
    }
  } catch (e: any) {
    console.error('验证失败:', e)
    validateError.value = e.message || '验证失败，请重试'
  } finally {
    validating.value = false
  }
}

// 生成设备ID
function generateDeviceId() {
  const deviceId = 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  )
  localStorage.setItem('deviceId', deviceId)
  return deviceId
}

// 根据用户ID加载账本列表
const loadBooksByUserId = async (userId: number) => {
  try {
    const data = await BookApi.getAccountBookListByUserId(userId)
    console.log('加载到的账本列表:', data)
    bookList.value = data || []
    console.log('当前账本列表:', bookList.value)
  } catch (e) {
    console.error('加载账本列表失败', e)
  }
}

// 加载账本列表（已登录用户）
const loadBooks = async () => {
  try {
    const data = await BookApi.getAccountBookPage({
      pageNo: 1,
      pageSize: 100
    })
    bookList.value = data.list || []
    if (bookList.value.length > 0 && !currentBookId.value) {
      currentBookId.value = bookList.value[0].id
      await loadAllData()
    }
  } catch (e) {
    console.error('加载账本列表失败', e)
  }
}

// 切换账本
const switchBook = async (bookId: number) => {
  if (currentBookId.value === bookId) return
  currentBookId.value = bookId
  await loadAllData()
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

// 初始化 - 检查URL中的访问码
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const codeFromUrl = urlParams.get('code')

  if (codeFromUrl) {
    codeForm.code = codeFromUrl.toUpperCase()
    isFromAccessCode.value = true
    await handleValidate()
  }
  // 如果没有访问码，尝试加载已登录用户的账本
  else {
    try {
      await loadBooks()
    } catch {
      // 未登录，不加载账本列表
    }
  }
})
</script>

<style lang="scss" scoped>
.user-dashboard-view {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

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
    color: #333;
  }

  p {
    margin: 0;
    color: #999;
    font-size: 14px;
  }
}

.code-input {
  :deep(.el-input__wrapper) {
    padding: 16px 20px;
    font-size: 20px;
    letter-spacing: 4px;
    text-align: center;
  }
}

.validate-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.error-message {
  margin-top: 16px;
  color: #f56c6c;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.dashboard-content {
  min-height: 100vh;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #fff;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-title {
    font-size: 24px;
    font-weight: 700;
  }

  .header-subtitle {
    font-size: 14px;
    opacity: 0.8;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 12px;
    border-radius: 12px;
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

.book-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.book-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);
  border: 2px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  &.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: #fff;
    color: #fff;
    transform: scale(1.05);
  }

  .book-tab-icon {
    font-size: 20px;
  }

  .book-tab-name {
    font-size: 14px;
    font-weight: 500;
  }
}

.dashboard-main {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-row {
  margin-bottom: 20px;

  &.row-1 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

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
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &.row-3 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &.row-4 {
    text-align: center;
  }
}

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
.kids-user-dashboard-view {
  overflow-y: auto !important;
  height: 100vh !important;
}
</style>
