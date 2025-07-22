# AuthLayout 组件使用说明

## 概述

AuthLayout 是一个认证和权限管理组件，负责处理用户的登录状态、权限验证和 token 管理。

## 功能特性

### 1. 用户认证管理
- 检查 localStorage 中的 token 和用户信息
- 自动验证 token 有效性
- 处理登录和登出逻辑

### 2. URL Token 处理
- 监听 URL 查询参数中的 token 字段
- 自动将 token 存储到 localStorage
- 移除 URL 中的 token 参数，避免 token 外泄
- 使用 token 获取用户信息

### 3. 权限控制
- 检查用户是否有管理员权限（isAdmin 字段）
- 无权限用户显示专门的提示页面
- 有权限用户正常访问系统

### 4. 状态管理
- 加载状态显示
- 错误处理和状态重置
- 自动清理无效的认证信息

## 使用方法

### 基本用法

```tsx
import { AuthLayout } from "@/components/auth-layout"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <AuthLayout>
      <Dashboard />
    </AuthLayout>
  )
}
```

### 子组件接收 Props

AuthLayout 会自动向子组件传递 `user` 和 `onLogout` props：

```tsx
function MyComponent({ user, onLogout }: { user?: any; onLogout?: () => void }) {
  if (!user || !onLogout) {
    return <div>认证信息缺失</div>
  }

  return (
    <div>
      <p>欢迎，{user.name}</p>
      <button onClick={onLogout}>登出</button>
    </div>
  )
}
```

## API 接口

### 用户信息接口

AuthLayout 会调用 `/api/v1/user/info` 接口获取用户信息：

```typescript
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin: boolean  // 关键字段：是否具有管理员权限
}
```

### Token 管理

- Token 存储在 localStorage 的 `token` 键中
- 用户信息存储在 localStorage 的 `user` 键中
- 自动在 API 请求中添加 token 到请求头

## 状态流程

1. **初始化**：检查 URL 中的 token 参数
2. **Token 处理**：如果有 token，存储并获取用户信息
3. **本地验证**：检查 localStorage 中的认证信息
4. **权限检查**：验证用户是否有管理员权限
5. **渲染内容**：根据状态渲染相应组件

## 组件状态

- **加载中**：显示加载动画
- **未登录**：显示登录页面
- **无权限**：显示无权限提示页面
- **已认证**：渲染子组件

## 安全特性

- 自动清理 URL 中的 token 参数
- 验证 token 有效性
- 无效 token 自动清除本地存储
- 错误处理和状态重置

## 测试

可以使用 `/test-auth` 页面测试 AuthLayout 的各项功能：

- 检查本地存储状态
- 测试 URL token 处理
- 验证权限检查
- 测试登出功能
