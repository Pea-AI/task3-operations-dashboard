#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...')

  const prisma = new PrismaClient()

  try {
    // 测试基本连接
    await prisma.$connect()
    console.log('✅ 数据库连接成功')

    // 测试查询
    const count = await prisma.community.count()
    console.log(`📊 社区数据总数: ${count}`)

    // 获取前几条数据作为示例
    const communities = await prisma.community.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        handle: true,
        status: true,
        category: true,
        created_at: true,
      },
    })

    console.log('📋 示例数据:')
    communities.forEach((community, index) => {
      console.log(`${index + 1}. ${community.name} (@${community.handle}) - ${community.status}`)
      console.log(`   分类: ${community.category.join(', ')}`)
      console.log(`   创建时间: ${community.created_at.toISOString()}`)
    })
  } catch (error) {
    console.error('❌ 数据库连接失败:')
    console.error(error.message)

    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 可能的解决方案:')
      console.log('1. 检查数据库服务器是否正在运行')
      console.log('2. 确认网络连接正常')
      console.log('3. 检查防火墙设置')
    }

    if (error.message.includes('authentication')) {
      console.log('\n💡 可能的解决方案:')
      console.log('1. 检查用户名和密码是否正确')
      console.log('2. 确认用户有足够的权限')
      console.log('3. 检查 authSource 设置')
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
testDatabaseConnection().catch(console.error)
