/**
 * 社区 API 使用示例 (包含创建者信息)
 *
 * 本文件展示了如何使用社区管理相关的 API 接口
 * API 路径: /api/community
 * 数据库表: ft_community, ft_user
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useCommunityListQuery, useUpdateCommunityStatusMutation, type CommunityListParams } from '@/hooks/use-api'
import { Community } from '@prisma/client'

export function CommunityApiExamples() {
  const [queryParams, setQueryParams] = useState<CommunityListParams>({
    page: 1,
    limit: 10,
    status: '',
    category: '',
    search: '',
  })

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [certificationStatus, setCertificationStatus] = useState(false)
  const { toast } = useToast()

  // 获取社区列表的示例
  const { data: communityData, isLoading, error, refetch } = useCommunityListQuery(queryParams, { enabled: true })

  // 更新社区认证状态的示例
  const updateCommunityStatusMutation = useUpdateCommunityStatusMutation({
    onSuccess: (data) => {
      toast({
        title: '操作成功',
        description: data.message || '社区认证状态已更新',
      })
      // 重新获取社区列表
      refetch()
    },
    onError: (error) => {
      toast({
        title: '操作失败',
        description: error.message || '更新社区认证状态失败',
        variant: 'destructive',
      })
    },
  })

  const handleUpdateCertification = async () => {
    if (!selectedCommunity) {
      toast({
        title: '请选择社区',
        description: '请先选择一个社区',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateCommunityStatusMutation.mutateAsync([
        {
          handle: selectedCommunity.handle,
          certification: certificationStatus,
        },
      ])
    } catch (error) {
      console.error('更新认证状态失败:', error)
    }
  }

  const handleSearch = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">社区 API 使用示例</h1>

      {/* 社区列表查询示例 */}
      <Card>
        <CardHeader>
          <CardTitle>社区列表查询</CardTitle>
          <CardDescription>演示如何使用社区列表查询 API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page">页码</Label>
              <Input
                id="page"
                type="number"
                value={queryParams.page}
                onChange={(e) => setQueryParams((prev) => ({ ...prev, page: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <Label htmlFor="limit">每页数量</Label>
              <Input
                id="limit"
                type="number"
                value={queryParams.limit}
                onChange={(e) => setQueryParams((prev) => ({ ...prev, limit: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div>
              <Label htmlFor="status">状态</Label>
              <Select value={queryParams.status} onValueChange={(value) => setQueryParams((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">非活跃</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">搜索</Label>
              <Input
                id="search"
                placeholder="搜索社区名称或 Handle"
                value={queryParams.search}
                onChange={(e) => setQueryParams((prev) => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? '查询中...' : '查询'}
          </Button>

          {error && <div className="text-red-500 text-sm">错误: {error.message}</div>}

          {communityData?.success && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">查询结果</h3>
              <div className="space-y-2">
                {communityData.data.communities.map((community: Community) => (
                  <div key={community.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{community.name}</div>
                      <div className="text-sm text-gray-500">@{community.handle}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={community.certification ? 'default' : 'secondary'}>{community.certification ? '已认证' : '未认证'}</Badge>
                      <Button size="sm" variant="outline" onClick={() => setSelectedCommunity(community)}>
                        选择
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-500">总计: {communityData.data.pagination.total} 个社区</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 社区认证状态更新示例 */}
      <Card>
        <CardHeader>
          <CardTitle>社区认证状态更新</CardTitle>
          <CardDescription>演示如何使用社区认证状态更新 API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedCommunity ? (
            <>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">已选择的社区:</h4>
                <div className="mt-2">
                  <div className="font-medium">{selectedCommunity.name}</div>
                  <div className="text-sm text-gray-500">@{selectedCommunity.handle}</div>
                  <div className="mt-1">
                    <Badge variant={selectedCommunity.certification ? 'default' : 'secondary'}>
                      当前状态: {selectedCommunity.certification ? '已认证' : '未认证'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="certification" checked={certificationStatus} onCheckedChange={setCertificationStatus} />
                <Label htmlFor="certification">认证状态</Label>
              </div>

              <Button onClick={handleUpdateCertification} disabled={updateCommunityStatusMutation.isPending}>
                {updateCommunityStatusMutation.isPending ? '更新中...' : '更新认证状态'}
              </Button>
            </>
          ) : (
            <div className="text-gray-500">请先从上面的列表中选择一个社区</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// API 调用示例代码
export const apiExamples = {
  // 获取社区列表
  getCommunityList: `
// 获取社区列表
const { data, isLoading, error } = useCommunityListQuery({
  page: 1,
  limit: 10,
  status: 'active',
  search: '搜索关键词'
}, { enabled: true })
  `,

  // 更新社区认证状态
  updateCommunityStatus: `
// 更新社区认证状态
const mutation = useUpdateCommunityStatusMutation({
  onSuccess: (data) => {
    console.log('更新成功:', data.message)
  },
  onError: (error) => {
    console.error('更新失败:', error.message)
  }
})

// 调用更新
await mutation.mutateAsync([{
  handle: 'community-handle',
  certification: true
}])
  `,

  // 直接 API 调用
  directApiCall: `
// 直接调用 API (不推荐，建议使用 hook)
const response = await fetch('/api/community', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    handle: 'community-handle',
    certification: true
  })
})

const result = await response.json()
console.log(result)
  `,
}
