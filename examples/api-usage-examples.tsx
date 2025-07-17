/**
 * API 使用示例
 * 展示如何灵活使用 useApiQuery 和 useApiMutation
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  sendAssetReward,
  getUserInfo,
  updateUserInfo,
  deleteUser,
  useApiQuery,
  useApiMutation,
  useSendRewardQuery,
  useSendRewardMutation,
} from '@/hooks/use-api'

// ========== 方式一：使用便捷的专用 Hook ==========
const RewardDistributionExample = () => {
  const [params, setParams] = useState({
    telegramHandles: ['@user1', '@user2'],
    assetId: 'USDT',
    amount: 100,
    flowName: 'Test Flow',
    flowDescription: 'This is a test',
    sender: 'admin',
  })

  // 使用 Mutation 方式（推荐用于用户操作）
  const sendRewardMutation = useSendRewardMutation({
    onSuccess: (data) => {
      console.log('发送成功:', data)
    },
    onError: (error) => {
      console.error('发送失败:', error)
    },
  })

  // 使用 Query 方式（用于轮询或条件查询）
  const sendRewardQuery = useSendRewardQuery(params, {
    enabled: false, // 默认不启用，手动触发
    refetchInterval: 5000, // 5秒轮询一次
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>奖励分发 - 专用 Hook</CardTitle>
        <CardDescription>使用专门的 useSendRewardMutation 和 useSendRewardQuery</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => sendRewardMutation.mutate(params)} disabled={sendRewardMutation.isPending}>
          {sendRewardMutation.isPending ? 'Sending...' : 'Send Reward (Mutation)'}
        </Button>

        <Button onClick={() => sendRewardQuery.refetch()} disabled={sendRewardQuery.isFetching}>
          {sendRewardQuery.isFetching ? 'Sending...' : 'Send Reward (Query)'}
        </Button>

        <div>
          <p>Mutation Status: {sendRewardMutation.status}</p>
          <p>Query Status: {sendRewardQuery.status}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ========== 方式二：使用通用 Hook ==========
const UserManagementExample = () => {
  const [userId, setUserId] = useState('user123')
  const [userData, setUserData] = useState({ name: 'John', email: 'john@example.com' })

  // 使用通用 Query Hook
  const userQuery = useApiQuery(['user', userId], getUserInfo, [userId], {
    enabled: !!userId, // 只有当 userId 存在时才查询
  })

  // 使用通用 Mutation Hook
  const updateUserMutation = useApiMutation(updateUserInfo, {
    onSuccess: (data) => {
      console.log('更新成功:', data)
    },
    invalidateQueries: [['user', userId]], // 更新成功后刷新用户查询
  })

  const deleteUserMutation = useApiMutation(deleteUser, {
    onSuccess: () => {
      console.log('删除成功')
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户管理 - 通用 Hook</CardTitle>
        <CardDescription>使用通用的 useApiQuery 和 useApiMutation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>

        <Button onClick={() => userQuery.refetch()} disabled={userQuery.isFetching}>
          {userQuery.isFetching ? 'Loading...' : 'Get User Info'}
        </Button>

        <Button onClick={() => updateUserMutation.mutate([userId, userData])} disabled={updateUserMutation.isPending}>
          {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
        </Button>

        <Button onClick={() => deleteUserMutation.mutate([userId])} disabled={deleteUserMutation.isPending} variant="destructive">
          {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
        </Button>

        <div>
          <p>User Query Status: {userQuery.status}</p>
          <p>Update Status: {updateUserMutation.status}</p>
          <p>Delete Status: {deleteUserMutation.status}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ========== 方式三：直接使用 API 函数 ==========
const DirectApiExample = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleDirectCall = async () => {
    setLoading(true)
    try {
      // 直接调用 API 函数
      const result = await sendAssetReward({
        telegramHandles: ['@user1'],
        assetId: 'USDT',
        amount: 50,
        flowName: 'Direct Call',
        flowDescription: 'Direct API call example',
        sender: 'admin',
      })
      setResult(result)
    } catch (error) {
      console.error('Direct call failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>直接 API 调用</CardTitle>
        <CardDescription>直接使用 sendReward 函数，不使用 React Query</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleDirectCall} disabled={loading}>
          {loading ? 'Calling...' : 'Direct API Call'}
        </Button>

        {result && (
          <div>
            <p>Result: {JSON.stringify(result, null, 2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ========== 方式四：灵活使用 - 同一个 API 函数用于 Query 和 Mutation ==========
const FlexibleExample = () => {
  const [params] = useState({
    telegramHandles: ['@user1'],
    assetId: 'USDT',
    amount: 100,
    flowName: 'Flexible Example',
    flowDescription: 'Same API for both Query and Mutation',
    sender: 'admin',
  })

  // 同一个 sendReward 函数，用 Query 包装（比如用于轮询）
  const pollingQuery = useApiQuery(['sendReward', 'polling'], sendAssetReward, [params], {
    enabled: false,
    refetchInterval: 3000,
  })

  // 同一个 sendReward 函数，用 Mutation 包装（比如用于用户触发）
  const sendMutation = useApiMutation(sendAssetReward, {
    onSuccess: (data) => {
      console.log('Mutation 成功:', data)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>灵活使用</CardTitle>
        <CardDescription>同一个 API 函数既可以用 Query 也可以用 Mutation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => pollingQuery.refetch()} disabled={pollingQuery.isFetching}>
          {pollingQuery.isFetching ? 'Polling...' : 'Start Polling (Query)'}
        </Button>

        <Button onClick={() => sendMutation.mutate([params])} disabled={sendMutation.isPending}>
          {sendMutation.isPending ? 'Sending...' : 'Send Now (Mutation)'}
        </Button>

        <div>
          <p>Polling Status: {pollingQuery.status}</p>
          <p>Mutation Status: {sendMutation.status}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// 主组件
const ApiUsageExamples = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">API 使用示例</h1>

      <RewardDistributionExample />
      <UserManagementExample />
      <DirectApiExample />
      <FlexibleExample />
    </div>
  )
}

export default ApiUsageExamples
