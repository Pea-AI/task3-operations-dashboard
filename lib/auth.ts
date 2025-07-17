import { NextRequest } from 'next/server'
import prisma from './prisma'

export interface AuthUser {
  id: string
  token: string
  app_id?: string
  app_handle?: string
  open_id?: string
}

/**
 * 验证请求头中的 token 并返回对应的用户信息
 */
export async function validateToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    // 从请求头中获取 token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.headers.get('token')

    if (!token) {
      return null
    }

    // 在数据库中查找 token
    const tokenRecord = await prisma.ftToken.findFirst({
      where: {
        token,
        status: 'COMMON_STATUS_ACTIVE',
      },
      include: {
        user: true,
      },
    })

    if (!tokenRecord) {
      return null
    }

    return {
      id: tokenRecord.user_id,
      token: tokenRecord.token,
      app_id: tokenRecord.app_id || undefined,
      app_handle: tokenRecord.app_handle || undefined,
      open_id: tokenRecord.open_id || undefined,
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

/**
 * 认证中间件，验证用户身份
 */
export async function authenticate(request: NextRequest): Promise<{
  success: boolean
  user?: AuthUser
  error?: string
}> {
  const user = await validateToken(request)

  if (!user) {
    return {
      success: false,
      error: 'Invalid token or token not provided',
    }
  }

  return {
    success: true,
    user,
  }
}

/**
 * 检查用户是否有权限操作指定的用户资源
 */
export function checkUserPermission(authUser: AuthUser, targetUserId: string): boolean {
  return authUser.id === targetUserId
}

/**
 * 创建 token 记录
 */
export async function createToken(data: { token: string; user_id: string; app_id?: string; app_handle?: string; open_id?: string }) {
  return await prisma.ftToken.create({
    data: {
      token: data.token,
      user_id: data.user_id,
      app_id: data.app_id,
      app_handle: data.app_handle,
      open_id: data.open_id,
      status: 'COMMON_STATUS_ACTIVE',
    },
  })
}

/**
 * 撤销 token
 */
export async function revokeToken(token: string) {
  return await prisma.ftToken.updateMany({
    where: { token },
    data: { status: 'COMMON_STATUS_INACTIVE' },
  })
}

/**
 * 获取用户的所有活跃 token
 */
export async function getUserTokens(userId: string) {
  return await prisma.ftToken.findMany({
    where: {
      user_id: userId,
      status: 'COMMON_STATUS_ACTIVE',
    },
  })
}
