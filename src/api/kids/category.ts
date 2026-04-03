import request from '@/config/axios'

export interface CategoryVO {
  id: number
  bookId?: number
  userId?: number
  name: string
  icon?: string
  direction: number // 1=收入 2=支出
  sort: number
  isSystem: number // 0=用户自定义 1=系统预设
}

// 获取类别列表
export const getCategoryList = async (params?: any) => {
  return await request.get({ url: '/kids/category/list', params })
}

// 新建类别
export const createCategory = async (data: Partial<CategoryVO>) => {
  return await request.post({ url: '/kids/category/create', data })
}

// 更新类别
export const updateCategory = async (data: Partial<CategoryVO>) => {
  return await request.put({ url: '/kids/category/update', data })
}

// 删除类别
export const deleteCategory = async (id: number) => {
  return await request.delete({ url: `/kids/category/delete?id=${id}` })
}
