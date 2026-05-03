import request from '@/config/axios'

export interface VoiceLogVO {
  id: number
  bookId: number
  userId?: number
  voiceText: string
  aiRawOutput?: string
  accountingStatus: number // 1=记账成功 2=记账失败
  recordId?: number
  errorStage?: string
  errorStageName?: string
  errorCode?: string
  errorMessage?: string
  createTime: string
}

export interface VoiceLogPageReq {
  pageNo: number
  pageSize: number
  bookId?: number
  accountingStatus?: number
  errorStage?: string
}

/** 分页查询语音记账日志 */
export const getVoiceLogPage = async (params: VoiceLogPageReq) => {
  return await request.get({ url: '/kids/voice-log/page', params })
}

/** 查询单条日志详情 */
export const getVoiceLog = async (id: number) => {
  return await request.get({ url: '/kids/voice-log/get', params: { id } })
}
