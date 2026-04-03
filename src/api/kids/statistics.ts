import request from '@/config/axios'

export interface OverviewVO {
  totalBooks: number
  totalRecords: number
  totalUsers: number
  activeBooks: number
}

// 获取平台统计概览
export const getOverview = async () => {
  return await request.get({ url: '/kids/statistics/overview' })
}
