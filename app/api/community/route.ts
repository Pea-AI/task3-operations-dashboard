import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 获取社区列表 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // 构建查询条件
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = {
        has: category,
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 计算分页
    const skip = (page - 1) * limit

    // 获取社区列表和总数，包含创建者信息
    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              nick_name: true,
              avatar: true,
              email: true,
              handler: true,
              is_certified_account: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
      }),
      prisma.community.count({ where }),
    ])

    // 返回响应
    return NextResponse.json({
      success: true,
      data: {
        communities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + limit < total,
        },
      },
    })
  } catch (error) {
    console.error('获取社区列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取社区列表失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 更新社区认证状态 API
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { handle, certification } = body

    // 验证必要参数
    if (!handle) {
      return NextResponse.json(
        {
          success: false,
          message: '社区标识(handle)是必需的',
        },
        { status: 400 }
      )
    }

    if (typeof certification !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          message: '认证状态必须是布尔值',
        },
        { status: 400 }
      )
    }

    // 检查社区是否存在
    const existingCommunity = await prisma.community.findUnique({
      where: { handle },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            nick_name: true,
            avatar: true,
            email: true,
            handler: true,
          },
        },
      },
    })

    if (!existingCommunity) {
      return NextResponse.json(
        {
          success: false,
          message: '社区不存在',
        },
        { status: 404 }
      )
    }

    // 更新认证状态
    const updatedCommunity = await prisma.community.update({
      where: { handle },
      data: {
        certification,
        updated_at: new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            nick_name: true,
            avatar: true,
            email: true,
            handler: true,
          },
        },
      },
    })

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: certification ? '社区认证成功' : '社区认证已取消',
      data: {
        community: updatedCommunity,
      },
    })
  } catch (error) {
    console.error('更新社区认证状态失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '更新社区认证状态失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
