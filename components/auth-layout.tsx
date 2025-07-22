'use client'

import React, { ReactNode } from 'react'
import { LoginPage } from '@/components/login-page'
import { NoPermission } from '@/components/no-permission'
import { useUser } from '@/hooks/use-user'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { user, isAuthenticated, isLoading, login, logout } = useUser()

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证身份...</p>
        </div>
      </div>
    )
  }

  // 未登录状态
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  // 已登录但无权限
  if (user && !user.isAdmin) {
    return <NoPermission onLogout={logout} />
  }

  // 已登录且有权限，渲染子组件
  return (
    <>
      {React.cloneElement(children as React.ReactElement<any>, {
        user,
        onLogout: logout,
      })}
    </>
  )
}
