import request from '@/config/axios'

export interface PointRecordVO {
  id: number
  bookId: number
  operatorUserId: number
  targetUserId: number
  categoryId?: number
  direction: number // 1=收入 2=支出
  amount: number
  balanceAfter: number
  remark?: string
  recordTime: number
  source: number // 1=手动 2=模板 3=AI
}

// 分页查询积分记录
export const getPointRecordPage = async (params: any) => {
  return await request.get({ url: '/kids/record/page', params })
}
