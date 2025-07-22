import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUserInfo } from '@/hooks/use-api'
import { User } from '@/lib/data-model'

interface UseUserReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
  refreshUser: () => Promise<User | null>
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 客户端检查，避免服务端渲染问题
  const [isClient, setIsClient] = useState(false)
  const searchParams = useSearchParams()

  // 获取用户信息
  const fetchUserInfo = useCallback(async (token: string): Promise<User | null> => {
    try {
      const response = await getUserInfo()
      console.log('fetchUserInfo response', response)
      const userData = response.data
      const userWithAdmin: User = userData

      setUser(userWithAdmin)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userWithAdmin))
      return userWithAdmin
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除 token 和用户数据
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
      return null
    }
  }, [])

  // 处理登录
  const login = useCallback((userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  // 处理登出
  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  // 刷新用户信息
  const refreshUser = useCallback(async (): Promise<User | null> => {
    const token = localStorage.getItem('token')
    if (!token) {
      return null
    }
    return await fetchUserInfo(token)
  }, [fetchUserInfo])

  // 处理 URL 中的 token 参数
  const handleUrlToken = useCallback(async (): Promise<User | null> => {
    if (!isClient || !searchParams) return null
    console.log('handleUrlToken searchParams', { isClient, searchParams })
    const token = searchParams.get('token')
    if (token) {
      // 存储 token
      localStorage.setItem('token', token)

      // 获取用户信息
      const userData = await fetchUserInfo(token)

      // 移除 URL 中的 token 参数，避免 token 外泄
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('token')
      router.replace(newUrl.pathname + newUrl.search)

      return userData
    }
    return null
  }, [isClient, searchParams, fetchUserInfo, router])

  // 检查本地存储的认证状态
  const checkLocalAuth = useCallback(async (): Promise<void> => {
    if (!isClient) return

    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (savedUser && token) {
      try {
        // 验证 token 是否有效
        const userData = await fetchUserInfo(token)
        if (!userData) {
          // token 无效，清除本地数据
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (error) {
        // token 无效，清除本地数据
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [fetchUserInfo, isClient])

  // 设置客户端状态
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 初始化认证状态
  useEffect(() => {
    if (!isClient) return

    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // 首先处理 URL 中的 token
        const urlTokenUser = await handleUrlToken()

        // 如果没有 URL token，检查本地存储
        if (!urlTokenUser) {
          await checkLocalAuth()
        }
      } catch (error) {
        console.error('认证初始化失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isClient, handleUrlToken, checkLocalAuth])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  }
}
