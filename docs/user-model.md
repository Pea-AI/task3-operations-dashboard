# User 数据模型

## 概述

User 数据模型定义在 `lib/data-model.ts` 文件中，用于统一管理用户相关的数据结构。

## 模型定义

```typescript
export interface User {
  userId: string
  avatar?: string
  nickName: string
  description?: string
  email: string
  interestedTags?: string[]
  handler?: string
  social?: {
    wallet_address?: string
    twitter?: any
    discord?: any
    telegram?: any
  }
  lastLoginTime?: string
  createdAt?: string
  humanVerify?: boolean
  registerTime?: string
  language?: string
  auth?: {
    telegram?: {
      identity?: string
    }
  }
  isAdmin: boolean
}
```

## 使用方法

### 导入 User 模型

```typescript
import { User } from '@/lib/data-model'
// 或者
import { User } from '@/lib'
```

### 在组件中使用

```typescript
interface ComponentProps {
  user: User
}

function MyComponent({ user }: ComponentProps) {
  return (
    <div>
      <h1>欢迎，{user.nickName}</h1>
      <p>邮箱：{user.email}</p>
      {user.isAdmin && <p>管理员权限</p>}
    </div>
  )
}
```

## 字段说明

- `userId`: 用户唯一标识
- `nickName`: 用户昵称
- `email`: 用户邮箱
- `avatar`: 用户头像
- `isAdmin`: 是否为管理员
- `description`: 用户描述
- `interestedTags`: 感兴趣标签
- `handler`: 用户处理器
- `social`: 社交媒体信息
- `lastLoginTime`: 最后登录时间
- `createdAt`: 创建时间
- `humanVerify`: 人工验证状态
- `registerTime`: 注册时间
- `language`: 语言设置
- `auth`: 认证信息
