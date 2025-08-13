# Task3 运营管理后台

一个现代化的运营管理后台系统，专为社区管理、奖励发放、推广配置等运营场景设计。基于 Next.js 15、TypeScript、Prisma 和 MongoDB 构建。

## 📋 目录

- [项目架构](#项目架构)
- [技术栈](#技术栈)
- [业务模块](#业务模块)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [数据库配置](#数据库配置)
- [API 文档](#api-文档)
- [部署指南](#部署指南)
- [开发指南](#开发指南)

## 🏗️ 项目架构

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 UI 层    │    │   API 服务层    │    │   数据存储层    │
│                 │    │                 │    │                 │
│ - React 组件    │◄──►│ - Next.js API   │◄──►│ - MongoDB      │
│ - Tailwind CSS  │    │ - Prisma ORM    │    │ - Replica Set   │
│ - TypeScript    │    │ - 认证中间件    │    │ - 数据模型      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 核心设计思想

1. **模块化设计**: 每个业务功能独立封装，便于维护和扩展
2. **类型安全**: 全面使用 TypeScript，提供完整的类型定义
3. **响应式设计**: 移动端优先，适配各种屏幕尺寸
4. **数据驱动**: 基于 MongoDB 和 Prisma ORM，提供强类型数据操作
5. **可扩展性**: 支持多租户架构，便于水平扩展

## 🛠️ 技术栈

### 前端技术
- **React 19**: 最新的 React 版本，支持并发特性
- **Next.js 15**: 全栈 React 框架，提供 SSR/SSG 支持
- **TypeScript**: 静态类型检查，提升代码质量
- **Tailwind CSS**: 原子化 CSS 框架，快速构建现代 UI
- **Radix UI**: 无障碍的组件库，提供高质量的 UI 组件
- **React Hook Form**: 高性能的表单处理库
- **React Query**: 数据获取和状态管理
- **Zod**: TypeScript 优先的模式验证库

### 后端技术
- **Next.js API Routes**: 基于文件系统的 API 路由
- **Prisma**: 现代化的 ORM，提供类型安全的数据库操作
- **MongoDB**: NoSQL 文档数据库，支持复杂数据结构
- **JWT**: JSON Web Token，用于用户认证
- **Axios**: HTTP 客户端，处理 API 请求

### 开发工具
- **pnpm**: 快速、节省磁盘空间的包管理器
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Docker**: 容器化部署支持

## 💼 业务模块

### 1. 社区管理
- 社区信息展示和编辑
- 社区认证状态管理
- 分类和标签管理
- 社交媒体账号绑定
- 创建者信息管理

### 2. 奖励发放
- 批量奖励发放
- 多种资产类型支持
- Telegram 用户匹配
- 发放状态跟踪
- Excel 导入导出

### 3. 发放历史
- 历史记录查询
- 状态筛选和搜索
- 详细错误信息
- 数据导出功能

### 4. 推广配置
- 多平台推广管理
- 图片和链接配置
- 优先级和展示控制
- 实时状态更新

### 5. 用户认证
- Token 基础认证
- 权限控制
- 用户信息管理
- 安全中间件

## 📋 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **MongoDB**: >= 6.0
- **操作系统**: macOS, Linux, Windows

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd task3-operations-dashboard
```

### 2. 安装依赖
```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 yarn
yarn install

# 或使用 npm
npm install
```

### 3. 配置环境变量
创建 `.env.local` 文件：
```env
# MongoDB 数据库连接
DATABASE_URL="mongodb://localhost:27017/task3_operations_dashboard_dev"

# 应用配置
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_TASK3_API=your-task3-api-url

# JWT 密钥（可选）
JWT_SECRET=your-jwt-secret-key
```

### 4. 启动 MongoDB
使用 Docker Compose（推荐）：
```bash
docker-compose up -d
```

或者使用本地 MongoDB：
```bash
# macOS (使用 Homebrew)
brew services start mongodb/brew/mongodb-community

# Linux (使用 systemd)
sudo systemctl start mongod
```

### 5. 初始化数据库
```bash
# 生成 Prisma 客户端
pnpm prisma generate

# 推送数据库模式（首次运行）
pnpm prisma db push

# 可选：运行种子数据
pnpm tsx scripts/seed.ts
```

### 6. 启动开发服务器
```bash
pnpm dev
```

应用将在 http://localhost:3000 启动

### 7. 构建生产版本
```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

## 📁 项目结构

```
task3-operations-dashboard/
├── app/                          # Next.js 13+ App Router
│   ├── api/                      # API 路由
│   │   ├── community/            # 社区管理 API
│   │   ├── promotion/            # 推广配置 API
│   │   ├── reward-history/       # 奖励历史 API
│   │   ├── token/               # Token 管理 API
│   │   └── user/                # 用户管理 API
│   ├── globals.css              # 全局样式
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页
│   └── test-*/                  # 测试页面
├── components/                  # React 组件
│   ├── ui/                      # 基础 UI 组件（Radix UI）
│   ├── auth-layout.tsx          # 认证布局
│   ├── dashboard.tsx            # 主仪表板
│   ├── community-management.tsx # 社区管理
│   ├── reward-distribution.tsx  # 奖励发放
│   ├── distribution-history.tsx # 发放历史
│   └── promotion-management.tsx # 推广管理
├── hooks/                       # 自定义 React Hooks
│   ├── use-api.ts              # API 调用 Hook
│   ├── use-user.ts             # 用户状态 Hook
│   └── use-toast.ts            # Toast 通知 Hook
├── lib/                        # 工具库和配置
│   ├── generated/              # Prisma 生成的文件
│   ├── api-client.ts           # API 客户端
│   ├── auth.ts                 # 认证工具
│   ├── config.ts               # 配置文件
│   ├── data-model.ts           # 数据模型类型
│   ├── prisma.ts               # Prisma 客户端
│   └── utils.ts                # 通用工具函数
├── prisma/                     # Prisma 配置
│   └── schema.prisma           # 数据库模式定义
├── scripts/                    # 脚本文件
│   └── seed.ts                 # 数据库种子数据
├── docs/                       # 项目文档
├── examples/                   # 示例代码
├── public/                     # 静态资源
├── docker-compose.yml          # Docker 配置
├── next.config.mjs             # Next.js 配置
├── tailwind.config.ts          # Tailwind CSS 配置
├── tsconfig.json               # TypeScript 配置
└── package.json                # 项目依赖
```

## 🗄️ 数据库配置

### MongoDB 连接
项目支持多种 MongoDB 连接方式：

1. **本地 MongoDB**:
   ```env
   DATABASE_URL="mongodb://localhost:27017/task3_operations_dashboard_dev"
   ```

2. **MongoDB Atlas（云服务）**:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/task3_operations_dashboard?retryWrites=true&w=majority"
   ```

3. **Docker MongoDB（推荐开发环境）**:
   ```bash
   docker-compose up -d
   ```

### 数据模型
- **FtUser**: 用户信息，包含认证、社交账号等
- **Community**: 社区信息，支持分类、认证等
- **FtToken**: 用户令牌，用于身份验证
- **Promotion**: 推广配置，支持多平台
- **RewardDistributionHistory**: 奖励发放历史记录

## 📚 API 文档

### 认证方式
所有需要认证的 API 都需要在请求头中包含：
```
Authorization: Bearer <token>
```

### 主要 API 端点

#### 用户管理
- `GET /api/user` - 获取当前用户信息
- `POST /api/user` - 创建新用户
- `PUT /api/user` - 更新用户信息
- `DELETE /api/user` - 删除用户

#### 社区管理
- `GET /api/community` - 获取社区列表
- `PATCH /api/community` - 更新社区认证状态

#### 推广管理
- `GET /api/promotion` - 获取推广配置列表
- `POST /api/promotion` - 创建推广配置
- `PUT /api/promotion` - 更新推广配置
- `DELETE /api/promotion` - 删除推广配置

#### 奖励历史
- `GET /api/reward-history` - 获取奖励发放历史

### API 响应格式
```typescript
interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: any
}
```

## 🚀 部署指南

### 环境配置
1. 创建生产环境配置文件 `.env.production`
2. 配置 MongoDB Atlas 或其他云数据库
3. 设置安全的 JWT 密钥

### Vercel 部署（推荐）
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### Docker 部署
```bash
# 构建镜像
docker build -t task3-operations-dashboard .

# 运行容器
docker run -p 3000:3000 task3-operations-dashboard
```

### 传统服务器部署
```bash
# 构建项目
pnpm build

# 使用 PM2 运行
pm2 start ecosystem.config.js
```

## 👨‍💻 开发指南

### 代码规范
- 使用 TypeScript 编写所有代码
- 遵循 ESLint 和 Prettier 配置
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名
- Git 提交信息使用中文

### 开发流程
1. 创建功能分支
2. 编写代码和测试
3. 运行 `pnpm lint` 检查代码质量
4. 提交代码并创建 PR
5. 代码审查后合并

### 添加新功能
1. 在 `prisma/schema.prisma` 中定义数据模型
2. 在 `app/api/` 中创建 API 路由
3. 在 `components/` 中创建 UI 组件
4. 在 `hooks/` 中添加数据逻辑
5. 更新类型定义和文档

### 调试技巧
- 使用 `console.log` 进行调试（开发环境）
- 查看 Network 面板检查 API 请求
- 使用 MongoDB Compass 查看数据库
- 利用 React DevTools 调试组件状态

## 🔧 常见问题

### Q: MongoDB 连接失败
A: 检查 MongoDB 服务是否启动，确认连接字符串格式正确

### Q: Prisma 客户端错误
A: 运行 `pnpm prisma generate` 重新生成客户端

### Q: 构建失败
A: 检查 TypeScript 错误，运行 `pnpm type-check`

### Q: 样式不生效
A: 确认 Tailwind CSS 配置正确，检查类名拼写

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！请参考 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细的贡献指南。

## 📞 联系我们

如有问题或建议，请联系开发团队。
