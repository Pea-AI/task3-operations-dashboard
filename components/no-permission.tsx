'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, LogOut } from 'lucide-react'

interface NoPermissionProps {
  onLogout: () => void
}

export function NoPermission({ onLogout }: NoPermissionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">无操作权限</CardTitle>
          <CardDescription>您当前登录的账号没有管理员权限，无法访问运营管理后台</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">如需访问此系统，请联系系统管理员为您分配相应的权限</p>
          <Button onClick={onLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
