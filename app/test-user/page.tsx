'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function TestUserPage() {
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentToken, setCurrentToken] = useState<string>('')
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [userTokens, setUserTokens] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // 创建认证请求头
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`
    }

    return headers
  }

  // 创建 token
  const createToken = async (userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          app_id: 'test_app_001',
          app_handle: 'test_app',
        }),
      })
      const result = await response.json()

      if (result.success) {
        setCurrentToken(result.data.token)
        toast({
          title: '成功',
          description: 'Token创建成功',
        })
      } else {
        toast({
          title: '错误',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '创建Token失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 验证 token
  const validateToken = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/token', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      const result = await response.json()

      if (result.success) {
        setTokenInfo(result.data)
        setCurrentToken(token)
        toast({
          title: '成功',
          description: 'Token验证成功',
        })
      } else {
        toast({
          title: '错误',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '验证Token失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取用户的 token 列表
  const fetchUserTokens = async () => {
    if (!currentToken) {
      toast({
        title: '错误',
        description: '请先设置Token',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/token', {
        headers: getAuthHeaders(),
      })
      const result = await response.json()

      if (result.success) {
        setUserTokens(result.data)
        toast({
          title: '成功',
          description: 'Token列表获取成功',
        })
      } else {
        toast({
          title: '错误',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '获取Token列表失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取用户信息（需要认证）
  const fetchUserInfo = async () => {
    if (!currentToken) {
      toast({
        title: '错误',
        description: '请先设置Token',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user', {
        headers: getAuthHeaders(),
      })
      const result = await response.json()

      if (result.success) {
        setUsers(result.data.users || [])
        toast({
          title: '成功',
          description: '用户信息获取成功',
        })
      } else {
        toast({
          title: '错误',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '获取用户信息失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 通过ID获取用户
  const fetchUserById = async (id: string) => {
    if (!currentToken) {
      toast({
        title: '错误',
        description: '请先设置Token',
        variant: 'destructive',
      })
      return
    }

    if (!id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user?id=${id}`, {
        headers: getAuthHeaders(),
      })
      const result = await response.json()

      if (result.success) {
        setCurrentUser(result.data)
        toast({
          title: '成功',
          description: '用户信息获取成功',
        })
      } else {
        toast({
          title: '错误',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '获取用户信息失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 创建用户（不需要认证）
  const createUser = async (userData: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: '成功',
          description: '用户创建成功',
        })
        // 自动为新用户创建 token
        await createToken(result.data.id)
      } else {
        toast({
          title: '错误',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '创建用户失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 更新用户信息（需要认证）
  const updateUser = async (updateData: any) => {
    if (!currentToken) {
      toast({
        title: '错误',
        description: '请先设置Token',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: '成功',
          description: '用户更新成功',
        })
        fetchUserInfo() // 重新获取用户信息
      } else {
        toast({
          title: '错误',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '更新用户失败',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 示例用户数据
  const sampleUserData = {
    app_id: 'test_app_001',
    app_handle: 'test_handle',
    from_channel: 'web',
    register_method: 'email',
    first_name: 'John',
    last_name: 'Doe',
    avatar: 'https://example.com/avatar.jpg',
    nick_name: 'johnny',
    email: 'john.doe@example.com',
    description: 'Test user description',
    interested_tags: ['tech', 'programming'],
    ip: '192.168.1.1',
    country_code: 'US',
    browser_languages: ['en', 'zh'],
    language: 'en',
    is_bot: false,
    handler: 'john_doe_' + Date.now(),
    is_certified_account: false,
    humanVerify: true,
    line_info: {
      version: '1.0.0',
      isInClient: true,
      os: 'macOS',
    },
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">用户信息 API 测试 (带Token认证)</h1>

      {/* Token 管理区域 */}
      <Card>
        <CardHeader>
          <CardTitle>Token 管理</CardTitle>
          <CardDescription>管理和验证访问令牌</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">当前Token</Label>
            <div className="flex gap-2">
              <Input
                id="token"
                type="password"
                placeholder="输入或粘贴Token"
                value={currentToken}
                onChange={(e) => setCurrentToken(e.target.value)}
              />
              <Button onClick={() => validateToken(currentToken)} disabled={isLoading || !currentToken}>
                验证
              </Button>
            </div>
          </div>

          {currentToken && (
            <Alert>
              <AlertDescription>Token已设置，现在可以访问需要认证的API</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={fetchUserTokens} disabled={isLoading || !currentToken} variant="outline">
              获取Token列表
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token 信息显示 */}
      {tokenInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Token 信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Token:</strong> {tokenInfo.token.substring(0, 20)}...
              </div>
              <div>
                <strong>用户ID:</strong> {tokenInfo.user.id}
              </div>
              <div>
                <strong>用户名:</strong> {tokenInfo.user.first_name} {tokenInfo.user.last_name}
              </div>
              <div>
                <strong>Handler:</strong> {tokenInfo.user.handler}
              </div>
              <div>
                <strong>邮箱:</strong> {tokenInfo.user.email}
              </div>
              <div>
                <strong>创建时间:</strong> {new Date(tokenInfo.created_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 操作面板 */}
        <Card>
          <CardHeader>
            <CardTitle>API 操作</CardTitle>
            <CardDescription>测试用户信息相关的 API 操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchUserInfo} disabled={isLoading || !currentToken} className="w-full">
              {isLoading ? '加载中...' : '获取用户信息'}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="userId">通过ID获取用户</Label>
              <div className="flex gap-2">
                <Input
                  id="userId"
                  placeholder="输入用户ID"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchUserById((e.target as HTMLInputElement).value)
                    }
                  }}
                />
                <Button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement
                    fetchUserById(input.value)
                  }}
                  disabled={isLoading || !currentToken}
                >
                  获取
                </Button>
              </div>
            </div>

            <Button onClick={() => createUser(sampleUserData)} disabled={isLoading} className="w-full" variant="outline">
              创建示例用户
            </Button>

            <Button
              onClick={() => updateUser({ description: '更新的描述信息 - ' + Date.now() })}
              disabled={isLoading || !currentToken}
              className="w-full"
              variant="outline"
            >
              更新用户信息
            </Button>
          </CardContent>
        </Card>

        {/* 当前用户信息 */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle>当前用户信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>ID:</strong> {currentUser.id}
                </div>
                <div>
                  <strong>名字:</strong> {currentUser.first_name} {currentUser.last_name}
                </div>
                <div>
                  <strong>昵称:</strong> {currentUser.nick_name}
                </div>
                <div>
                  <strong>邮箱:</strong> {currentUser.email}
                </div>
                <div>
                  <strong>Handler:</strong> {currentUser.handler}
                </div>
                <div>
                  <strong>注册方式:</strong> {currentUser.register_method}
                </div>
                <div>
                  <strong>来源渠道:</strong> {currentUser.from_channel}
                </div>
                <div>
                  <strong>创建时间:</strong> {new Date(currentUser.created_at).toLocaleString()}
                </div>
                <div>
                  <strong>更新时间:</strong> {new Date(currentUser.updated_at).toLocaleString()}
                </div>
                {currentUser.interested_tags && currentUser.interested_tags.length > 0 && (
                  <div>
                    <strong>兴趣标签:</strong> {currentUser.interested_tags.join(', ')}
                  </div>
                )}
                {currentUser.description && (
                  <div>
                    <strong>描述:</strong> {currentUser.description}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 用户列表 */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>用户列表 ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                        {user.nick_name && <span className="text-muted-foreground ml-2">({user.nick_name})</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email} • {user.handler}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.register_method} • {user.from_channel}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => fetchUserById(user.id)}>
                      查看详情
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token 列表 */}
      {userTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Token 列表 ({userTokens.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTokens.map((token) => (
                <div key={token.id} className="border rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Token:</strong> {token.token.substring(0, 20)}...
                    </div>
                    <div>
                      <strong>状态:</strong> {token.status}
                    </div>
                    <div>
                      <strong>App ID:</strong> {token.app_id}
                    </div>
                    <div>
                      <strong>App Handle:</strong> {token.app_handle}
                    </div>
                    <div>
                      <strong>创建时间:</strong> {new Date(token.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 示例用户数据 */}
      <Card>
        <CardHeader>
          <CardTitle>示例用户数据</CardTitle>
          <CardDescription>用于测试的示例用户数据结构</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={JSON.stringify(sampleUserData, null, 2)} readOnly rows={20} className="font-mono text-sm" />
        </CardContent>
      </Card>
    </div>
  )
}
