import request from '@/config/axios'

export interface AccountBookVO {
  id: number
  name: string
  icon?: string
  pointType: number // 1=小红花 2=星星 3=积分 4=自定义
  pointUnit?: string
  totalIncome: number
  totalExpense: number
  currentBalance: number
  status: number // 1=正常 0=禁用
  description?: string
  ownerUserId: number
  createTime: number
}

export interface AccountBookPageParam {
  pageNo: number
  pageSize: number
  name?: string
  status?: number
}

// 分页查询账本列表
export const getAccountBookPage = async (params: AccountBookPageParam) => {
  return await request.get({ url: '/kids/book/page', params })
}

// 获取账本详情
export const getAccountBook = async (id: number) => {
  return await request.get({ url: `/kids/book/get?id=${id}` })
}

// 删除账本
export const deleteAccountBook = async (id: number) => {
  return await request.delete({ url: `/kids/book/delete?id=${id}` })
}
