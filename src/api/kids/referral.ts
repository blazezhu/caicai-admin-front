import request from '@/config/axios'

export interface ReferralConfigVO {
  id: number
  tier: number
  requiredCount: number
  bonusDays: number
  remark: string
  createTime: string
}

export interface ReferralRecordVO {
  id: number
  inviterId: number
  inviteeId: number
  bonusDays: number
  createTime: string
}

// ========== 奖励配置 ==========

/** 分页查询奖励配置 */
export const getReferralConfigPage = async (params: { pageNo: number; pageSize: number }) => {
  return await request.get({ url: '/kids/referral/config/page', params })
}

/** 创建奖励配置 */
export const createReferralConfig = async (data: {
  tier: number
  requiredCount: number
  bonusDays: number
  remark?: string
}) => {
  return await request.post({ url: '/kids/referral/config/create', data })
}

/** 更新奖励配置 */
export const updateReferralConfig = async (data: {
  id: number
  tier: number
  requiredCount: number
  bonusDays: number
  remark?: string
}) => {
  return await request.put({ url: '/kids/referral/config/update', data })
}

/** 删除奖励配置 */
export const deleteReferralConfig = async (id: number) => {
  return await request.delete({ url: `/kids/referral/config/delete?id=${id}` })
}

// ========== 邀请记录 ==========

/** 分页查询邀请记录 */
export const getReferralRecordPage = async (params: { pageNo: number; pageSize: number }) => {
  return await request.get({ url: '/kids/referral/record/page', params })
}
