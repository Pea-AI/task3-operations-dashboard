/**
 * 用户信息 API 使用示例 (带Token认证)
 *
 * 本文件展示了如何使用带认证的用户信息相关的 API 接口
 * API 路径: /api/user (需要认证)
 * Token API 路径: /api/token
 * 数据库表: ft_user, ft_token
 */

// 认证工具函数
const getAuthHeaders = (token: string) => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// === Token 管理 API ===

// 1. 创建 Token (注册后或登录后调用)
export const createToken = async (userData: { user_id: string; app_id?: string; app_handle?: string; open_id?: string }) => {
  const response = await fetch('/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  return await response.json()
}

// 2. 验证 Token
export const validateToken = async (token: string) => {
  const response = await fetch('/api/token', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })
  return await response.json()
}

// 3. 获取用户的 Token 列表 (需要认证)
export const getUserTokens = async (token: string) => {
  const response = await fetch('/api/token', {
    headers: getAuthHeaders(token),
  })
  return await response.json()
}

// 4. 撤销 Token (需要认证)
export const revokeToken = async (token: string, tokenToRevoke: string) => {
  const response = await fetch(`/api/token?token=${tokenToRevoke}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  })
  return await response.json()
}

// === 用户信息 API (需要认证) ===

// 1. 获取当前用户信息 (需要认证)
export const getCurrentUser = async (token: string) => {
  const response = await fetch('/api/user', {
    headers: getAuthHeaders(token),
  })
  return await response.json()
}

// 2. 通过ID获取用户 (只能获取自己的信息)
export const getUserById = async (token: string, id: string) => {
  const response = await fetch(`/api/user?id=${id}`, {
    headers: getAuthHeaders(token),
  })
  return await response.json()
}

// 3. 通过handler获取用户 (只能获取自己的信息)
export const getUserByHandler = async (token: string, handler: string) => {
  const response = await fetch(`/api/user?handler=${handler}`, {
    headers: getAuthHeaders(token),
  })
  return await response.json()
}

// 4. 通过email获取用户 (只能获取自己的信息)
export const getUserByEmail = async (token: string, email: string) => {
  const response = await fetch(`/api/user?email=${email}`, {
    headers: getAuthHeaders(token),
  })
  return await response.json()
}

// 5. 创建新用户 (不需要认证，用于注册)
export const createUser = async (userData: {
  app_id: string
  app_handle?: string
  from_channel: string
  register_method: string
  first_name: string
  last_name?: string
  avatar?: string
  nick_name?: string
  email?: string
  description?: string
  interested_tags?: string[]
  ip?: string
  country_code?: string
  browser_languages?: string[]
  language?: string
  is_bot?: boolean
  handler: string
  is_certified_account?: boolean
  humanVerify?: boolean
  last_login_time?: string
  line_info?: {
    version: string
    isInClient: boolean
    os: string
  }
}) => {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  return await response.json()
}

// 6. 更新用户信息 (需要认证，只能更新自己的信息)
export const updateUser = async (
  token: string,
  updateData: Partial<{
    app_id: string
    app_handle: string
    from_channel: string
    register_method: string
    first_name: string
    last_name: string
    avatar: string
    nick_name: string
    email: string
    description: string
    interested_tags: string[]
    ip: string
    country_code: string
    browser_languages: string[]
    language: string
    is_bot: boolean
    handler: string
    is_certified_account: boolean
    humanVerify: boolean
    last_login_time: string
    line_info: {
      version: string
      isInClient: boolean
      os: string
    }
  }>
) => {
  const response = await fetch('/api/user', {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(updateData),
  })
  return await response.json()
}

// 7. 删除用户 (需要认证，只能删除自己的账户)
export const deleteUser = async (token: string) => {
  const response = await fetch('/api/user', {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  })
  return await response.json()
}

// === 使用示例 ===
export const exampleUsage = async () => {
  try {
    // 1. 创建用户 (注册流程)
    const newUser = await createUser({
      app_id: 'my_app_001',
      app_handle: 'my_app',
      from_channel: 'web',
      register_method: 'email',
      first_name: 'Zhang',
      last_name: 'San',
      avatar: 'https://example.com/avatar.jpg',
      nick_name: 'zhangsan',
      email: 'zhangsan@example.com',
      description: 'A test user',
      interested_tags: ['tech', 'programming', 'ai'],
      ip: '192.168.1.100',
      country_code: 'CN',
      browser_languages: ['zh-CN', 'en'],
      language: 'zh-CN',
      is_bot: false,
      handler: 'zhangsan_' + Date.now(),
      is_certified_account: false,
      humanVerify: true,
      line_info: {
        version: '2.0.0',
        isInClient: true,
        os: 'Windows',
      },
    })

    console.log('创建用户成功:', newUser)

    if (newUser.success) {
      // 2. 为用户创建 Token
      const tokenResponse = await createToken({
        user_id: newUser.data.id,
        app_id: 'my_app_001',
        app_handle: 'my_app',
      })

      console.log('Token创建成功:', tokenResponse)

      if (tokenResponse.success) {
        const token = tokenResponse.data.token

        // 3. 验证 Token
        const validationResult = await validateToken(token)
        console.log('Token验证结果:', validationResult)

        // 4. 获取当前用户信息
        const currentUser = await getCurrentUser(token)
        console.log('当前用户信息:', currentUser)

        // 5. 更新用户信息
        const updatedUser = await updateUser(token, {
          description: 'Updated description',
          interested_tags: ['tech', 'programming', 'ai', 'blockchain'],
        })
        console.log('更新用户成功:', updatedUser)

        // 6. 获取用户的 Token 列表
        const userTokens = await getUserTokens(token)
        console.log('用户Token列表:', userTokens)
      }
    }
  } catch (error) {
    console.error('API 调用失败:', error)
  }
}

// === 类型定义 ===

// API 响应格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: any
}

// Token 信息
export interface TokenInfo {
  id: string
  token: string
  app_id?: string
  app_handle?: string
  open_id?: string
  user_id: string
  status: 'COMMON_STATUS_ACTIVE' | 'COMMON_STATUS_INACTIVE' | 'COMMON_STATUS_DELETED'
  created_at: string
  updated_at: string
}

// 用户信息列表响应格式
export interface UsersListResponse {
  users: FtUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// 用户数据类型
export interface FtUser {
  id: string
  app_id: string
  app_handle?: string
  from_channel: string
  register_method: string
  first_name?: string
  last_name?: string
  avatar?: string
  nick_name?: string
  email?: string
  description?: string
  interested_tags: string[]
  ip?: string
  country_code?: string
  browser_languages: string[]
  language?: string
  is_bot?: boolean
  handler: string
  is_certified_account: boolean
  humanVerify?: boolean
  last_login_time?: string
  line_info?: {
    version: string
    isInClient: boolean
    os: string
  }
  created_at: string
  updated_at: string
}

/**
 * === API 端点说明 ===
 *
 * === Token API (/api/token) ===
 *
 * POST /api/token - 创建新Token
 * 请求体: { user_id: string, app_id?: string, app_handle?: string, open_id?: string }
 *
 * GET /api/token - 获取当前用户的Token列表 (需要认证)
 * 请求头: Authorization: Bearer {token}
 *
 * PUT /api/token - 验证Token有效性
 * 请求体: { token: string }
 *
 * DELETE /api/token?token={token} - 撤销Token (需要认证)
 * 请求头: Authorization: Bearer {token}
 * 查询参数: token - 要撤销的Token
 *
 * === 用户 API (/api/user) - 所有操作都需要认证（除了POST创建用户）===
 *
 * GET /api/user - 获取当前用户信息 (需要认证)
 * 请求头: Authorization: Bearer {token}
 * 查询参数 (可选):
 * - id: 用户ID (只能查看自己的信息)
 * - handler: 用户handler (只能查看自己的信息)
 * - email: 用户邮箱 (只能查看自己的信息)
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 10)
 * - search: 搜索关键词
 *
 * POST /api/user - 创建新用户 (不需要认证，用于注册)
 * 请求体: 用户数据对象
 *
 * PUT /api/user - 更新用户信息 (需要认证，只能更新自己的信息)
 * 请求头: Authorization: Bearer {token}
 * 请求体: { id?: string, ...更新的字段 }
 *
 * DELETE /api/user?id={userId} - 删除用户 (需要认证，只能删除自己的账户)
 * 请求头: Authorization: Bearer {token}
 * 查询参数: id - 要删除的用户ID (可选，默认为当前用户)
 *
 * === 安全机制 ===
 *
 * 1. 所有用户相关操作都需要在请求头中提供有效的Token
 * 2. 用户只能操作自己的数据，无法访问其他用户的信息
 * 3. Token存储在ft_token表中，与用户ID关联
 * 4. Token有状态管理，可以被撤销
 * 5. 创建用户(注册)不需要认证，但后续操作都需要Token
 *
 * === 认证流程 ===
 *
 * 1. 用户注册: POST /api/user (不需要认证)
 * 2. 创建Token: POST /api/token (使用用户ID)
 * 3. 后续所有操作都需要在请求头中包含 Authorization: Bearer {token}
 * 4. 服务器验证Token有效性并检查用户权限
 * 5. 只允许用户操作自己的数据
 */
