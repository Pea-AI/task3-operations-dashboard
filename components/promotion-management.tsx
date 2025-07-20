'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Promotion {
  id: string
  title: string
  img: string
  url: string
  tag: string
  platform: 'line' | 'telegram'
  page: string
  priority: number
  eventIndex: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

interface PromotionFormData {
  title: string
  img: string
  url: string
  tag: string
  platform: 'line' | 'telegram'
  page: string
  priority: number
  eventIndex: number
  status: 'active' | 'inactive'
}

export function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [formData, setFormData] = useState<PromotionFormData>({
    title: '',
    img: '',
    url: '',
    tag: '',
    platform: 'line',
    page: 'plaza',
    priority: 1,
    eventIndex: 0,
    status: 'active',
  })

  const { toast } = useToast()

  // 获取推广配置列表
  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(platformFilter !== 'all' && { platform: platformFilter }),
      })

      const response = await fetch(`/api/promotion?${params}`)
      const data = await response.json()

      if (data.success) {
        setPromotions(data.data.promotions)
      } else {
        toast({
          title: '获取失败',
          description: data.message || '获取推广配置列表失败',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('获取推广配置列表失败:', error)
      toast({
        title: '获取失败',
        description: '网络错误',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // 保存推广配置（新增或编辑）
  const savePromotion = async () => {
    try {
      const url = editingPromotion ? '/api/promotion' : '/api/promotion'
      const method = editingPromotion ? 'PUT' : 'POST'
      const payload = editingPromotion ? { id: editingPromotion.id, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: '保存成功',
          description: editingPromotion ? '推广配置已更新' : '推广配置已创建',
        })
        setIsDialogOpen(false)
        setEditingPromotion(null)
        resetForm()
        fetchPromotions()
      } else {
        toast({
          title: '保存失败',
          description: data.message || '保存推广配置失败',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('保存推广配置失败:', error)
      toast({
        title: '保存失败',
        description: '网络错误',
        variant: 'destructive',
      })
    }
  }

  // 删除推广配置
  const deletePromotion = async (id: string) => {
    try {
      const response = await fetch(`/api/promotion?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: '删除成功',
          description: '推广配置已删除',
        })
        fetchPromotions()
      } else {
        toast({
          title: '删除失败',
          description: data.message || '删除推广配置失败',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('删除推广配置失败:', error)
      toast({
        title: '删除失败',
        description: '网络错误',
        variant: 'destructive',
      })
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      img: '',
      url: '',
      tag: '',
      platform: 'line',
      page: 'plaza',
      priority: 1,
      eventIndex: 0,
      status: 'active',
    })
  }

  // 开始编辑
  const startEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      title: promotion.title,
      img: promotion.img,
      url: promotion.url,
      tag: promotion.tag,
      platform: promotion.platform,
      page: promotion.page,
      priority: promotion.priority,
      eventIndex: promotion.eventIndex,
      status: promotion.status,
    })
    setIsDialogOpen(true)
  }

  // 开始新增
  const startAdd = () => {
    setEditingPromotion(null)
    resetForm()
    setIsDialogOpen(true)
  }

  // 初始化数据
  useEffect(() => {
    fetchPromotions()
  }, [searchTerm, statusFilter, platformFilter])

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">推广配置管理</h2>
          <p className="text-muted-foreground">管理推广配置的增删改查操作</p>
        </div>
        <Button onClick={startAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增配置
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">搜索</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="搜索标题、标签或链接..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-32">
              <Label htmlFor="status-filter">状态</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32">
              <Label htmlFor="platform-filter">平台</Label>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchPromotions} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 推广配置列表 */}
      <Card>
        <CardHeader>
          <CardTitle>推广配置列表</CardTitle>
          <CardDescription>共 {promotions.length} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>图片</TableHead>
                  <TableHead>链接</TableHead>
                  <TableHead>标签</TableHead>
                  <TableHead>平台</TableHead>
                  <TableHead>页面</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>事件索引</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">{promotion.title}</TableCell>
                    <TableCell>
                      <img
                        src={promotion.img}
                        alt={promotion.title}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = '/placeholder.svg'
                        }}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={promotion.url}>
                      {promotion.url}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{promotion.tag}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={promotion.platform === 'line' ? 'default' : 'secondary'}>
                        {promotion.platform === 'line' ? 'Line' : 'Telegram'}
                      </Badge>
                    </TableCell>
                    <TableCell>{promotion.page}</TableCell>
                    <TableCell>{promotion.priority}</TableCell>
                    <TableCell>{promotion.eventIndex}</TableCell>
                    <TableCell>
                      <Badge variant={promotion.status === 'active' ? 'default' : 'secondary'}>
                        {promotion.status === 'active' ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(promotion)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>确定要删除推广配置 "{promotion.title}" 吗？此操作无法撤销。</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePromotion(promotion.id)}>删除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {promotions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      暂无推广配置数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 新增/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? '编辑推广配置' : '新增推广配置'}</DialogTitle>
            <DialogDescription>{editingPromotion ? '修改推广配置信息' : '填写推广配置信息'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入推广标题"
              />
            </div>
            <div>
              <Label htmlFor="img">图片链接</Label>
              <Input id="img" value={formData.img} onChange={(e) => setFormData({ ...formData, img: e.target.value })} placeholder="输入图片URL" />
            </div>
            <div>
              <Label htmlFor="url">链接地址</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="例如：/app/game/dice"
              />
            </div>
            <div>
              <Label htmlFor="tag">标签</Label>
              <Input id="tag" value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} placeholder="例如：50USDT" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">平台</Label>
                <Select value={formData.platform} onValueChange={(value: 'line' | 'telegram') => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="page">页面</Label>
                <Input
                  id="page"
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  placeholder="例如：plaza"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">优先级</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label htmlFor="eventIndex">事件索引</Label>
                <Input
                  id="eventIndex"
                  type="number"
                  min="0"
                  value={formData.eventIndex}
                  onChange={(e) => setFormData({ ...formData, eventIndex: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">状态</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={savePromotion}>{editingPromotion ? '更新' : '创建'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
