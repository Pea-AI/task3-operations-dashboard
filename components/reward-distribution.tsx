'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Upload, Send, FileSpreadsheet, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSendRewardMutation } from '@/hooks/use-api'

interface RewardRecord {
  id: string
  userId?: string
  tgHandle?: string
  assetType: string
  amount: number
  status: 'pending' | 'sending' | 'success' | 'failed'
}

const assetTypes = [
  { value: 'qluck', label: 'QLuck', assetId: '1002' },
  { value: 'bluck', label: 'BLuck', assetId: '1003' },
  { value: 'usdt', label: 'USDT', assetId: '663cbd6c515cf0d9f9d93e14' },
  { value: 'ton', label: 'TON', assetId: '1005' },
  { value: 'pepe', label: 'PEPE', assetId: '1006' },
]

export function RewardDistribution() {
  const [singleReward, setSingleReward] = useState({
    userType: 'tgHandle',
    userInputs: [] as string[],
    assetType: '',
    amount: '',
    flowName: '',
    flowDescription: '',
  })
  const [userInputValue, setUserInputValue] = useState('')
  const [batchRewards, setBatchRewards] = useState<RewardRecord[]>([])
  const [selectedRewards, setSelectedRewards] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // 使用发送奖励的 API
  const sendRewardMutation = useSendRewardMutation({
    onSuccess: (data: any) => {
      toast({
        title: '发送成功',
        description: `奖励已成功发送给 ${singleReward.userInputs.length} 个用户`,
      })
      // 重置表单
      setSingleReward({
        userType: 'tgHandle',
        userInputs: [],
        assetType: '',
        amount: '',
        flowName: '',
        flowDescription: '',
      })
      setUserInputValue('')
    },
    onError: (error: Error) => {
      toast({
        title: '发送失败',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSingleRewardSubmit = async () => {
    if (
      singleReward.userInputs.length === 0 ||
      !singleReward.assetType ||
      !singleReward.amount ||
      !singleReward.flowName ||
      !singleReward.flowDescription
    ) {
      toast({
        title: '输入错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      })
      return
    }

    // 获取选中的资产类型的 assetId
    const selectedAsset = assetTypes.find((asset) => asset.value === singleReward.assetType)
    if (!selectedAsset?.assetId) {
      toast({
        title: '输入错误',
        description: '请选择有效的奖励类型',
        variant: 'destructive',
      })
      return
    }

    // 发送奖励请求
    sendRewardMutation.mutate([
      {
        telegramHandles: singleReward.userInputs,
        assetId: selectedAsset.assetId,
        amount: Number(singleReward.amount),
        flowName: singleReward.flowName,
        flowDescription: singleReward.flowDescription,
        sender: 'admin', // 可以根据需要修改
      },
    ])
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Simulate Excel parsing
    const mockData: RewardRecord[] = [
      {
        id: '1',
        userId: '12345',
        tgHandle: '@user1',
        assetType: 'USDT',
        amount: 10,
        status: 'pending',
      },
      {
        id: '2',
        userId: '12346',
        tgHandle: '@user2',
        assetType: 'Points',
        amount: 100,
        status: 'pending',
      },
      {
        id: '3',
        userId: '12347',
        tgHandle: '@user3',
        assetType: 'TON',
        amount: 5,
        status: 'pending',
      },
    ]

    setBatchRewards(mockData)
    setSelectedRewards(mockData.map((r) => r.id))

    toast({
      title: '文件上传成功',
      description: `已解析 ${mockData.length} 条奖励记录`,
    })
  }

  const handleBatchSend = async () => {
    if (selectedRewards.length === 0) {
      toast({
        title: '请选择记录',
        description: '请至少选择一条记录进行发送',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    // Update status to sending
    setBatchRewards((prev) => prev.map((reward) => (selectedRewards.includes(reward.id) ? { ...reward, status: 'sending' as const } : reward)))

    // Simulate batch sending
    for (let i = 0; i < selectedRewards.length; i++) {
      setTimeout(() => {
        setBatchRewards((prev) =>
          prev.map((reward) =>
            reward.id === selectedRewards[i] ? { ...reward, status: Math.random() > 0.1 ? 'success' : ('failed' as const) } : reward
          )
        )

        if (i === selectedRewards.length - 1) {
          setIsLoading(false)
          toast({
            title: '批量发送完成',
            description: `已处理 ${selectedRewards.length} 条记录`,
          })
        }
      }, (i + 1) * 1000)
    }
  }

  const toggleRewardSelection = (rewardId: string) => {
    setSelectedRewards((prev) => (prev.includes(rewardId) ? prev.filter((id) => id !== rewardId) : [...prev, rewardId]))
  }

  const toggleSelectAll = () => {
    setSelectedRewards((prev) => (prev.length === batchRewards.length ? [] : batchRewards.map((r) => r.id)))
  }

  const handleAddUser = () => {
    if (userInputValue.trim() && !singleReward.userInputs.includes(userInputValue.trim())) {
      setSingleReward((prev) => ({
        ...prev,
        userInputs: [...prev.userInputs, userInputValue.trim()],
      }))
      setUserInputValue('')
    }
  }

  const handleRemoveUser = (userToRemove: string) => {
    setSingleReward((prev) => ({
      ...prev,
      userInputs: prev.userInputs.filter((user) => user !== userToRemove),
    }))
  }

  const handleUserInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddUser()
    }
  }

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.includes(',')) {
      const users = value
        .split(',')
        .map((user) => user.trim())
        .filter((user) => user)
      const newUsers = users.filter((user) => !singleReward.userInputs.includes(user))
      if (newUsers.length > 0) {
        setSingleReward((prev) => ({
          ...prev,
          userInputs: [...prev.userInputs, ...newUsers],
        }))
      }
      setUserInputValue('')
    } else {
      setUserInputValue(value)
    }
  }

  const getStatusBadge = (status: RewardRecord['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: '待发送' },
      sending: { variant: 'default' as const, text: '发送中' },
      success: { variant: 'default' as const, text: '成功' },
      failed: { variant: 'destructive' as const, text: '失败' },
    }

    const config = variants[status]
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">快速发放</TabsTrigger>
          <TabsTrigger value="batch">批量发放</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>快速奖励发送</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* User Input with Type Selector */}
                <div className="space-y-2">
                  <Label htmlFor="userInput">用户</Label>
                  <div className="flex">
                    <Select value={singleReward.userType} onValueChange={(value) => setSingleReward((prev) => ({ ...prev, userType: value }))}>
                      <SelectTrigger className="w-48 rounded-r-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tgHandle">Telegram Handle</SelectItem>
                        <SelectItem value="userId" disabled>
                          User ID
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="userInput"
                      placeholder={singleReward.userType === 'tgHandle' ? '输入 @username，按回车或逗号添加' : '输入用户 ID，按回车或逗号添加'}
                      value={userInputValue}
                      onChange={handleUserInputChange}
                      onKeyDown={handleUserInputKeyDown}
                      className="flex-1 rounded-l-none"
                    />
                  </div>

                  {/* Display User Tags */}
                  {singleReward.userInputs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {singleReward.userInputs.map((user, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {user}
                          <button onClick={() => handleRemoveUser(user)} className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-1">输入用户名后按回车或逗号添加，点击标签上的 × 可以删除</p>
                </div>

                {/* Reward Input with Asset Type Selector */}
                <div className="space-y-2">
                  <Label htmlFor="amount">奖励</Label>
                  <div className="flex">
                    <Select value={singleReward.assetType} onValueChange={(value) => setSingleReward((prev) => ({ ...prev, assetType: value }))}>
                      <SelectTrigger className="w-48 rounded-r-none">
                        <SelectValue placeholder="选择奖励类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypes.map((asset) => (
                          <SelectItem key={asset.value} value={asset.value}>
                            {asset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="输入数量"
                      value={singleReward.amount}
                      onChange={(e) => setSingleReward((prev) => ({ ...prev, amount: e.target.value }))}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                </div>

                {/* Flow Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="flowName">FlowName</Label>
                  <Input
                    id="flowName"
                    placeholder="输入流程名称"
                    value={singleReward.flowName}
                    onChange={(e) => setSingleReward((prev) => ({ ...prev, flowName: e.target.value }))}
                  />
                </div>

                {/* Flow Description Input */}
                <div className="space-y-2">
                  <Label htmlFor="flowDescription">FlowDescription</Label>
                  <Input
                    id="flowDescription"
                    placeholder="输入流程描述"
                    value={singleReward.flowDescription}
                    onChange={(e) => setSingleReward((prev) => ({ ...prev, flowDescription: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSingleRewardSubmit} disabled={sendRewardMutation.isPending} className="w-full md:w-auto">
                <Send className="h-4 w-4 mr-2" />
                {sendRewardMutation.isPending ? '发送中...' : '发送奖励'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>批量奖励发送</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">点击上传 Excel 文件</p>
                      <p className="text-xs text-gray-400 mt-1">支持 .xlsx 格式</p>
                    </div>
                    <Input id="file-upload" type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                  </Label>
                </div>
                <Button variant="outline" className="md:w-auto bg-transparent">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  下载模板
                </Button>
              </div>

              {batchRewards.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="select-all" checked={selectedRewards.length === batchRewards.length} onCheckedChange={toggleSelectAll} />
                      <Label htmlFor="select-all">
                        全选 ({selectedRewards.length}/{batchRewards.length})
                      </Label>
                    </div>
                    <Button onClick={handleBatchSend} disabled={isLoading || selectedRewards.length === 0}>
                      <Send className="h-4 w-4 mr-2" />
                      发送所选奖励
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">选择</TableHead>
                          <TableHead>用户标识</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>数量</TableHead>
                          <TableHead>状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchRewards.map((reward) => (
                          <TableRow key={reward.id}>
                            <TableCell>
                              <Checkbox checked={selectedRewards.includes(reward.id)} onCheckedChange={() => toggleRewardSelection(reward.id)} />
                            </TableCell>
                            <TableCell>{reward.userId || reward.tgHandle}</TableCell>
                            <TableCell>{reward.assetType}</TableCell>
                            <TableCell>{reward.amount}</TableCell>
                            <TableCell>{getStatusBadge(reward.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
