'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Search, Eye, CheckCircle, ExternalLink, Twitter, Github, MessageSquare, Users, Calendar, Mail, Shield, X, Bot, Hash } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCommunityListQuery, useUpdateCommunityStatusMutation } from '@/hooks/use-api'
import { Community } from '@prisma/client'

// 根据 Prisma schema 定义 Community interface

// API响应数据结构
interface ApiResponse {
  data: {
    cols: Array<{
      name: string
      display_name: string
      base_type: string
      effective_type: string
    }>
    rows: Array<Array<any>>
  }
}

export function CommunityManagement() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [confirmCommunity, setConfirmCommunity] = useState<Community | null>(null)
  const { toast } = useToast()

  // 使用 useCommunityListQuery 获取社区数据
  const { data: communityData, isLoading, error } = useCommunityListQuery({}, { enabled: true })

  // 使用 updateCommunityStatus mutation
  const updateCommunityStatusMutation = useUpdateCommunityStatusMutation({
    onSuccess: (data) => {
      toast({
        title: data.message || '操作成功',
        description: '社区认证状态已更新',
      })
    },
    onError: (error) => {
      toast({
        title: '操作失败',
        description: error.message || '更新社区认证状态失败',
        variant: 'destructive',
      })
    },
  })

  // 当数据加载完成后，更新本地 communities 状态
  useEffect(() => {
    if (communityData?.success && communityData?.data?.communities) {
      // API 返回的是已经结构化的 Community 对象数组，无需转换
      setCommunities(communityData.data.communities)
    }

    if (error) {
      console.error('Error fetching communities:', error)
      toast({
        title: '加载失败',
        description: '无法加载社区数据，请稍后重试',
        variant: 'destructive',
      })
    }
  }, [communityData, error, toast])

  const filteredCommunities = communities.filter((community) => {
    const matchesFilter =
      filter === 'all' || (filter === 'certified' && community.certification) || (filter === 'uncertified' && !community.certification)

    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) || community.handle.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const handleCertificationToggle = async (communityHandle: string) => {
    const community = communities.find((c) => c.handle === communityHandle)
    if (!community) return

    const newStatus = !community.certification

    try {
      // 调用 API 更新认证状态
      await updateCommunityStatusMutation.mutateAsync([
        {
          handle: communityHandle,
          certification: newStatus,
        },
      ])

      // 更新本地状态
      setCommunities((prev) => prev.map((c) => (c.handle === communityHandle ? { ...c, certification: newStatus } : c)))

      // 更新选中的社区状态
      if (selectedCommunity && selectedCommunity.handle === communityHandle) {
        setSelectedCommunity({ ...selectedCommunity, certification: newStatus })
      }
    } catch (error) {
      // 错误处理已经在 mutation 的 onError 中处理了
      console.error('更新社区认证状态失败:', error)
    } finally {
      // 关闭确认对话框
      setConfirmCommunity(null)
    }
  }

  // 格式化创建时间
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // 渲染创建者信息
  const renderCreatorInfo = (community: Community) => {
    return (
      <div className="space-y-2">
        <div className="font-medium text-sm">ID: {community.user_id}</div>
      </div>
    )
  }

  // 渲染社交媒体信息
  const renderSocialInfo = (community: Community) => {
    const socialLinks = []

    // {
    //   community.creator_tg_handle && (
    //     <div className="flex items-center gap-1 text-xs">
    //       <MessageSquare className="h-3 w-3 text-blue-500" />
    //       <span className="text-muted-foreground">@{community.creator_tg_handle}</span>
    //     </div>
    //   )
    // }

    // {
    //   community.creator_email && (
    //     <div className="flex items-center gap-1 text-xs">
    //       <Mail className="h-3 w-3 text-green-500" />
    //       <span className="text-muted-foreground truncate max-w-[140px]" title={community.creator_email}>
    //         Email:{community.creator_email}
    //       </span>
    //     </div>
    //   )
    // }
    if (community.twitter) {
      socialLinks.push(
        <div key="twitter" className="flex items-center gap-1 text-xs">
          {/* <Twitter className="h-3 w-3 text-sky-500" /> */}
          <span rel="noopener noreferrer" className="text-muted-foreground truncate  max-w-[400px" title={community.twitter}>
            Twitter: {community.twitter}
          </span>
        </div>
      )
    }

    if (community.tgHandle) {
      socialLinks.push(
        <div key="tgHandle" className="flex items-center gap-1 text-xs">
          {/* <Hash className="h-3 w-3 text-blue-400" /> */}
          <span className="text-muted-foreground truncate  max-w-[400px" title={community.tgHandle}>
            TG Handle: {community.tgHandle}
          </span>
        </div>
      )
    }

    if (community.tgGroup) {
      socialLinks.push(
        <div key="tgGroup" className="flex items-center gap-1 text-xs">
          {/* <Users className="h-3 w-3 text-blue-700" /> */}
          <a
            href={community.tgGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:underline truncate  max-w-[400px"
            title={community.tgGroup}
          >
            TG Group: {community.tgGroup}
          </a>
        </div>
      )
    }

    if (community.tgBot) {
      socialLinks.push(
        <div key="tgBot" className="flex items-center gap-1 text-xs">
          {/* <Bot className="h-3 w-3 text-blue-600" /> */}
          <a
            href={community.tgBot}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:underline truncate  max-w-[400px"
            title={community.tgBot}
          >
            TG Bot: {community.tgBot}
          </a>
        </div>
      )
    }

    return <div className="space-y-1">{socialLinks.length > 0 ? socialLinks : <div className="text-xs text-muted-foreground">无社媒链接</div>}</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            社区管理
            <Badge variant="outline" className="ml-2">
              {communities.length} 个社区
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="搜索社区名称或 Handle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部社区</SelectItem>
                <SelectItem value="certified">已认证</SelectItem>
                <SelectItem value="uncertified">未认证</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">社区信息</TableHead>
                  <TableHead className="w-[100px]">创建者信息</TableHead>
                  <TableHead className="w-[400px]">社媒链接</TableHead>
                  <TableHead className="w-[120px]">创建时间</TableHead>
                  <TableHead className="w-[150px]">认证状态</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : filteredCommunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      暂无社区数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommunities.map((community, index) => (
                    <TableRow key={`${community.handle}-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={community.logo || ''} alt={community.name} />
                            <AvatarFallback>{community.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{community.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Hash className="h-3 w-3" />
                              <code className="bg-muted px-1 py-0.5 rounded text-xs">{community.handle}</code>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{renderCreatorInfo(community)}</TableCell>
                      <TableCell className="w-[400px]">{renderSocialInfo(community)}</TableCell>
                      <TableCell>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(community.created_at.toString())}
                        </div>
                      </TableCell>
                      <TableCell>
                        {community.certification ? (
                          <Badge variant="default" className="gap-1 min-w-[80px]">
                            <Shield className="h-3 w-3" />
                            已认证
                          </Badge>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setConfirmCommunity(community)}
                            disabled={updateCommunityStatusMutation.isPending}
                            className="gap-1 bg-green-600 hover:bg-green-700 text-white shadow-md"
                          >
                            <CheckCircle className="h-3 w-3" />
                            认证
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedCommunity(community)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[540px]">
                            <SheetHeader>
                              <SheetTitle className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={selectedCommunity?.logo || ''} alt={selectedCommunity?.name} />
                                  <AvatarFallback>{selectedCommunity?.name.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                社区详情
                              </SheetTitle>
                              <SheetDescription>查看和管理社区信息</SheetDescription>
                            </SheetHeader>
                            {selectedCommunity && (
                              <div className="mt-6 space-y-6">
                                {/* 基础信息 */}
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-lg">基础信息</h3>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">社区名称</label>
                                      <p className="text-sm text-muted-foreground mt-1">{selectedCommunity.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Handle</label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        <code className="bg-muted px-2 py-1 rounded text-xs">{selectedCommunity.handle}</code>
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">创建时间</label>
                                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      {formatDate(selectedCommunity.created_at.toString())}
                                    </p>
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">认证状态</label>
                                    <div className="mt-1 flex items-center justify-between">
                                      <Badge variant={selectedCommunity.certification ? 'default' : 'secondary'}>
                                        {selectedCommunity.certification ? (
                                          <div className="flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            已认证
                                          </div>
                                        ) : (
                                          '未认证'
                                        )}
                                      </Badge>
                                      <Button
                                        variant={selectedCommunity.certification ? 'destructive' : 'default'}
                                        size="sm"
                                        onClick={() => handleCertificationToggle(selectedCommunity.handle)}
                                        disabled={updateCommunityStatusMutation.isPending}
                                        className={selectedCommunity.certification ? '' : 'bg-green-600 hover:bg-green-700 text-white'}
                                      >
                                        {selectedCommunity.certification ? (
                                          <>
                                            <X className="h-4 w-4 mr-1" />
                                            取消认证
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            认证
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* 创建者信息 */}
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-lg">创建者信息</h3>

                                  {/* <div className="grid grid-cols-1 gap-3">
                                    {selectedCommunity.creator_tg_nickname && (
                                      <div>
                                        <label className="text-sm font-medium">昵称</label>
                                        <p className="text-sm text-muted-foreground mt-1">{selectedCommunity.creator_tg_nickname}</p>
                                      </div>
                                    )}
                                    {selectedCommunity.creator_tg_handle && (
                                      <div>
                                        <label className="text-sm font-medium">Telegram Handle</label>
                                        <p className="text-sm text-muted-foreground mt-1">@{selectedCommunity.creator_tg_handle}</p>
                                      </div>
                                    )}
                                    {selectedCommunity.creator_email && (
                                      <div>
                                        <label className="text-sm font-medium">邮箱</label>
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                          <Mail className="h-4 w-4" />
                                          {selectedCommunity.creator_email}
                                        </p>
                                      </div>
                                    )}
                                  </div> */}
                                </div>

                                {/* 社交媒体链接 */}
                                <div className="space-y-4">
                                  <h3 className="font-semibold text-lg">社交媒体</h3>

                                  <div className="space-y-3">
                                    {selectedCommunity.twitter && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Twitter className="h-4 w-4" />
                                          <span className="text-sm">Twitter</span>
                                        </div>
                                        <a
                                          href={selectedCommunity.twitter}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          访问 <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}
                                    {selectedCommunity.github && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Github className="h-4 w-4" />
                                          <span className="text-sm">GitHub</span>
                                        </div>
                                        <a
                                          href={selectedCommunity.github}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          访问 <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}
                                    {selectedCommunity.discord && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <MessageSquare className="h-4 w-4" />
                                          <span className="text-sm">Discord</span>
                                        </div>
                                        <a
                                          href={selectedCommunity.discord}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          访问 <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}
                                    {selectedCommunity.tgGroup && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          <span className="text-sm">Telegram 群组</span>
                                        </div>
                                        <a
                                          href={selectedCommunity.tgGroup}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          访问 <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}
                                    {selectedCommunity.tgBot && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <MessageSquare className="h-4 w-4" />
                                          <span className="text-sm">Telegram Bot</span>
                                        </div>
                                        <a
                                          href={selectedCommunity.tgBot}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          访问 <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 认证确认对话框 */}
      <AlertDialog open={!!confirmCommunity} onOpenChange={() => setConfirmCommunity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              确认认证社区
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要认证社区 <strong>"{confirmCommunity?.name}"</strong> 吗？认证后该社区将获得官方认证标识。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmCommunity && handleCertificationToggle(confirmCommunity.handle)}
              disabled={updateCommunityStatusMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {updateCommunityStatusMutation.isPending ? '处理中...' : '确认认证'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
