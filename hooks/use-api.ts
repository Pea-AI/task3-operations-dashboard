import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

// ========== API 函数定义 ==========
// 纯粹的 API 请求函数，不绑定到特定的 React Query hook

export interface SendRewardParams {
  telegramHandles: string[]
  assetId: string
  amount: number
  flowName: string
  flowDescription: string
  sender: string
}

// 发送奖励 API
export const sendReward = async (params: SendRewardParams) => {
  const response = await apiClient.request({
    method: 'POST',
    url: '/v1/user/asset/sendByTelegramHandle',
    data: params,
  })
  return response.data
}

// 获取用户信息 API
export const getUserInfo = async (userId: string) => {
  const response = await apiClient.request({
    method: 'GET',
    url: `/v1/user/${userId}`,
  })
  return response.data
}

// 更新用户信息 API
export const updateUserInfo = async (userId: string, data: any) => {
  const response = await apiClient.request({
    method: 'PUT',
    url: `/v1/user/${userId}`,
    data,
  })
  return response.data
}

// 删除用户 API
export const deleteUser = async (userId: string) => {
  const response = await apiClient.request({
    method: 'DELETE',
    url: `/v1/user/${userId}`,
  })
  return response.data
}

// ========== 通用 Hook ==========
// 用于包装任何 API 函数的通用 hook

// 通用 Query Hook - 用于 GET 请求或需要缓存的请求
export function useApiQuery<T, P extends any[]>(
  key: string[],
  apiFn: (...args: P) => Promise<T>,
  args: P,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: [...key, ...args],
    queryFn: () => apiFn(...args),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
  })
}

// 通用 Mutation Hook - 用于 POST/PUT/DELETE 请求
export function useApiMutation<T, P extends any[]>(
  apiFn: (...args: P) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    invalidateQueries?: string[][]
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: P) => apiFn(...args),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
      // 自动刷新相关查询
      options?.invalidateQueries?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
    onError: options?.onError,
  })
}

// ========== 便捷 Hook ==========
// 基于通用 hook 的便捷封装

// 使用 Query 方式调用 sendReward（通常用于轮询或条件查询）
export const useSendRewardQuery = (params: SendRewardParams, options?: { enabled?: boolean; refetchInterval?: number }) => {
  return useApiQuery(
    ['sendReward'],
    sendReward,
    [params], // 修复：传入数组
    options
  )
}

// 使用 Mutation 方式调用 sendReward（通常用于用户操作）
export const useSendRewardMutation = (options?: { onSuccess?: (data: any) => void; onError?: (error: Error) => void }) => {
  return useApiMutation(sendReward, options)
}
