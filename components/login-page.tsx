"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome } from "lucide-react"

interface LoginPageProps {
  onLogin: (user: any) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    // Simulate Google OAuth login
    setTimeout(() => {
      const mockUser = {
        name: "Operations Manager",
        email: "ops@company.com",
        avatar: "/placeholder-user.jpg",
      }
      onLogin(mockUser)
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">运营管理后台</CardTitle>
          <CardDescription>使用 Google 账号登录访问运营管理系统</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleLogin} disabled={isLoading} className="w-full" size="lg">
            <Chrome className="mr-2 h-4 w-4" />
            {isLoading ? "登录中..." : "使用 Google 账号登录"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
