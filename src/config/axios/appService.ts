import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import qs from 'qs'

const baseUrl = import.meta.env.VITE_BASE_URL

const tenantEnable = import.meta.env.VITE_APP_TENANT_ENABLE

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
  withCredentials: false,
  paramsSerializer: (params) => {
    return qs.stringify(params, { allowDots: true })
  }
})

// request 拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 设置租户
    if (tenantEnable && tenantEnable === 'true') {
      config.headers['tenant-id'] = '1' // 默认租户 ID，可根据实际情况调整
    }
    const method = config.method?.toUpperCase()
    // 防止 GET 请求缓存
    if (method === 'GET') {
      config.headers['Cache-Control'] = 'no-cache'
      config.headers['Pragma'] = 'no-cache'
    }
    return config
  },
  (error: AxiosError) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    let { data } = response
    if (!data) {
      throw new Error()
    }

    // 未设置状态码则默认成功状态
    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
      if (response.data.type !== 'application/json') {
        return response.data
      }
      data = await new Response(response.data).json()
    }

    const code = data.code || 200
    const msg = data.msg || data.message

    if (code !== 200) {
      console.error('请求失败:', msg)
      return Promise.reject(new Error(msg || '请求失败'))
    }

    return data
  },
  (error: AxiosError) => {
    console.log('err', error)
    let { message } = error
    if (message === 'Network Error') {
      message = '网络错误'
    } else if (message.includes('timeout')) {
      message = '请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '请求失败'
    }
    console.error(message)
    return Promise.reject(error)
  }
)

export default {
  get: async <T = any>(option: any) => {
    const res = await service({ method: 'GET', ...option })
    return res.data as unknown as T
  },
  post: async <T = any>(option: any) => {
    const res = await service({ method: 'POST', ...option })
    return res.data as unknown as T
  },
  delete: async <T = any>(option: any) => {
    const res = await service({ method: 'DELETE', ...option })
    return res.data as unknown as T
  },
  put: async <T = any>(option: any) => {
    const res = await service({ method: 'PUT', ...option })
    return res.data as unknown as T
  }
}
