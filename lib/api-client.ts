import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'
import { config } from './config'

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: `${config.apiTask3BaseUrl}/api`,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 admin token
apiClient.interceptors.request.use((requestConfig) => {
  // 添加 x-admin header
  requestConfig.headers['x-admin'] = config.adminToken

  // 如果有用户 token，也添加到请求头
  const token = localStorage?.getItem('token')
  if (token) {
    // requestConfig.headers.Authorization = `Bearer ${token}`
    requestConfig.headers['token'] = token
  }

  return requestConfig
})

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    // 检查响应中的 code 是否为 0
    if (response.data?.code !== undefined && response.data.code !== 0) {
      const errorMessage = response.data.message || 'Request failed with non-zero code'
      return Promise.reject(new Error(errorMessage))
    }
    return response
  },
  (error) => {
    // 处理 401 未授权
    if (error.response?.status === 401) {
      alert('没有权限')
    }

    // 处理其他错误
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    return Promise.reject(new Error(errorMessage))
  }
)

// 创建 Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // 401 错误不重试
        if (error.response?.status === 401) return false
        // 其他错误最多重试 3 次
        return failureCount < 3
      },
      refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
      staleTime: 5 * 60 * 1000, // 5分钟内数据不会被视为过期
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // mutation 失败时不重试
        return false
      },
    },
  },
})
