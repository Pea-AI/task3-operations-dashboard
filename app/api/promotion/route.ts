import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 临时类型声明以绕过TypeScript检查
const typedPrisma = prisma as any

// 获取推广配置列表 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const page_filter = searchParams.get('page_filter')
    const search = searchParams.get('search')

    // 构建查询条件
    const where: any = {}

    if (status) {
      where.status = status === 'active' ? 'PROMOTION_STATUS_ACTIVE' : 'PROMOTION_STATUS_INACTIVE'
    }

    if (platform) {
      where.platform = platform === 'line' ? 'PROMOTION_PLATFORM_LINE' : 'PROMOTION_PLATFORM_TELEGRAM'
    }

    if (page_filter) {
      where.page = page_filter
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tag: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 计算分页
    const skip = (page - 1) * limit

    // 获取推广配置列表和总数
    const [promotions, total] = await Promise.all([
      typedPrisma.promotion.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'asc' }, { eventIndex: 'asc' }, { created_at: 'desc' }],
      }),
      typedPrisma.promotion.count({ where }),
    ])

    // 格式化返回数据
    const formattedPromotions = promotions.map((promotion) => ({
      ...promotion,
      status: promotion.status === 'PROMOTION_STATUS_ACTIVE' ? 'active' : 'inactive',
      platform: promotion.platform === 'PROMOTION_PLATFORM_LINE' ? 'line' : 'telegram',
    }))

    return NextResponse.json({
      success: true,
      data: {
        promotions: formattedPromotions,
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
    console.error('获取推广配置列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '获取推广配置列表失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 创建推广配置 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, img, url, tag, platform, page, priority, eventIndex, status } = body

    // 验证必要参数
    if (!title || !img || !url || !tag || !platform || !page) {
      return NextResponse.json(
        {
          success: false,
          message: '标题、图片、链接、标签、平台和页面是必需的',
        },
        { status: 400 }
      )
    }

    // 验证平台值
    if (!['line', 'telegram'].includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          message: '平台必须是 line 或 telegram',
        },
        { status: 400 }
      )
    }

    // 验证状态值
    if (status && !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: '状态必须是 active 或 inactive',
        },
        { status: 400 }
      )
    }

    // 创建推广配置
    const promotion = await typedPrisma.promotion.create({
      data: {
        title,
        img,
        url,
        tag,
        platform: platform === 'line' ? 'PROMOTION_PLATFORM_LINE' : 'PROMOTION_PLATFORM_TELEGRAM',
        page,
        priority: priority || 1,
        eventIndex: eventIndex || 0,
        status: status === 'inactive' ? 'PROMOTION_STATUS_INACTIVE' : 'PROMOTION_STATUS_ACTIVE',
      },
    })

    // 格式化返回数据
    const formattedPromotion = {
      ...promotion,
      status: promotion.status === 'PROMOTION_STATUS_ACTIVE' ? 'active' : 'inactive',
      platform: promotion.platform === 'PROMOTION_PLATFORM_LINE' ? 'line' : 'telegram',
    }

    return NextResponse.json({
      success: true,
      message: '推广配置创建成功',
      data: {
        promotion: formattedPromotion,
      },
    })
  } catch (error: any) {
    console.error('创建推广配置失败:', error)

    // 处理MongoDB事务不支持的错误
    if (error.code === 'P2010') {
      return NextResponse.json(
        {
          success: false,
          message: '您的数据库配置不支持事务操作。请确保MongoDB配置为副本集(Replica Set)或使用MongoDB Atlas。',
          details: '单实例MongoDB不支持事务，请升级您的数据库部署。',
          error: process.env.NODE_ENV === 'development' ? error : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: '创建推广配置失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 更新推广配置 API
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, img, url, tag, platform, page, priority, eventIndex, status } = body

    // 验证必要参数
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: '推广配置ID是必需的',
        },
        { status: 400 }
      )
    }

    // 检查推广配置是否存在
    const existingPromotion = await typedPrisma.promotion.findUnique({
      where: { id },
    })

    if (!existingPromotion) {
      return NextResponse.json(
        {
          success: false,
          message: '推广配置不存在',
        },
        { status: 404 }
      )
    }

    // 构建更新数据
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (img !== undefined) updateData.img = img
    if (url !== undefined) updateData.url = url
    if (tag !== undefined) updateData.tag = tag
    if (page !== undefined) updateData.page = page
    if (priority !== undefined) updateData.priority = priority
    if (eventIndex !== undefined) updateData.eventIndex = eventIndex

    if (platform !== undefined) {
      if (!['line', 'telegram'].includes(platform)) {
        return NextResponse.json(
          {
            success: false,
            message: '平台必须是 line 或 telegram',
          },
          { status: 400 }
        )
      }
      updateData.platform = platform === 'line' ? 'PROMOTION_PLATFORM_LINE' : 'PROMOTION_PLATFORM_TELEGRAM'
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: '状态必须是 active 或 inactive',
          },
          { status: 400 }
        )
      }
      updateData.status = status === 'inactive' ? 'PROMOTION_STATUS_INACTIVE' : 'PROMOTION_STATUS_ACTIVE'
    }

    // 更新推广配置
    const updatedPromotion = await typedPrisma.promotion.update({
      where: { id },
      data: updateData,
    })

    // 格式化返回数据
    const formattedPromotion = {
      ...updatedPromotion,
      status: updatedPromotion.status === 'PROMOTION_STATUS_ACTIVE' ? 'active' : 'inactive',
      platform: updatedPromotion.platform === 'PROMOTION_PLATFORM_LINE' ? 'line' : 'telegram',
    }

    return NextResponse.json({
      success: true,
      message: '推广配置更新成功',
      data: {
        promotion: formattedPromotion,
      },
    })
  } catch (error) {
    console.error('更新推广配置失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '更新推广配置失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}

// 删除推广配置 API
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: '推广配置ID是必需的',
        },
        { status: 400 }
      )
    }

    // 检查推广配置是否存在
    const existingPromotion = await typedPrisma.promotion.findUnique({
      where: { id },
    })

    if (!existingPromotion) {
      return NextResponse.json(
        {
          success: false,
          message: '推广配置不存在',
        },
        { status: 404 }
      )
    }

    // 删除推广配置
    await typedPrisma.promotion.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: '推广配置删除成功',
    })
  } catch (error) {
    console.error('删除推广配置失败:', error)
    return NextResponse.json(
      {
        success: false,
        message: '删除推广配置失败',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    )
  }
}
