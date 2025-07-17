#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// 环境变量配置模板
const envTemplate = `# 数据库环境配置
NODE_ENV=development

# 测试数据库连接
DATABASE_URL_DEV=mongodb://root:VRa2siGQwU8vVzd3bxpN38@129.226.209.5:27017/footrace_ai_dev?authSource=admin&directConnection=true

# 线上数据库连接（请在部署时设置）
DATABASE_URL_PROD=

# 实际使用的数据库连接
DATABASE_URL=mongodb://root:VRa2siGQwU8vVzd3bxpN38@129.226.209.5:27017/footrace_ai_dev?authSource=admin&directConnection=true
`

const envPath = path.join(process.cwd(), '.env.local')

// 检查文件是否已存在
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local 文件已存在')
  console.log('如果需要重新创建，请先删除现有文件')
  process.exit(1)
}

// 创建 .env.local 文件
try {
  fs.writeFileSync(envPath, envTemplate)
  console.log('✅ .env.local 文件创建成功')
  console.log('📝 请根据实际需要修改数据库连接配置')
  console.log('🔒 请不要将包含敏感信息的 .env.local 文件提交到版本控制')
} catch (error) {
  console.error('❌ 创建 .env.local 文件失败:', error.message)
  process.exit(1)
}

console.log('\n📋 后续步骤:')
console.log('1. 运行 "pnpm db:generate" 生成 Prisma 客户端')
console.log('2. 运行 "pnpm dev" 启动开发服务器')
console.log('3. 访问 http://localhost:3000/test-community 测试新功能')
