import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticate, createToken, revokeToken, getUserTokens } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// 创建 token API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, app_id, app_handle, open_id } = body

    if (!user_id) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少用户ID',
        },
        { status: 400 }
      )
    }

    // 验证用户是否存在
    const user = await prisma.ftUser.findFirst({
      where: { id: user_id },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: '用户不存在',
        },
        { status: 404 }
      )
    }

    // 生成新的 token
    const token = uuidv4()

    // 创建 token 记录
    const tokenRecord = await createToken({
      token,
      user_id,
      app_id,
      app_handle,
      open_id,
    })

    return NextResponse.json({
      success: true,
      data: {
        token: tokenRecord.token,
        user_id: tokenRecord.user_id,
        app_id: tokenRecord.app_id,
        app_handle: tokenRecord.app_handle,
        open_id: tokenRecord.open_id,
        status: tokenRecord.status,
        created_at: tokenRecord.created_at,
      },
      message: 'Token创建成功',
    })
  } catch (error) {
    console.error('创建Token失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '创建Token失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 获取用户的 token 列表
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authenticate(request)
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: '认证失败: ' + (authResult.error || 'Token无效'),
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    // 只能查看自己的 token
    const targetUserId = user_id || authResult.user!.id

    if (targetUserId !== authResult.user!.id) {
      return NextResponse.json(
        {
          success: false,
          message: '无权限查看其他用户的Token',
        },
        { status: 403 }
      )
    }

    const tokens = await getUserTokens(targetUserId)

    return NextResponse.json({
      success: true,
      data: tokens,
    })
  } catch (error) {
    console.error('获取Token列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取Token列表失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 撤销 token
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authenticate(request)
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: '认证失败: ' + (authResult.error || 'Token无效'),
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少Token参数',
        },
        { status: 400 }
      )
    }

    // 验证 token 是否属于当前用户
    const tokenRecord = await prisma.ftToken.findFirst({
      where: {
        token,
        status: 'COMMON_STATUS_ACTIVE',
      },
    })

    if (!tokenRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token不存在或已被撤销',
        },
        { status: 404 }
      )
    }

    if (tokenRecord.user_id !== authResult.user!.id) {
      return NextResponse.json(
        {
          success: false,
          message: '无权限撤销该Token',
        },
        { status: 403 }
      )
    }

    // 撤销 token
    await revokeToken(token)

    return NextResponse.json({
      success: true,
      message: 'Token撤销成功',
    })
  } catch (error) {
    console.error('撤销Token失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '撤销Token失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 验证 token 是否有效
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少Token参数',
        },
        { status: 400 }
      )
    }

    // 验证 token
    const tokenRecord = await prisma.ftToken.findFirst({
      where: {
        token,
        status: 'COMMON_STATUS_ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            nick_name: true,
            email: true,
            handler: true,
            is_certified_account: true,
            created_at: true,
          },
        },
      },
    })

    if (!tokenRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token无效或已过期',
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        token: tokenRecord.token,
        user: tokenRecord.user,
        app_id: tokenRecord.app_id,
        app_handle: tokenRecord.app_handle,
        open_id: tokenRecord.open_id,
        created_at: tokenRecord.created_at,
      },
      message: 'Token验证成功',
    })
  } catch (error) {
    console.error('验证Token失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '验证Token失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
