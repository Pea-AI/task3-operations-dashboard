# useUser Hook 使用文档

## 概述

`useUser` hook 是一个用于管理用户认证状态的 React hook，它封装了所有与用户信息相关的操作，包括获取用户信息、登录、登出、token 处理等功能。

## 功能特性

- **自动认证初始化**: 组件挂载时自动检查本地存储和 URL 参数中的认证信息
- **Token 管理**: 自动处理 URL 中的 token 参数，并在使用后清除
- **用户状态管理**: 提供用户信息、认证状态、加载状态等
- **登录/登出**: 提供登录和登出功能
- **用户信息刷新**: 支持手动刷新用户信息

## 使用方法

### 基本用法

```tsx
import { useUser } from '@/hooks/use-user'

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout, refreshUser } = useUser()

  if (isLoading) {
    return <div>正在加载...</div>
  }

  if (!isAuthenticated) {
    return <div>请先登录</div>
  }

  return (
    <div>
      <h1>欢迎, {user?.nickName}</h1>
      <button onClick={logout}>登出</button>
    </div>
  )
}
```

### Hook 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `user` | `User \| null` | 当前用户信息，未登录时为 null |
| `isAuthenticated` | `boolean` | 用户是否已认证 |
| `isLoading` | `boolean` | 是否正在加载用户信息 |
| `login` | `(userData: User) => void` | 登录函数 |
| `logout` | `() => void` | 登出函数 |
| `refreshUser` | `() => Promise<User \| null>` | 刷新用户信息函数 |

### 登录功能

```tsx
const { login } = useUser()

// 在登录成功后调用
const handleLoginSuccess = (userData) => {
  login(userData)
}
```

### 登出功能

```tsx
const { logout } = useUser()

// 用户点击登出按钮
const handleLogout = () => {
  logout()
}
```

### 刷新用户信息

```tsx
const { refreshUser } = useUser()

const handleRefresh = async () => {
  const user = await refreshUser()
  if (user) {
    console.log('用户信息已刷新')
  } else {
    console.log('刷新失败，可能需要重新登录')
  }
}
```

## 自动处理的功能

### URL Token 处理

当用户通过 URL 参数传递 token 时（如 `?token=xxx`），hook 会自动：

1. 提取并存储 token
2. 使用 token 获取用户信息
3. 清除 URL 中的 token 参数，避免 token 外泄
4. 更新用户状态

### 本地存储管理

Hook 会自动管理以下本地存储项：

- `localStorage.getItem('token')`: 用户认证 token
- `localStorage.getItem('user')`: 用户信息

### Token 验证

每次初始化时，hook 会：

1. 检查本地存储的 token 和用户信息
2. 验证 token 是否有效
3. 如果 token 无效，自动清除本地存储

## 与 AuthLayout 的集成

`AuthLayout` 组件已经更新为使用 `useUser` hook，简化了认证逻辑：

```tsx
export function AuthLayout({ children }: AuthLayoutProps) {
  const { user, isAuthenticated, isLoading, login, logout } = useUser()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  if (user && !user.isAdmin) {
    return <NoPermission onLogout={logout} />
  }

  return (
    <>
      {React.cloneElement(children as React.ReactElement<any>, {
        user,
        onLogout: logout,
      })}
    </>
  )
}
```

## 注意事项

1. **Token 安全**: Hook 会自动清除 URL 中的 token 参数，避免 token 外泄
2. **错误处理**: 当获取用户信息失败时，会自动清除本地存储并重置认证状态
3. **加载状态**: 在初始化过程中会显示加载状态，避免闪烁
4. **权限检查**: 可以在组件中检查 `user.isAdmin` 来判断用户权限

## 示例

完整的使用示例请参考 `examples/use-user-example.tsx` 文件。
