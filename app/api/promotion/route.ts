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

    // 默认排除已删除的记录
    if (status) {
      where.status = status === 'active' ? 'ACTIVE' : status === 'inactive' ? 'INACTIVE' : 'DELETED'
    } else {
      // 如果没有指定状态，默认排除已删除的记录
      where.status = { not: 'DELETED' }
    }

    if (platform) {
      const platformMap: Record<string, string> = {
        line: 'LINE',
        telegram: 'TELEGRAM',
        web: 'WEB',
      }
      where.platform = platformMap[platform]
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
    const formattedPromotions = promotions.map((promotion: any) => {
      const platformMap: Record<string, string> = {
        LINE: 'line',
        TELEGRAM: 'telegram',
        WEB: 'web',
      }
      return {
        ...promotion,
        status: promotion.status === 'ACTIVE' ? 'active' : promotion.status === 'INACTIVE' ? 'inactive' : 'deleted',
        platform: platformMap[promotion.platform] || promotion.platform,
      }
    })

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
    if (!['line', 'telegram', 'web'].includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          message: '平台必须是 line、telegram 或 web',
        },
        { status: 400 }
      )
    }

    // 验证状态值
    if (status && !['active', 'inactive', 'deleted'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: '状态必须是 active、inactive 或 deleted',
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
        platform: platform === 'line' ? 'LINE' : platform === 'telegram' ? 'TELEGRAM' : 'WEB',
        page,
        priority: priority || 1,
        eventIndex: eventIndex || 0,
        status: status === 'inactive' ? 'INACTIVE' : status === 'deleted' ? 'DELETED' : 'ACTIVE',
      },
    })

    // 格式化返回数据
    const platformMap: Record<string, string> = {
      LINE: 'line',
      TELEGRAM: 'telegram',
      WEB: 'web',
    }
    const formattedPromotion = {
      ...promotion,
      status: promotion.status === 'ACTIVE' ? 'active' : promotion.status === 'INACTIVE' ? 'inactive' : 'deleted',
      platform: platformMap[promotion.platform] || promotion.platform,
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

    // 处理数据库表不存在的错误
    if (error.code === 'P2021' || error.message.includes('table') || error.message.includes('collection')) {
      return NextResponse.json(
        {
          success: false,
          message: '数据库表不存在，请运行数据库初始化命令。',
          details: '请联系管理员执行 "npm run db:init" 初始化数据库。',
          error: process.env.NODE_ENV === 'development' ? error : undefined,
        },
        { status: 500 }
      )
    }

    // 处理Prisma客户端验证错误
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json(
        {
          success: false,
          message: '数据库操作验证失败，可能是数据库结构不匹配。',
          details: '请确保数据库已正确初始化，运行 "npm run db:init" 重新初始化。',
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

    // 检查是否已经被删除
    if (existingPromotion.status === 'DELETED') {
      return NextResponse.json(
        {
          success: false,
          message: '无法更新已删除的推广配置',
        },
        { status: 400 }
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
      if (!['line', 'telegram', 'web'].includes(platform)) {
        return NextResponse.json(
          {
            success: false,
            message: '平台必须是 line、telegram 或 web',
          },
          { status: 400 }
        )
      }
      updateData.platform = platform === 'line' ? 'LINE' : platform === 'telegram' ? 'TELEGRAM' : 'WEB'
    }

    if (status !== undefined) {
      if (!['active', 'inactive', 'deleted'].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: '状态必须是 active、inactive 或 deleted',
          },
          { status: 400 }
        )
      }
      updateData.status = status === 'inactive' ? 'INACTIVE' : status === 'deleted' ? 'DELETED' : 'ACTIVE'
    }

    // 更新推广配置
    const updatedPromotion = await typedPrisma.promotion.update({
      where: { id },
      data: updateData,
    })

    // 格式化返回数据
    const platformMap: Record<string, string> = {
      LINE: 'line',
      TELEGRAM: 'telegram',
      WEB: 'web',
    }
    const formattedPromotion = {
      ...updatedPromotion,
      status: updatedPromotion.status === 'ACTIVE' ? 'active' : updatedPromotion.status === 'INACTIVE' ? 'inactive' : 'deleted',
      platform: platformMap[updatedPromotion.platform] || updatedPromotion.platform,
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

    // 检查推广配置是否存在且未被删除
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

    // 检查是否已经被删除
    if (existingPromotion.status === 'DELETED') {
      return NextResponse.json(
        {
          success: false,
          message: '推广配置已被删除',
        },
        { status: 400 }
      )
    }

    // 逻辑删除推广配置（更新状态为DELETED）
    await typedPrisma.promotion.update({
      where: { id },
      data: { status: 'DELETED' },
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
