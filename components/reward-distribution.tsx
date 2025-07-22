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
import { useSendRewardMutation, useSendPointRewardMutation, sendPointReward, sendAssetReward, type RewardResponse } from '@/hooks/use-api'
import * as XLSX from 'xlsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { useUser } from '@/hooks/use-user'

interface RewardRecord {
  id: string
  userId?: string
  tgHandle?: string
  assetType: string
  amount: number
  status: 'pending' | 'sending' | 'success' | 'failed'
  flowName?: string
  flowDescription?: string
  assetValue?: string // 存储原始的资产类型值
}

const assetTypes = [
  { value: 'point', label: 'Points 积分', assetId: '' },
  { value: 'qluck', label: 'QLuck', assetId: process.env.NODE_ENV === 'production' ? '67d24dc62c8eb74f7dbbd3cc' : '67c179d8b4fb1c2773444cbf' },
  { value: 'bluck', label: 'BLuck', assetId: process.env.NODE_ENV === 'production' ? '67e1407abc217a273fbe1e36' : '67c179d8b4fb1c2773444bbb' },
  { value: 'usdt', label: 'USDT', assetId: process.env.NODE_ENV === 'production' ? '663cbd6c515cf0d9f9d93e14' : '663b5c9c9cda043b75cbbb0e' },
  { value: 'ton', label: 'TON', assetId: process.env.NODE_ENV === 'production' ? '66cc5ab5515cf0d9f969fbaa' : '66962c11ca03b3632ae437cb' },
  { value: 'pepe', label: 'PEPE', assetId: process.env.NODE_ENV === 'production' ? '669f3278515cf0d9f9571a8a' : '66b2f57bca03b3632ad41d69' },
  { value: 'doge', label: 'DOGE', assetId: process.env.NODE_ENV === 'production' ? '' : '66962af7ca03b3632ae3e6f7' },
]

export function RewardDistribution() {
  const { user } = useUser()
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
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [resultDialogData, setResultDialogData] = useState<{
    successHandles: string[]
    notFoundUserHandles: string[]
    foundUserHandles?: string[]
    type: 'point' | 'asset'
  } | null>(null)

  // 使用发送奖励的 API
  const sendRewardMutation = useSendRewardMutation({
    onSuccess: (data: RewardResponse) => {
      const successCount = data.successHandles?.length || 0
      const failedCount = (data.notFoundUserHandles?.length || 0) + ((data.foundUserHandles?.length || 0) - successCount)

      setResultDialogData({
        successHandles: data.successHandles ?? [],
        notFoundUserHandles: data.notFoundUserHandles ?? [],
        foundUserHandles: data.foundUserHandles ?? [],
        type: 'asset',
      })
      setResultDialogOpen(true)

      toast({
        title: '发送完成',
        description: `成功: ${successCount} 个用户，失败: ${failedCount} 个用户`,
        variant: failedCount > 0 ? 'destructive' : 'default',
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

  // 使用发送积分奖励的 API
  const sendPointRewardMutation = useSendPointRewardMutation({
    onSuccess: (res: RewardResponse) => {
      const data = res.data
      const successCount = data.successHandles?.length || 0
      const failedCount = (data.notFoundUserHandles?.length || 0) + ((data.foundUserHandles?.length || 0) - successCount)
      console.log('sendPointRewardMutation data', data)
      setResultDialogData({
        successHandles: data.successHandles ?? [],
        notFoundUserHandles: data.notFoundUserHandles ?? [],
        foundUserHandles: data.foundUserHandles ?? [],
        type: 'point',
      })
      setResultDialogOpen(true)

      toast({
        title: '发送完成',
        description: `积分奖励 - 成功: ${successCount} 个用户，失败: ${failedCount} 个用户`,
        variant: failedCount > 0 ? 'destructive' : 'default',
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

    // 获取选中的资产类型
    const selectedAsset = assetTypes.find((asset) => asset.value === singleReward.assetType)
    if (!selectedAsset) {
      toast({
        title: '输入错误',
        description: '请选择有效的奖励类型',
        variant: 'destructive',
      })
      return
    }

    // 准备请求参数
    const baseParams = {
      telegramHandles: singleReward.userInputs,
      amount: Number(singleReward.amount),
      flowName: singleReward.flowName,
      flowDescription: singleReward.flowDescription,
      sender: 'admin', // 可以根据需要修改
    }

    // 根据奖励类型选择不同的API
    if (singleReward.assetType === 'point') {
      // 发送积分奖励
      sendPointRewardMutation.mutate(baseParams)
    } else {
      // 发送资产奖励
      if (!selectedAsset.assetId) {
        toast({
          title: '输入错误',
          description: '请选择有效的奖励类型',
          variant: 'destructive',
        })
        return
      }

      sendRewardMutation.mutate({
        ...baseParams,
        assetId: selectedAsset.assetId,
      })
    }
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

    // 将选中的奖励按类型分组
    const selectedRewardsData = batchRewards.filter((reward) => selectedRewards.includes(reward.id))
    const pointRewards = selectedRewardsData.filter((reward) => reward.assetValue === 'point')
    const assetRewards = selectedRewardsData.filter((reward) => reward.assetValue !== 'point')

    let successCount = 0
    let failedCount = 0

    // 处理积分奖励
    if (pointRewards.length > 0) {
      // 按 flowName 和 flowDescription 分组
      const pointGroups = pointRewards.reduce((groups, reward) => {
        const key = `${reward.flowName}-${reward.flowDescription}`
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(reward)
        return groups
      }, {} as Record<string, typeof pointRewards>)

      for (const group of Object.values(pointGroups)) {
        try {
          const baseParams = {
            telegramHandles: group.map((r) => r.tgHandle!),
            amount: group[0].amount, // 假设同组内金额相同
            flowName: group[0].flowName!,
            flowDescription: group[0].flowDescription!,
            sender: 'admin',
          }

          const response: RewardResponse = await sendPointReward(baseParams)

          // 根据API响应更新每个用户的状态
          setBatchRewards((prev) =>
            prev.map((reward) => {
              const groupReward = group.find((g) => g.id === reward.id)
              if (!groupReward) return reward

              const userHandle = groupReward.tgHandle!
              let newStatus: 'success' | 'failed' = 'failed'

              if (response.successHandles?.includes(userHandle)) {
                newStatus = 'success'
              } else if (response.notFoundUserHandles?.includes(userHandle)) {
                newStatus = 'failed'
              } else if (response.foundUserHandles?.includes(userHandle)) {
                // 用户存在但发送失败
                newStatus = 'failed'
              } else {
                // 未知状态，默认为失败
                newStatus = 'failed'
              }

              return { ...reward, status: newStatus }
            })
          )

          // 计算成功和失败的数量
          const groupSuccessCount = group.filter((g) => response.successHandles?.includes(g.tgHandle!)).length
          const groupFailedCount = group.length - groupSuccessCount
          successCount += groupSuccessCount
          failedCount += groupFailedCount
        } catch (error) {
          // 整组发送失败
          setBatchRewards((prev) => prev.map((reward) => (group.find((g) => g.id === reward.id) ? { ...reward, status: 'failed' as const } : reward)))
          failedCount += group.length
        }
      }
    }

    // 处理资产奖励
    if (assetRewards.length > 0) {
      // 按 assetType, flowName 和 flowDescription 分组
      const assetGroups = assetRewards.reduce((groups, reward) => {
        const key = `${reward.assetValue}-${reward.flowName}-${reward.flowDescription}`
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(reward)
        return groups
      }, {} as Record<string, typeof assetRewards>)

      for (const group of Object.values(assetGroups)) {
        try {
          const assetType = assetTypes.find((a) => a.value === group[0].assetValue)
          if (!assetType?.assetId) {
            throw new Error(`无效的资产类型: ${group[0].assetValue}`)
          }

          const baseParams = {
            telegramHandles: group.map((r) => r.tgHandle!),
            assetId: assetType.assetId,
            amount: group[0].amount, // 假设同组内金额相同
            flowName: group[0].flowName!,
            flowDescription: group[0].flowDescription!,
            sender: user?.nickName || 'admin',
          }

          const response: RewardResponse = await sendAssetReward(baseParams)

          // 根据API响应更新每个用户的状态
          setBatchRewards((prev) =>
            prev.map((reward) => {
              const groupReward = group.find((g) => g.id === reward.id)
              if (!groupReward) return reward

              const userHandle = groupReward.tgHandle!
              let newStatus: 'success' | 'failed' = 'failed'

              if (response.successHandles?.includes(userHandle)) {
                newStatus = 'success'
              } else if (response.notFoundUserHandles?.includes(userHandle)) {
                newStatus = 'failed'
              } else if (response.foundUserHandles?.includes(userHandle)) {
                // 用户存在但发送失败
                newStatus = 'failed'
              } else {
                // 未知状态，默认为失败
                newStatus = 'failed'
              }

              return { ...reward, status: newStatus }
            })
          )

          // 计算成功和失败的数量
          const groupSuccessCount = group.filter((g) => response.successHandles?.includes(g.tgHandle!)).length
          const groupFailedCount = group.length - groupSuccessCount
          successCount += groupSuccessCount
          failedCount += groupFailedCount
        } catch (error) {
          // 整组发送失败
          setBatchRewards((prev) => prev.map((reward) => (group.find((g) => g.id === reward.id) ? { ...reward, status: 'failed' as const } : reward)))
          failedCount += group.length
        }
      }
    }

    setIsLoading(false)
    toast({
      title: '批量发送完成',
      description: `成功: ${successCount} 条，失败: ${failedCount} 条`,
    })
  }
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: '文件格式错误',
        description: '请上传 .xlsx 或 .xls 格式的文件',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // 转换为JSON数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        // 验证并转换数据
        const parsedData: RewardRecord[] = []
        const errors: string[] = []

        jsonData.forEach((row, index) => {
          const rowNum = index + 2 // Excel行号从2开始（去掉标题行）

          // 验证必填字段
          if (!row.telegramHandle || !row.assetType || !row.amount || !row.flowName || !row.flowDescription) {
            errors.push(`第${rowNum}行：缺少必填字段`)
            return
          }

          // 验证telegramHandle格式
          const telegramHandle = row.telegramHandle.toString().trim()
          if (!telegramHandle.startsWith('@')) {
            errors.push(`第${rowNum}行：telegramHandle 必须以@开头`)
            return
          }

          // 验证assetType
          const assetType = row.assetType.toString().trim()
          const validAssetTypes = assetTypes.map((a) => a.value)
          if (!validAssetTypes.includes(assetType)) {
            errors.push(`第${rowNum}行：不支持的资产类型 ${assetType}`)
            return
          }

          // 验证amount
          const amount = Number(row.amount)
          if (isNaN(amount) || amount <= 0) {
            errors.push(`第${rowNum}行：奖励数量必须是大于0的数字`)
            return
          }

          // 检查资产类型是否有效（非积分类型需要有assetId）
          const assetConfig = assetTypes.find((a) => a.value === assetType)
          if (assetType !== 'point' && !assetConfig?.assetId) {
            errors.push(`第${rowNum}行：资产类型 ${assetType} 在当前环境下不可用`)
            return
          }

          parsedData.push({
            id: (index + 1).toString(),
            tgHandle: telegramHandle,
            assetType: assetConfig?.label || assetType,
            amount: amount,
            status: 'pending',
            // 存储额外信息供后续使用
            flowName: row.flowName.toString().trim(),
            flowDescription: row.flowDescription.toString().trim(),
            assetValue: assetType, // 存储原始值
          } as RewardRecord & { flowName: string; flowDescription: string; assetValue: string })
        })

        if (errors.length > 0) {
          toast({
            title: '文件解析失败',
            description: errors.slice(0, 3).join('; ') + (errors.length > 3 ? '...' : ''),
            variant: 'destructive',
          })
          return
        }

        if (parsedData.length === 0) {
          toast({
            title: '文件为空',
            description: '没有找到有效的奖励记录',
            variant: 'destructive',
          })
          return
        }

        setBatchRewards(parsedData)
        setSelectedRewards(parsedData.map((r) => r.id))

        toast({
          title: '文件上传成功',
          description: `已解析 ${parsedData.length} 条奖励记录`,
        })
      } catch (error) {
        toast({
          title: '文件解析失败',
          description: '请检查文件格式是否正确',
          variant: 'destructive',
        })
      }
    }

    reader.readAsArrayBuffer(file)
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

  const handleDownloadTemplate = () => {
    // 创建模板数据
    const templateData = [
      {
        telegramHandle: '@example_user1',
        assetType: 'point',
        amount: 100,
        flowName: 'Daily Check-in',
        flowDescription: 'Daily check-in reward',
      },
      {
        telegramHandle: '@example_user2',
        assetType: 'usdt',
        amount: 10,
        flowName: 'Task Completion',
        flowDescription: 'Task completion reward',
      },
      {
        telegramHandle: '@example_user3',
        assetType: 'ton',
        amount: 5,
        flowName: 'Weekly Bonus',
        flowDescription: 'Weekly bonus reward',
      },
    ]

    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(templateData)

    // 设置列宽
    const colWidths = [
      { wch: 20 }, // telegramHandle
      { wch: 15 }, // assetType
      { wch: 10 }, // amount
      { wch: 25 }, // flowName
      { wch: 30 }, // flowDescription
    ]
    worksheet['!cols'] = colWidths

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reward Template')

    // 添加说明工作表
    const instructionsData = [
      { Field: 'telegramHandle', Description: 'Telegram用户名，格式：@username', Required: 'Yes', Example: '@example_user1' },
      { Field: 'assetType', Description: '奖励类型', Required: 'Yes', Example: 'point, qluck, bluck, usdt, ton, pepe, doge' },
      { Field: 'amount', Description: '奖励数量', Required: 'Yes', Example: '100' },
      { Field: 'flowName', Description: '流程名称', Required: 'Yes', Example: 'Daily Check-in' },
      { Field: 'flowDescription', Description: '流程描述', Required: 'Yes', Example: 'Daily check-in reward' },
    ]

    const instructionsWorksheet = XLSX.utils.json_to_sheet(instructionsData)
    instructionsWorksheet['!cols'] = [
      { wch: 20 }, // Field
      { wch: 40 }, // Description
      { wch: 10 }, // Required
      { wch: 30 }, // Example
    ]
    XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instructions')

    // 下载文件
    const fileName = `reward-template-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)

    toast({
      title: '下载成功',
      description: '模板文件已下载到您的设备',
    })
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
                      onBlur={() => {
                        if (userInputValue.trim()) {
                          setSingleReward((prev) => ({
                            ...prev,
                            userInputs: [...prev.userInputs, userInputValue.trim()],
                          }))
                          setUserInputValue('')
                        }
                      }}
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
                    <Select
                      defaultValue="point"
                      value={singleReward.assetType}
                      onValueChange={(value) => setSingleReward((prev) => ({ ...prev, assetType: value }))}
                    >
                      <SelectTrigger className="w-48 rounded-r-none">
                        <SelectValue placeholder="选择奖励类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {assetTypes.map((asset) => (
                          <SelectItem key={asset.value} value={asset.value} disabled={asset.value !== 'point' && !asset.assetId}>
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

              <Button
                onClick={handleSingleRewardSubmit}
                disabled={sendRewardMutation.isPending || sendPointRewardMutation.isPending}
                className="w-full md:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendRewardMutation.isPending || sendPointRewardMutation.isPending ? '发送中...' : '发送奖励'}
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
                <Button variant="outline" className="md:w-auto bg-transparent" onClick={handleDownloadTemplate}>
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

      {/* 发送结果 Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>奖励发送结果</DialogTitle>
            <DialogDescription>本次奖励发送的详细结果如下：</DialogDescription>
          </DialogHeader>
          {resultDialogData && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">成功用户 ({resultDialogData.successHandles.length})：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resultDialogData.successHandles.length > 0 ? (
                    resultDialogData.successHandles.map((h, i) => (
                      <Badge key={i} variant="default">
                        {h}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">无</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-semibold">未找到用户 ({resultDialogData.notFoundUserHandles.length})：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {resultDialogData.notFoundUserHandles.length > 0 ? (
                    resultDialogData.notFoundUserHandles.map((h, i) => (
                      <Badge key={i} variant="destructive">
                        {h}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">无</span>
                  )}
                </div>
              </div>
              {resultDialogData.foundUserHandles && resultDialogData.foundUserHandles.length > 0 && (
                <div>
                  <span className="font-semibold">已找到用户 ({resultDialogData.foundUserHandles.length})：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {resultDialogData.foundUserHandles.map((h, i) => (
                      <Badge key={i} variant="secondary">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">关闭</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
