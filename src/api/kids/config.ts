import request from '@/config/axios'

export interface KidsConfigVO {
  configKey: string
  configValue: string
  valueType: string
  remark: string
}

export interface KidsConfigSaveReqVO {
  configKey: string
  configValue: string
  valueType?: string
  remark?: string
}

// 获取广告配置
export const getAdConfig = async () => {
  return await request.get({ url: '/kids/admin/config/ad' })
}

// 保存广告配置
export const saveAdConfig = async (data: KidsConfigSaveReqVO) => {
  return await request.put({ url: '/kids/admin/config/ad', data })
}

// 获取邀请功能配置
export const getReferralConfig = async () => {
  return await request.get({ url: '/kids/admin/config/referral' })
}

// 保存邀请功能配置
export const saveReferralConfig = async (data: KidsConfigSaveReqVO) => {
  return await request.put({ url: '/kids/admin/config/referral', data })
}

// 获取用户协议内容
export const getTermsConfig = async () => {
  return await request.get({ url: '/kids/admin/config/terms' })
}

// 保存用户协议内容
export const saveTermsConfig = async (data: KidsConfigSaveReqVO) => {
  return await request.put({ url: '/kids/admin/config/terms', data })
}

// 获取隐私政策内容
export const getPrivacyConfig = async () => {
  return await request.get({ url: '/kids/admin/config/privacy' })
}

// 保存隐私政策内容
export const savePrivacyConfig = async (data: KidsConfigSaveReqVO) => {
  return await request.put({ url: '/kids/admin/config/privacy', data })
}

// 获取运营模式配置
export const getSystemConfig = async () => {
  return await request.get({ url: '/kids/admin/config/system' })
}

// 获取内测人数上限
export const getInternalTestLimit = async () => {
  return await request.get({ url: '/kids/admin/config/system/limit' })
}

// 保存运营模式配置
export const saveSystemConfig = async (data: KidsConfigSaveReqVO) => {
  return await request.put({ url: '/kids/admin/config/system', data })
}
