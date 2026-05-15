import requestApp from '@/config/axios/appService'

// ========== 访问码相关 ==========

export interface AccessCodeGenerateReq {
  bookId: number
  targetUserId?: number
  expireMinutes?: number
}

export interface AccessCodeResp {
  code: string
  expiredTime: string
  h5Link: string
}

export interface AccessCodeValidateResp {
  valid: boolean
  message: string
  bookId?: number
  userId?: number
  nickname?: string
  avatar?: string
}

// ========== 大屏数据相关 ==========

export interface DayTrend {
  dayLabel: string
  income: number
  expense: number
}

export interface DashboardSummary {
  nickname: string
  bookName: string
  avatar: string
  currentBalance: number
  todayIncome: number
  todayExpense: number
  dailyGoal: number
  todayAmount: number
  dailyProgress: number
  weeklyGoal: number
  weekAmount: number
  weeklyProgress: number
  levelName: string
  levelIcon: string
  consecutiveDays: number
  streakStatus: string
  weekTrend: DayTrend[]
}

export interface WishProgress {
  wishId: number
  wishName: string
  icon: string
  currentPoints: number
  targetPoints: number
  progressPercent: number
  achieved: boolean
}

export interface PlanAction {
  actionId: number
  actionName: string
  isCompleted: number  // 0=未完成，1=已完成
  categoryName: string
  pointDelta: number
}

export interface PlanDetail {
  instanceId: number
  planName: string
  status: number  // 0=待执行，1=执行中，2=已完成，3=已过期
  statusText: string
  actions: PlanAction[]
}

export interface PendingPlan {
  instanceId: number
  planName: string
  actionName: string
}

export interface PlanStatus {
  todayTotal: number
  todayCompleted: number
  todayRate: number
  weekCompleted: number
  weekTotal: number
  weekRate: number
  pendingToday: PendingPlan[]
  todayPlans: PlanDetail[]
}

export interface Achievement {
  code: string
  name: string
  icon: string
  description: string
  unlocked: boolean
  unlockDate: string | null
}

export interface Encouragement {
  message: string
  emoji: string
  type: string
}

// 生成访问码
export const generateAccessCode = async (params: AccessCodeGenerateReq) => {
  return await requestApp.post<AccessCodeResp>({ url: '/app-api/kids/dashboard/access-code/generate', params })
}

// 验证访问码
export const validateAccessCode = async (code: string, deviceId?: string) => {
  return await requestApp.get<AccessCodeValidateResp>({
    url: '/app-api/kids/dashboard/access-code/validate',
    params: { code, deviceId }
  })
}

// 获取大屏汇总数据
export const getDashboardSummary = async (bookId: number, userId?: number) => {
  return await requestApp.get<DashboardSummary>({
    url: '/app-api/kids/dashboard/summary',
    params: { bookId, userId }
  })
}

// 获取心愿进度
export const getWishProgress = async (bookId: number, userId?: number) => {
  return await requestApp.get<WishProgress[]>({
    url: '/app-api/kids/dashboard/wish-progress',
    params: { bookId, userId }
  })
}

// 获取计划状态
export const getPlanStatus = async (bookId: number, userId?: number) => {
  return await requestApp.get<PlanStatus>({
    url: '/app-api/kids/dashboard/plan-status',
    params: { bookId, userId }
  })
}

// 获取成就列表
export const getAchievements = async (bookId: number, userId?: number) => {
  return await requestApp.get<Achievement[]>({
    url: '/app-api/kids/dashboard/achievements',
    params: { bookId, userId }
  })
}

// 获取鼓励语
export const getEncouragement = async (bookId: number, userId?: number) => {
  return await requestApp.get<Encouragement>({
    url: '/app-api/kids/dashboard/encouragement',
    params: { bookId, userId }
  })
}
