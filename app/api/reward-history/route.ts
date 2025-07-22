import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdentifier = searchParams.get('userIdentifier') || ''
    const assetType = searchParams.get('assetType') || 'all'
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    // 构建查询条件
    const where: any = {}

    if (userIdentifier) {
      where.OR = [{ userId: { contains: userIdentifier } }, { tgHandle: { contains: userIdentifier } }]
    }

    if (assetType !== 'all') {
      where.assetType = assetType
    }

    if (status !== 'all') {
      where.status = status
    }

    // 获取总数
    const total = await prisma.rewardDistributionHistory.count({ where })

    // 获取分页数据
    const records = await prisma.rewardDistributionHistory.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      success: true,
      data: {
        records,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error('获取奖励历史记录失败:', error)
    return NextResponse.json({ success: false, message: '获取奖励历史记录失败' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const record = await prisma.rewardDistributionHistory.create({
      data: {
        userId: data.userId,
        tgHandle: data.tgHandle,
        assetId: data.assetId,
        assetType: data.assetType,
        amount: data.amount,
        status: data.status,
        operator: data.operator,
        flowName: data.flowName,
        flowDescription: data.flowDescription,
        note: data.note,
        errorMessage: data.errorMessage,
        foundUserHandles: data.foundUserHandles ?? [],
        notFoundUserHandles: data.notFoundUserHandles ?? [],
        successHandles: data.successHandles ?? [],
      },
    })
    return NextResponse.json({ success: true, data: record })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
