import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // 插入用户测试数据
  console.log('开始插入 FtUser 测试数据...')
  const users = await prisma.ftUser.createMany({
    data: [
      {
        app_id: '000000000000000000000001',
        from_channel: 'web',
        register_method: 'email',
        handler: 'user1',
      },
      {
        app_id: '000000000000000000000002',
        from_channel: 'telegram',
        register_method: 'telegram',
        handler: 'user2',
        nick_name: 'Nick2',
        email: 'user2@example.com',
      },
      {
        app_id: '000000000000000000000003',
        from_channel: 'line',
        register_method: 'line',
        handler: 'user3',
        first_name: 'Alice',
        last_name: 'Smith',
      },
    ],
  })
  const allUsers = await prisma.ftUser.findMany()
  console.log(
    'FtUser 测试数据插入完成:',
    allUsers.map((u) => u.id)
  )

  // 插入社区测试数据
  console.log('开始插入 Community 测试数据...')
  const communities = await prisma.community.createMany({
    data: [
      {
        user_id: allUsers[0].id,
        name: 'Test Community 1',
        handle: 'community1',
        category: ['tech', 'web3'],
        region: 'US',
      },
      {
        user_id: allUsers[1].id,
        name: 'Test Community 2',
        handle: 'community2',
        category: ['art'],
        region: 'JP',
        certification: true,
      },
      {
        user_id: allUsers[2].id,
        name: 'Test Community 3',
        handle: 'community3',
        category: ['gaming'],
        region: 'CN',
      },
    ],
  })
  const allCommunities = await prisma.community.findMany()
  console.log(
    'Community 测试数据插入完成:',
    allCommunities.map((c) => c.id)
  )

  // 插入 Token 测试数据
  console.log('开始插入 FtToken 测试数据...')
  const tokens = await prisma.ftToken.createMany({
    data: [
      {
        token: 'token1',
        user_id: allUsers[0].id,
        status: 'COMMON_STATUS_ACTIVE',
      },
      {
        token: 'token2',
        user_id: allUsers[1].id,
        status: 'COMMON_STATUS_INACTIVE',
      },
      {
        token: 'token3',
        user_id: allUsers[2].id,
        status: 'COMMON_STATUS_ACTIVE',
      },
    ],
  })
  const allTokens = await prisma.ftToken.findMany()
  console.log(
    'FtToken 测试数据插入完成:',
    allTokens.map((t) => t.id)
  )

  // 插入 Promotion 测试数据
  console.log('开始插入 Promotion 测试数据...')
  await prisma.promotion.createMany({
    data: [
      {
        title: 'Promotion 1',
        img: 'https://example.com/img1.png',
        url: 'https://example.com/1',
        tag: 'web3',
        platform: 'WEB',
        page: 'home',
        priority: 1,
        eventIndex: 0,
        status: 'ACTIVE',
      },
      {
        title: 'Promotion 2',
        img: 'https://example.com/img2.png',
        url: 'https://example.com/2',
        tag: 'line',
        platform: 'LINE',
        page: 'dashboard',
        priority: 2,
        eventIndex: 1,
        status: 'INACTIVE',
      },
      {
        title: 'Promotion 3',
        img: 'https://example.com/img3.png',
        url: 'https://example.com/3',
        tag: 'telegram',
        platform: 'TELEGRAM',
        page: 'promo',
        priority: 3,
        eventIndex: 2,
        status: 'ACTIVE',
      },
    ],
  })
  const allPromotions = await prisma.promotion.findMany()
  console.log(
    'Promotion 测试数据插入完成:',
    allPromotions.map((p) => p.id)
  )

  // 插入奖励发放记录测试数据
  console.log('开始插入 RewardDistributionHistory 测试数据...')
  await prisma.rewardDistributionHistory.createMany({
    data: [
      {
        userId: allUsers[0]?.id,
        tgHandle: '@user1',
        assetId: 'asset_usdt',
        assetType: 'USDT',
        amount: 10,
        status: 'success',
        operator: 'ops@company.com',
        flowName: 'Community Event',
        flowDescription: '社区活动奖励',
        note: '社区活动奖励',
      },
      {
        userId: allUsers[1]?.id,
        tgHandle: '@user2',
        assetId: 'asset_points',
        assetType: 'Points',
        amount: 100,
        status: 'success',
        operator: 'ops@company.com',
        flowName: 'Referral',
        flowDescription: '推荐奖励',
        note: '推荐奖励',
      },
      {
        userId: allUsers[2]?.id,
        tgHandle: '@user3',
        assetId: 'asset_ton',
        assetType: 'TON',
        amount: 5,
        status: 'failed',
        operator: 'ops@company.com',
        flowName: 'Airdrop',
        flowDescription: '空投奖励',
        note: '用户钱包地址无效',
        errorMessage: '用户钱包地址无效',
      },
    ],
  })
  const allRewardHistory = await prisma.rewardDistributionHistory.findMany()
  console.log(
    'RewardDistributionHistory 测试数据插入完成:',
    allRewardHistory.map((r) => r.id)
  )

  console.log('所有测试数据插入完毕！')
}

main()
  .catch((e) => {
    console.error('插入测试数据出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
