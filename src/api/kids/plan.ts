import request from '@/config/axios'

// ===================== 计划相关类型定义 =====================

export interface PlanBranch {
  id?: number
  actionId?: number
  branchName: string
  conditionDesc: string
  conditionExpr?: string
  pointDelta: number | null
  isDefault: number
  sortOrder: number
}

export interface PlanAction {
  id?: number
  planId?: number
  actionName: string
  categoryId: number
  categoryName: string
  pointOnComplete: number | null
  pointOnIncomplete: number | null
  hasBranch: number
  sortOrder: number
  remark?: string
  branches?: PlanBranch[]
}

export interface Plan {
  id?: number
  name: string
  description?: string
  frequencyType: number
  frequencyValue?: string
  remindTime?: string
  isActive: number
  visibility: number
  creatorId?: number
  creatorName?: string
  isSystem: number
  createdAt?: string
  updatedAt?: string
  actions?: PlanAction[]
}

// ===================== 频率类型映射 =====================

export const frequencyTypeMap: Record<number, { label: string }> = {
  1: { label: '每日' },
  2: { label: '每周' },
  3: { label: '每月' },
  4: { label: '每年' }
}

// ===================== 分页查询参数 =====================

export interface PlanPageParam {
  pageNo: number
  pageSize: number
  name?: string
  isActive?: number
}

// 分页响应
export interface PlanPageResponse {
  list: Plan[]
  total: number
}

// ===================== API 接口 =====================

// 获取计划列表（分页）
export const getPlanPage = async (params: PlanPageParam) => {
  const response = await request.get<PlanPageResponse>({ url: '/kids/plan/page', params })
  return response as unknown as PlanPageResponse
}

// 获取计划列表（兼容旧代码）
export const getPlanList = async (params?: PlanPageParam) => {
  if (!params) {
    params = { pageNo: 1, pageSize: 100 }
  }
  return getPlanPage(params)
}

// 获取计划详情
export const getPlan = async (id: number) => {
  return await request.get({ url: `/kids/plan/get?id=${id}` })
}

// 创建计划
export const createPlan = async (data: Plan) => {
  return await request.post({ url: '/kids/plan/create', data })
}

// 更新计划
export const updatePlan = async (data: Plan) => {
  return await request.put({ url: '/kids/plan/update', data })
}

// 删除计划
export const deletePlan = async (id: number) => {
  return await request.delete({ url: `/kids/plan/delete?id=${id}` })
}

// 获取积分类别列表
export const getCategoryList = async (params?: { bookId?: number }) => {
  return await request.get({ url: '/kids/category/list', params })
}

// 启用计划
export const enablePlan = async (id: number) => {
  return await request.put({ url: `/kids/plan/enable?id=${id}` })
}

// 禁用计划
export const disablePlan = async (id: number) => {
  return await request.put({ url: `/kids/plan/disable?id=${id}` })
}
