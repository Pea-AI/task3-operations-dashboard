# Prisma MongoDB 快速开始指南

## 🚀 快速开始

### 1. 设置环境变量

```bash
# 自动创建 .env.local 文件
pnpm setup:env
```

### 2. 生成 Prisma 客户端

```bash
# 生成 Prisma 客户端
pnpm db:generate
```

### 3. 测试数据库连接

```bash
# 测试数据库连接
pnpm test:db
```

### 4. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev
```

### 5. 测试新功能

访问 http://localhost:3000/test-community 查看新的社区管理功能

## 📚 主要功能

### 🎯 环境自动切换
- 开发环境：自动连接测试数据库 `footrace_ai_dev`
- 线上环境：自动连接线上数据库 `footrace_ai`

### 🔧 API 功能
- **GET /api/community** - 获取社区列表
- 支持分页、搜索、过滤功能
- 响应格式标准化

### 🎨 UI 组件
- **CommunityManagementNew** - 新版社区管理组件
- 实时搜索和过滤
- 响应式设计
- 详细信息查看

### 🔍 开发工具
- **Prisma Studio** - 数据库可视化管理工具
- **连接测试** - 验证数据库连接状态
- **环境配置** - 自动化环境设置

## 📝 可用脚本

| 脚本 | 说明 |
|------|------|
| `pnpm setup:env` | 创建环境变量文件 |
| `pnpm db:generate` | 生成 Prisma 客户端 |
| `pnpm db:studio` | 打开 Prisma Studio |
| `pnpm test:db` | 测试数据库连接 |
| `pnpm dev` | 启动开发服务器 |

## 📋 使用示例

### 在组件中使用

```typescript
import { useCommunityListQuery } from '@/hooks/use-api'

function CommunityList() {
  const { data, isLoading, error } = useCommunityListQuery({
    page: 1,
    limit: 10,
    status: 'active'
  })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>

  return (
    <div>
      {data?.data?.communities.map(community => (
        <div key={community.id}>{community.name}</div>
      ))}
    </div>
  )
}
```

### 直接 API 调用

```typescript
import { getCommunityList } from '@/hooks/use-api'

// 获取社区列表
const communities = await getCommunityList({
  page: 1,
  limit: 10,
  category: 'GameFi',
  search: 'Eason'
})
```

## 🔧 故障排除

### 常见问题

1. **连接失败**
   - 检查网络连接
   - 确认数据库服务器状态
   - 验证防火墙设置

2. **认证失败**
   - 检查用户名密码
   - 确认用户权限
   - 验证 authSource 设置

3. **Prisma 客户端错误**
   - 重新生成客户端：`pnpm db:generate`
   - 检查 schema.prisma 文件

### 获取帮助

- 查看详细文档：`docs/database-setup.md`
- 运行连接测试：`pnpm test:db`
- 使用 Prisma Studio：`pnpm db:studio`

## 🎉 完成！

现在您可以在项目中使用 Prisma 连接 MongoDB 数据库了！
