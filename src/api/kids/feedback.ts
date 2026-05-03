import request from '@/config/axios'

export interface FeedbackVO {
  id: number
  userId?: number
  userNickname?: string
  content: string
  contact?: string
  status: number // 1=待处理 2=已回复 3=已关闭
  reply?: string
  replyTime?: Date
  createTime: Date
}

// 获取反馈列表
export const getFeedbackList = async () => {
  return await request.get({ url: '/kids/feedback/list' })
}

// 获取待处理反馈列表
export const getPendingFeedbackList = async () => {
  return await request.get({ url: '/kids/feedback/pending-list' })
}

// 回复反馈
export const replyFeedback = async (data: { id: number; reply: string }) => {
  return await request.put({ url: '/kids/feedback/reply', data })
}

// 关闭反馈
export const closeFeedback = async (id: number) => {
  return await request.put({ url: '/kids/feedback/close', params: { id } })
}

// 删除反馈
export const deleteFeedback = async (id: number) => {
  return await request.delete({ url: `/kids/feedback/delete?id=${id}` })
}
