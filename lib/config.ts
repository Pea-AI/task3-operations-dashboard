// 环境配置
const getApiBaseUrl = () => {
  // 检查是否为生产环境
  if (typeof window !== 'undefined' && window.location.hostname === 'app.ton.ai') {
    return 'https://app.ton.ai'
  }

  // 检查 NODE_ENV 是否为 production
  if (process.env.NODE_ENV === 'production') {
    return 'https://app.ton.ai'
  }

  // 开发环境和测试环境
  return 'https://app-dev.ton.ai'
}

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  adminToken: '66ab7b3ec917220012ab3551', // 从 curl 中获取的 x-admin 值
}
