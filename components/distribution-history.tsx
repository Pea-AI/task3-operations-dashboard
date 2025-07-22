'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Search, Download, Loader2 } from 'lucide-react'
import { getRewardHistory } from '@/hooks/use-api'

interface HistoryRecord {
  id: string
  timestamp: string
  userId?: string
  tgHandle?: string
  assetType: string
  amount: number
  status: 'success' | 'failed'
  operator: string
  note?: string
}

export function DistributionHistory() {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    userIdentifier: '',
    assetType: 'all',
    status: 'all',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 10

  // 获取历史记录数据
  const fetchHistory = async () => {
    try {
      setLoading(true)
      const result = await getRewardHistory({
        userIdentifier: filters.userIdentifier || undefined,
        assetType: filters.assetType === 'all' ? undefined : filters.assetType,
        status: filters.status === 'all' ? undefined : filters.status,
        page: currentPage,
        pageSize: itemsPerPage,
      })

      setHistory(result.records)
      setTotalPages(result.pagination.totalPages)
      setTotal(result.pagination.total)
    } catch (error) {
      console.error('获取奖励历史记录失败:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和筛选条件变化时重新获取数据
  useEffect(() => {
    fetchHistory()
  }, [currentPage])

  // 筛选条件变化时重置到第一页并重新获取数据
  useEffect(() => {
    if (currentPage === 1) {
      fetchHistory()
    } else {
      setCurrentPage(1)
    }
  }, [filters.userIdentifier, filters.assetType, filters.status])

  const getStatusBadge = (status: 'success' | 'failed') => {
    return <Badge variant={status === 'success' ? 'default' : 'destructive'}>{status === 'success' ? '成功' : '失败'}</Badge>
  }

  const handleExport = () => {
    // In a real app, this would generate and download a CSV/Excel file
    alert('导出功能将生成包含当前筛选结果的 Excel 文件')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>发放历史</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="user-search">用户标识</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user-search"
                  placeholder="用户ID或Handle"
                  value={filters.userIdentifier}
                  onChange={(e) => setFilters((prev) => ({ ...prev, userIdentifier: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>奖励类型</Label>
              <Select value={filters.assetType} onValueChange={(value) => setFilters((prev) => ({ ...prev, assetType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="Points">Points</SelectItem>
                  <SelectItem value="QLuck">QLuck</SelectItem>
                  <SelectItem value="BLuck">BLuck</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="TON">TON</SelectItem>
                  <SelectItem value="PEPE">PEPE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>时间范围</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    选择日期范围
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters((prev) => ({ ...prev, dateFrom: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">共找到 {total} 条记录</p>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出数据
            </Button>
          </div>

          {/* History Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>用户标识</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作员</TableHead>
                  <TableHead>备注</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">加载中...</p>
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-sm text-muted-foreground">暂无数据</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{new Date(record.timestamp).toLocaleString('zh-CN')}</TableCell>
                      <TableCell>{record.userId || record.tgHandle}</TableCell>
                      <TableCell>{record.assetType}</TableCell>
                      <TableCell>{record.amount}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="text-sm">{record.operator}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{record.note || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                第 {currentPage} 页，共 {totalPages} 页
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
