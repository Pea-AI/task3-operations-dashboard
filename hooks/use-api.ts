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

export interface RewardResponse {
  totalHandles: number
  foundUserHandles: string[]
  notFoundUserHandles: string[]
  successHandles: string[]
  [key: string]: any // 保留其他可能的响应字段
}

// 发送奖励 API
export const sendAssetReward = async (params: SendRewardParams): Promise<RewardResponse> => {
  const response = await apiClient.request({
    method: 'POST',
    url: '/v1/user/asset/sendByTelegramHandle',
    data: params,
  })
  return response.data as RewardResponse
}

// 发送积分奖励 API
export const sendPointReward = async (params: Omit<SendRewardParams, 'assetId'>): Promise<RewardResponse> => {
  const response = await apiClient.request({
    method: 'POST',
    url: '/v1/user/asset/point/sendByTelegramHandle',
    data: params,
  })
  return response.data as RewardResponse
}

// 获取用户信息 API
export const getUserInfo = async () => {
  const response = await apiClient.request({
    method: 'GET',
    url: `/v1/user/info`,
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

// 社区列表查询参数接口
export interface CommunityListParams {
  page?: number
  limit?: number
  status?: string
  category?: string
  search?: string
}

// 获取社区列表 API
export const getCommunityList = async (params: CommunityListParams = {}) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString())
    }
  })

  const response = await fetch(`/api/community?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('获取社区列表失败')
  }

  return response.json()
}

// 更新社区认证状态参数接口
export interface UpdateCommunityStatusParams {
  handle: string
  certification: boolean
}

// 更新社区认证状态 API
export const updateCommunityStatus = async (params: UpdateCommunityStatusParams) => {
  const response = await apiClient.request({
    method: 'POST',
    url: '/v1/community/campaign/certification',
    data: params,
  })

  return response.data
}

// 获取奖励历史记录 API
export const getRewardHistory = async (
  params: {
    userIdentifier?: string
    assetType?: string
    status?: string
    page?: number
    pageSize?: number
  } = {}
): Promise<{
  records: any[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}> => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString())
    }
  })

  const response = await fetch(`/api/reward-history?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('获取奖励历史记录失败')
  }

  const result = await response.json()
  return result.data
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
    sendAssetReward,
    [params], // 修复：传入数组
    options
  )
}

// 使用 Mutation 方式调用 sendReward（通常用于用户操作）
export const useSendRewardMutation = (options?: { onSuccess?: (data: any) => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: SendRewardParams) => sendAssetReward(params),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

// 使用 Mutation 方式调用 sendPointReward（发送积分奖励）
export const useSendPointRewardMutation = (options?: { onSuccess?: (data: any) => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: Omit<SendRewardParams, 'assetId'>) => sendPointReward(params),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

// 使用 Query 方式获取社区列表
export const useCommunityListQuery = (params: CommunityListParams = {}, options?: { enabled?: boolean; refetchInterval?: number }) => {
  return useApiQuery(['communityList'], getCommunityList, [params], options)
}

// 使用 Mutation 方式更新社区认证状态
export const useUpdateCommunityStatusMutation = (options?: {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  invalidateQueries?: string[][]
}) => {
  return useApiMutation(updateCommunityStatus, {
    ...options,
    invalidateQueries: [['communityList'], ...(options?.invalidateQueries || [])],
  })
}
