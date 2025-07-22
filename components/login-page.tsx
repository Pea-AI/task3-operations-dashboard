'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chrome } from 'lucide-react'
import { User } from '@/lib/data-model'

interface LoginPageProps {
  onLogin: (user: User) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)

    try {
      // 跳转到 admin.task3.org 登录
      const host = process.env.NODE_ENV === 'production' ? `https://admin.task3.org` : `https://admin-dev.task3.org`
      window.open(`${host}/auth?auth_type=task3_auth&redirect_url=${window.location.href}`, '_self')
    } catch (error) {
      console.error('登录失败:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">运营管理后台</CardTitle>
          <CardDescription>使用 Task3 账号登录访问运营管理系统</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? '登录中...' : '使用 Task3 账号登录'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
