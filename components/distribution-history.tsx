"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, Download } from "lucide-react"

interface HistoryRecord {
  id: string
  timestamp: string
  userId?: string
  tgHandle?: string
  assetType: string
  amount: number
  status: "success" | "failed"
  operator: string
  note?: string
}

const mockHistory: HistoryRecord[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:30:25",
    userId: "12345",
    tgHandle: "@user1",
    assetType: "USDT",
    amount: 10,
    status: "success",
    operator: "ops@company.com",
    note: "社区活动奖励",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:25:10",
    userId: "12346",
    tgHandle: "@user2",
    assetType: "Points",
    amount: 100,
    status: "success",
    operator: "ops@company.com",
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:20:45",
    userId: "12347",
    tgHandle: "@user3",
    assetType: "TON",
    amount: 5,
    status: "failed",
    operator: "ops@company.com",
    note: "用户钱包地址无效",
  },
  {
    id: "4",
    timestamp: "2024-01-14 16:15:30",
    userId: "12348",
    tgHandle: "@user4",
    assetType: "QLuck",
    amount: 50,
    status: "success",
    operator: "ops@company.com",
  },
  {
    id: "5",
    timestamp: "2024-01-14 15:45:20",
    userId: "12349",
    tgHandle: "@user5",
    assetType: "PEPE",
    amount: 1000,
    status: "success",
    operator: "ops@company.com",
    note: "推荐奖励",
  },
]

export function DistributionHistory() {
  const [history] = useState<HistoryRecord[]>(mockHistory)
  const [filters, setFilters] = useState({
    userIdentifier: "",
    assetType: "all",
    status: "all",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredHistory = history.filter((record) => {
    const matchesUser =
      !filters.userIdentifier ||
      record.userId?.includes(filters.userIdentifier) ||
      record.tgHandle?.includes(filters.userIdentifier)

    const matchesAsset = filters.assetType === "all" || record.assetType === filters.assetType
    const matchesStatus = filters.status === "all" || record.status === filters.status

    // Simple date filtering (in real app, you'd parse the timestamp properly)
    const matchesDate = true // Simplified for demo

    return matchesUser && matchesAsset && matchesStatus && matchesDate
  })

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getStatusBadge = (status: "success" | "failed") => {
    return (
      <Badge variant={status === "success" ? "default" : "destructive"}>{status === "success" ? "成功" : "失败"}</Badge>
    )
  }

  const handleExport = () => {
    // In a real app, this would generate and download a CSV/Excel file
    alert("导出功能将生成包含当前筛选结果的 Excel 文件")
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
              <Select
                value={filters.assetType}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, assetType: value }))}
              >
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
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
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
            <p className="text-sm text-muted-foreground">共找到 {filteredHistory.length} 条记录</p>
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
                {paginatedHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.timestamp}</TableCell>
                    <TableCell>{record.userId || record.tgHandle}</TableCell>
                    <TableCell>{record.assetType}</TableCell>
                    <TableCell>{record.amount}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm">{record.operator}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{record.note || "-"}</TableCell>
                  </TableRow>
                ))}
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
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
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
