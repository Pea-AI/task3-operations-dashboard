'use client'

import { Suspense } from 'react'
import { AuthLayout } from '@/components/auth-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@/lib/data-model'

function TestDashboard({ user, onLogout }: { user?: User; onLogout?: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>认证测试页面</CardTitle>
            <CardDescription>此页面用于测试 AuthLayout 组件的功能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">当前用户信息：</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">测试功能：</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>检查 localStorage 中的 token 和 user 信息</li>
                  <li>测试 URL 中的 token 参数处理</li>
                  <li>验证用户权限检查</li>
                  <li>测试登出功能</li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    console.log('localStorage token:', localStorage.getItem('token'))
                    console.log('localStorage user:', localStorage.getItem('user'))
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                  检查本地存储
                </button>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href)
                    url.searchParams.set('token', 'test-token-123')
                    window.history.pushState({}, '', url.toString())
                    window.location.reload()
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                  添加测试 Token
                </button>
                <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded">
                  登出
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TestAuthContent() {
  return (
    <AuthLayout>
      <TestDashboard />
    </AuthLayout>
  )
}

export default function TestAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载...</p>
          </div>
        </div>
      }
    >
      <TestAuthContent />
    </Suspense>
  )
}
