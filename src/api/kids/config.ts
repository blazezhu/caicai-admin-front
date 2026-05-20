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
