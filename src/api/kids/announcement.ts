import request from '@/config/axios'

export interface AnnouncementVO {
  id: number
  title: string
  content: string
  type: number // 1=通知 2=活动 3=更新日志
  status: number // 0=下线 1=上线
  sort: number
  startTime?: string
  endTime?: string
  createTime: string
}

export interface AnnouncementPageReq {
  pageNo: number
  pageSize: number
  status?: number
}

/** 分页查询公告 */
export const getAnnouncementPage = async (params: AnnouncementPageReq) => {
  return await request.get({ url: '/kids/announcement/page', params })
}

/** 获取公告详情 */
export const getAnnouncement = async (id: number) => {
  return await request.get({ url: '/kids/announcement/get', params: { id } })
}

/** 创建公告 */
export const createAnnouncement = async (data: {
  title: string
  content: string
  type: number
  sort?: number
  startTime?: string
  endTime?: string
}) => {
  return await request.post({ url: '/kids/announcement/create', data })
}

/** 更新公告 */
export const updateAnnouncement = async (data: {
  id: number
  title?: string
  content?: string
  type?: number
  sort?: number
  startTime?: string
  endTime?: string
}) => {
  return await request.put({ url: '/kids/announcement/update', data })
}

/** 上线公告 */
export const onlineAnnouncement = async (id: number) => {
  return await request.put({ url: '/kids/announcement/online', params: { id } })
}

/** 下线公告 */
export const offlineAnnouncement = async (id: number) => {
  return await request.put({ url: '/kids/announcement/offline', params: { id } })
}

/** 删除公告 */
export const deleteAnnouncement = async (id: number) => {
  return await request.delete({ url: `/kids/announcement/delete?id=${id}` })
}
