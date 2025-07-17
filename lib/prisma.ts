import { PrismaClient } from '@prisma/client'
import { config } from './config'

// 全局变量声明，用于开发环境热重载时保持连接
declare global {
  var prisma: PrismaClient | undefined
}

// 创建 Prisma 客户端实例
const createPrismaClient = () => {
  return new PrismaClient({
    // datasources: {
    //   db: {
    //     url: config.database.url,
    //   },
    // },
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

// 在开发环境中复用客户端实例，避免热重载时创建多个连接
const prisma = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma
