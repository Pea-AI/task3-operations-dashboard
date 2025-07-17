# 数据库设置说明

## 概述

本项目使用 Prisma 连接 MongoDB 数据库，支持根据运行环境自动切换测试数据库和线上数据库。

## 配置文件

### 1. 数据库配置 (`lib/config.ts`)

```typescript
// 数据库配置
.env.local
.env.production

// 数据库连接字符串
DATABASE_URL=mongodb://root:VRa2siGQwU8vVzd3bxpN38@129.226.209.5:27017/footrace_ai_dev?authSource=admin&directConnection=true

// 数据库名称
DATABASE_NAME=footrace_ai_dev
```

### 2. 环境变量配置

创建 `.env.local` 文件（请根据实际情况调整）：

```env
# 数据库环境配置
NODE_ENV=development

# 测试数据库连接
DATABASE_URL_DEV=mongodb://root:VRa2siGQwU8vVzd3bxpN38@129.226.209.5:27017/footrace_ai_dev?authSource=admin&directConnection=true

# 线上数据库连接（请在部署时设置）
DATABASE_URL_PROD=

# 实际使用的数据库连接
DATABASE_URL=mongodb://root:VRa2siGQwU8vVzd3bxpN38@129.226.209.5:27017/footrace_ai_dev?authSource=admin&directConnection=true
```

## 数据库模型

### 社区模型 (`prisma/schema.prisma`)

```prisma
model Community {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  category     String[] // 分类标签
  certification Boolean  @default(false) // 认证状态
  status       String   @default("active") // 状态
  name         String   // 社区名称
  handle       String   // 社区标识
  logo         String?  // 社区Logo
  region       String   // 地区
  user_id      String   @db.ObjectId // 创建用户ID
  created_at   DateTime @default(now()) // 创建时间
  updated_at   DateTime @updatedAt // 更新时间
  version      Int      @default(0) @map("__v") // 版本号

  // 社交媒体字段
  app_handle   String? // 应用标识
  app_id       String? // 应用ID
  tgBot        String? // Telegram机器人
  tgChannel    String? // Telegram频道
  tgGroup      String? // Telegram群组
  tgHandle     String? // Telegram账号
  twitter      String? // Twitter账号
  description  String? // 描述

  @@map("ft_community")
}
```

## API 端点

### 获取社区列表

**URL**: `/api/community`
**方法**: `GET`
**参数**:
- `page`: 页码（默认：1）
- `limit`: 每页数量（默认：10）
- `status`: 状态过滤（可选：active, inactive）
- `category`: 分类过滤（可选：GameFi, NFT, SocialFi, Web3）
- `search`: 搜索关键词（可选）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "6697839e1c6d430011f3e027",
        "name": "Eason",
        "handle": "eason",
        "logo": "https://file.pea.ai/user_avatar_development/665448d46c9e4700110b1b44_849690_unnamed.png",
        "certification": false,
        "status": "active",
        "category": ["GameFi", "NFT", "SocialFi", "Web3"],
        "region": "Other",
        "created_at": "2024-07-17T08:41:02.277Z",
        "updated_at": "2025-03-28T07:24:57.060Z",
        "twitter": "eason_x",
        "tgHandle": "Eason_tg",
        "description": "i am super man"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasMore": false
    }
  }
}
```

## 使用方法

### 1. 安装依赖

```bash
pnpm add prisma @prisma/client
```

### 2. 生成 Prisma 客户端

```bash
npx prisma generate
```

### 3. 在组件中使用

```typescript
import { useCommunityListQuery } from '@/hooks/use-api'

// 在组件中使用
const { data, isLoading, error } = useCommunityListQuery({
  page: 1,
  limit: 10,
  status: 'active',
  category: 'GameFi',
  search: 'Eason'
})
```

### 4. 直接使用 API 函数

```typescript
import { getCommunityList } from '@/hooks/use-api'

// 直接调用 API 函数
const communities = await getCommunityList({
  page: 1,
  limit: 10,
  status: 'active'
})
```

## 环境切换

系统会根据 `NODE_ENV` 环境变量自动切换数据库：

- **开发环境** (`NODE_ENV=development`): 使用测试数据库 `footrace_ai_dev`
- **线上环境** (`NODE_ENV=production`): 使用线上数据库 `footrace_ai`

## 注意事项

1. 请确保在部署到线上环境时设置正确的 `DATABASE_URL_PROD` 环境变量
2. 测试数据库连接字符串包含敏感信息，请妥善保管
3. 在生产环境中，建议使用更安全的连接方式，如 MongoDB Atlas 或其他云服务
4. 定期备份数据库数据，特别是在生产环境中

## 故障排除

### 1. 连接失败
- 检查数据库服务器是否正常运行
- 确认网络连接和防火墙设置
- 验证用户名和密码是否正确

### 2. 权限问题
- 确认数据库用户具有足够的权限
- 检查 `authSource` 设置是否正确

### 3. 性能优化
- 为经常查询的字段添加索引
- 考虑使用连接池来管理数据库连接
- 实施缓存策略以减少数据库查询次数
