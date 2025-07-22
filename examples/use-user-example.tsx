'use client'

import React from 'react'
import { useUser } from '@/hooks/use-user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function UseUserExample() {
  const { user, isAuthenticated, isLoading, login, logout, refreshUser } = useUser()

  const handleRefreshUser = async () => {
    const refreshedUser = await refreshUser()
    if (refreshedUser) {
      console.log('用户信息已刷新:', refreshedUser)
    } else {
      console.log('刷新用户信息失败')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>用户状态</CardTitle>
          <CardDescription>正在加载用户信息...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>用户状态</CardTitle>
          <CardDescription>用户未登录</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">请先登录以查看用户信息</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户状态</CardTitle>
        <CardDescription>当前用户信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">用户信息：</h3>
          <div className="bg-gray-100 p-4 rounded text-sm">
            <p>
              <strong>用户ID:</strong> {user?.userId}
            </p>
            <p>
              <strong>昵称:</strong> {user?.nickName}
            </p>
            <p>
              <strong>邮箱:</strong> {user?.email}
            </p>
            <p>
              <strong>管理员:</strong> {user?.isAdmin ? '是' : '否'}
            </p>
            <p>
              <strong>最后登录:</strong> {user?.lastLoginTime}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleRefreshUser} variant="outline">
            刷新用户信息
          </Button>
          <Button onClick={logout} variant="destructive">
            登出
          </Button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">认证状态：</h3>
          <ul className="text-sm space-y-1">
            <li>• 已认证: {isAuthenticated ? '是' : '否'}</li>
            <li>• 加载中: {isLoading ? '是' : '否'}</li>
            <li>• 用户存在: {user ? '是' : '否'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
