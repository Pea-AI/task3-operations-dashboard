'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@/lib/data-model'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Building2, Gift, History, LogOut, Menu, Settings } from 'lucide-react'
import { CommunityManagement } from '@/components/community-management'
import { RewardDistribution } from '@/components/reward-distribution'
import { DistributionHistory } from '@/components/distribution-history'
import { PromotionManagement } from '@/components/promotion-management'
import { useUser } from '@/hooks/use-user'

export function Dashboard() {
  const { user, isAuthenticated, isLoading, login, logout } = useUser()
  // 如果没有用户数据或登出函数，显示错误
  // if (!user || !onLogout) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <p className="text-gray-600">认证信息缺失</p>
  //       </div>
  //     </div>
  //   )
  // }
  const [activeTab, setActiveTab] = useState('community')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: 'community', label: '社区管理', icon: Building2 },
    { id: 'rewards', label: '奖励发放', icon: Gift },
    { id: 'history', label: '发放历史', icon: History },
    { id: 'promotion', label: '推广配置', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'community':
        return <CommunityManagement />
      case 'rewards':
        return <RewardDistribution />
      case 'history':
        return <DistributionHistory />
      case 'promotion':
        return <PromotionManagement />
      default:
        return <CommunityManagement />
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white z-[999]">
      <div className="p-6">
        <h2 className="text-lg font-semibold">运营管理后台</h2>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Button
                  variant={activeTab === item.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold ml-2 md:ml-0">{menuItems.find((item) => item.id === activeTab)?.label}</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || '/placeholder.svg'} alt={user?.nickName} />
                  <AvatarFallback>{user?.nickName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex-col items-start">
                <div className="font-medium">{user?.nickName}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
