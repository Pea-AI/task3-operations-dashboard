'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Search, Eye, CheckCircle, Twitter, Hash, MessageSquare, Mail, Shield, Users, Calendar, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCommunityListQuery } from '@/hooks/use-api'

// 创建者信息接口
interface Creator {
  id: string
  first_name?: string
  last_name?: string
  nick_name?: string
  avatar?: string
  email?: string
  handler: string
  is_certified_account: boolean
  created_at: string
  updated_at: string
}

// 社区数据接口，基于 Prisma 模型
interface Community {
  id: string
  name: string
  handle: string
  logo?: string
  certification: boolean
  status: string
  category: string[]
  region: string
  user_id: string
  created_at: string
  updated_at: string
  // 创建者信息
  creator: Creator
  // 可选字段
  app_handle?: string
  app_id?: string
  tgBot?: string
  tgChannel?: string
  tgGroup?: string
  tgHandle?: string
  twitter?: string
  description?: string
}

export function CommunityManagementNew() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const { toast } = useToast()

  // 构建查询参数
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(categoryFilter !== 'all' && { category: categoryFilter }),
    ...(searchTerm && { search: searchTerm }),
  }

  // 使用新的 API hook
  const { data, isLoading, error, refetch } = useCommunityListQuery(queryParams)

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // 重置到第一页
  }

  // 处理状态过滤
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // 重置到第一页
  }

  // 处理分类过滤
  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value)
    setCurrentPage(1) // 重置到第一页
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // 渲染分类标签
  const renderCategoryBadges = (categories: string[]) => {
    return categories.map((category) => (
      <Badge key={category} variant="secondary" className="text-xs">
        {category}
      </Badge>
    ))
  }

  // 渲染社交媒体链接
  const renderSocialLinks = (community: Community) => {
    const links = []

    if (community.twitter) {
      links.push(
        <div key="twitter" className="flex items-center gap-1 text-xs">
          <Twitter className="h-3 w-3 text-sky-500" />
          <span className="text-muted-foreground">{community.twitter}</span>
        </div>
      )
    }

    if (community.tgHandle) {
      links.push(
        <div key="tg" className="flex items-center gap-1 text-xs">
          <Hash className="h-3 w-3 text-blue-400" />
          <span className="text-muted-foreground">{community.tgHandle}</span>
        </div>
      )
    }

    if (community.tgChannel) {
      links.push(
        <div key="tgChannel" className="flex items-center gap-1 text-xs">
          <MessageSquare className="h-3 w-3 text-blue-500" />
          <span className="text-muted-foreground">频道</span>
        </div>
      )
    }

    return links
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-600">加载失败</p>
          <p className="text-muted-foreground mb-4">无法加载社区数据</p>
          <Button onClick={() => refetch()} variant="outline">
            重试
          </Button>
        </div>
      </div>
    )
  }

  const communities = data?.data?.communities || []
  const pagination = data?.data?.pagination || {}

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">社区管理</h1>
          <p className="text-muted-foreground">管理和监控社区状态</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">总数: {pagination.total || 0}</Badge>
          <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
            {isLoading ? '刷新中...' : '刷新'}
          </Button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索和过滤</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索社区名称或标识..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">非活跃</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                <SelectItem value="GameFi">GameFi</SelectItem>
                <SelectItem value="NFT">NFT</SelectItem>
                <SelectItem value="SocialFi">SocialFi</SelectItem>
                <SelectItem value="Web3">Web3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 社区列表 */}
      <Card>
        <CardHeader>
          <CardTitle>社区列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">正在加载社区数据...</p>
              </div>
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">暂无社区数据</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>社区信息</TableHead>
                  <TableHead>创建者</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>地区</TableHead>
                  <TableHead>社交媒体</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map((community: Community) => (
                  <TableRow key={community.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={community.logo} alt={community.name} />
                          <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{community.name}</div>
                          <div className="text-sm text-muted-foreground">@{community.handle}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={community.creator.avatar} alt={community.creator.first_name || community.creator.handler} />
                          <AvatarFallback className="text-xs">
                            {community.creator.first_name?.substring(0, 1).toUpperCase() || community.creator.handler.substring(0, 1).toUpperCase()}
                            {community.creator.last_name?.substring(0, 1).toUpperCase() || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {community.creator.first_name || community.creator.handler} {community.creator.last_name || ''}
                            {community.creator.is_certified_account && <CheckCircle className="h-3 w-3 ml-1 text-green-600 inline" />}
                          </div>
                          <div className="text-xs text-muted-foreground">@{community.creator.handler}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={community.status === 'active' ? 'default' : 'secondary'}>
                          {community.status === 'active' ? '活跃' : '非活跃'}
                        </Badge>
                        {community.certification && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            已认证
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">{renderCategoryBadges(community.category)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{community.region}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">{renderSocialLinks(community)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(community.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCommunity(community)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>社区详情</SheetTitle>
                            <SheetDescription>查看 {selectedCommunity?.name} 的详细信息</SheetDescription>
                          </SheetHeader>
                          {selectedCommunity && (
                            <div className="space-y-4 mt-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={selectedCommunity.logo} alt={selectedCommunity.name} />
                                  <AvatarFallback>{selectedCommunity.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">{selectedCommunity.name}</h3>
                                  <p className="text-sm text-muted-foreground">@{selectedCommunity.handle}</p>
                                </div>
                              </div>

                              {selectedCommunity.description && (
                                <div>
                                  <h4 className="font-medium mb-2">描述</h4>
                                  <p className="text-sm text-muted-foreground">{selectedCommunity.description}</p>
                                </div>
                              )}

                              <div>
                                <h4 className="font-medium mb-2">创建者</h4>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={selectedCommunity.creator.avatar}
                                      alt={selectedCommunity.creator.first_name || selectedCommunity.creator.handler}
                                    />
                                    <AvatarFallback>
                                      {selectedCommunity.creator.first_name?.substring(0, 1).toUpperCase() ||
                                        selectedCommunity.creator.handler.substring(0, 1).toUpperCase()}
                                      {selectedCommunity.creator.last_name?.substring(0, 1).toUpperCase() || ''}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {selectedCommunity.creator.first_name || selectedCommunity.creator.handler}{' '}
                                      {selectedCommunity.creator.last_name || ''}
                                      {selectedCommunity.creator.is_certified_account && (
                                        <CheckCircle className="h-4 w-4 ml-1 text-green-600 inline" />
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">@{selectedCommunity.creator.handler}</div>
                                    {selectedCommunity.creator.nick_name && (
                                      <div className="text-sm text-muted-foreground">昵称: {selectedCommunity.creator.nick_name}</div>
                                    )}
                                    {selectedCommunity.creator.email && (
                                      <div className="text-sm text-muted-foreground">邮箱: {selectedCommunity.creator.email}</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">分类</h4>
                                <div className="flex gap-1 flex-wrap">{renderCategoryBadges(selectedCommunity.category)}</div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">社交媒体</h4>
                                <div className="space-y-2">
                                  {selectedCommunity.twitter && (
                                    <div className="flex items-center gap-2">
                                      <Twitter className="h-4 w-4 text-sky-500" />
                                      <span className="text-sm">{selectedCommunity.twitter}</span>
                                    </div>
                                  )}
                                  {selectedCommunity.tgHandle && (
                                    <div className="flex items-center gap-2">
                                      <Hash className="h-4 w-4 text-blue-400" />
                                      <span className="text-sm">{selectedCommunity.tgHandle}</span>
                                    </div>
                                  )}
                                  {selectedCommunity.tgChannel && (
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm">频道: {selectedCommunity.tgChannel}</span>
                                    </div>
                                  )}
                                  {selectedCommunity.tgGroup && (
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm">群组: {selectedCommunity.tgGroup}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">其他信息</h4>
                                <div className="space-y-1 text-sm">
                                  <div>地区: {selectedCommunity.region}</div>
                                  <div>状态: {selectedCommunity.status}</div>
                                  <div>创建时间: {formatDate(selectedCommunity.created_at)}</div>
                                  <div>更新时间: {formatDate(selectedCommunity.updated_at)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, pagination.total)} 项，共 {pagination.total} 项
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  上一页
                </Button>
                <span className="text-sm">
                  {currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages || isLoading}
                >
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
