import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticate, checkUserPermission } from '@/lib/auth'

// 获取用户信息 API
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

    const where: any = {}
    where.id = authResult.user!.id
    const user = await prisma.ftUser.findFirst({
      where,
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
    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取用户信息失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 创建用户 API (通常用于注册，不需要认证)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      app_id,
      app_handle,
      from_channel,
      register_method,
      first_name,
      last_name,
      avatar,
      nick_name,
      email,
      description,
      interested_tags,
      ip,
      country_code,
      browser_languages,
      language,
      is_bot,
      handler,
      is_certified_account,
      humanVerify,
      last_login_time,
      line_info,
    } = body

    // 检查必填字段
    if (!app_id || !from_channel || !register_method || !first_name || !handler) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必填字段',
        },
        { status: 400 }
      )
    }

    // 检查handler是否唯一
    const existingUser = await prisma.ftUser.findFirst({
      where: { handler },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: '用户handler已存在',
        },
        { status: 409 }
      )
    }

    // 创建用户
    const user = await prisma.ftUser.create({
      data: {
        app_id,
        app_handle,
        from_channel,
        register_method,
        first_name,
        last_name,
        avatar,
        nick_name,
        email,
        description,
        interested_tags: interested_tags || [],
        ip,
        country_code,
        browser_languages: browser_languages || [],
        language,
        is_bot,
        handler,
        is_certified_account: is_certified_account || false,
        humanVerify: humanVerify || false,
        last_login_time: last_login_time ? new Date(last_login_time) : null,
        line_info,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: '用户创建成功',
    })
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '创建用户失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 更新用户信息 API
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { id, ...updateData } = body

    // 如果没有指定ID，默认更新当前用户
    const targetUserId = id || authResult.user!.id

    // 检查权限：用户只能更新自己的信息
    if (!checkUserPermission(authResult.user!, targetUserId)) {
      return NextResponse.json(
        {
          success: false,
          message: '无权限更新该用户信息',
        },
        { status: 403 }
      )
    }

    // 处理时间字段
    if (updateData.last_login_time) {
      updateData.last_login_time = new Date(updateData.last_login_time)
    }

    const user = await prisma.ftUser.update({
      where: { id: targetUserId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: '用户更新成功',
    })
  } catch (error) {
    console.error('更新用户失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '更新用户失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 删除用户 API
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
    const id = searchParams.get('id')

    // 如果没有指定ID，默认删除当前用户
    const targetUserId = id || authResult.user!.id

    // 检查权限：用户只能删除自己的信息
    if (!checkUserPermission(authResult.user!, targetUserId)) {
      return NextResponse.json(
        {
          success: false,
          message: '无权限删除该用户',
        },
        { status: 403 }
      )
    }

    await prisma.ftUser.delete({
      where: { id: targetUserId },
    })

    return NextResponse.json({
      success: true,
      message: '用户删除成功',
    })
  } catch (error) {
    console.error('删除用户失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '删除用户失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
