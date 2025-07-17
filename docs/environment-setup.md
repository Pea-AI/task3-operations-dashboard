# 环境配置指南

## 创建环境配置文件

请根据以下模板创建对应的环境配置文件：

### 1. 本地开发环境 (.env.local)

在项目根目录创建 `.env.local` 文件：

```env
# Local Development Environment Configuration
# MongoDB Database Connection
DATABASE_URL="mongodb://localhost:27017/task3_operations_dashboard_dev"

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# JWT Secret (for authentication if needed)
JWT_SECRET=your-local-jwt-secret-key-here

# Optional: MongoDB Atlas connection (comment out the localhost one above if using this)
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/task3_operations_dashboard_dev?retryWrites=true&w=majority"
```

### 2. 生产环境 (.env.production)

在项目根目录创建 `.env.production` 文件：

```env
# Production Environment Configuration
# MongoDB Database Connection (MongoDB Atlas recommended)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/task3_operations_dashboard?retryWrites=true&w=majority"

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# JWT Secret (use a secure random string)
JWT_SECRET=your-production-jwt-secret-key-here

# Additional production configurations
# SSL and security settings can be added here
```

## 使用说明

1. **本地开发**：
   - 确保本地 MongoDB 服务正在运行
   - 或者使用 MongoDB Atlas 云服务
   - 运行 `pnpm dev` 启动开发服务器

2. **生产环境**：
   - 使用 MongoDB Atlas 或其他云数据库服务
   - 确保 JWT_SECRET 是一个安全的随机字符串
   - 配置正确的域名和 API URL

3. **数据库连接字符串格式**：
   - 本地 MongoDB: `mongodb://localhost:27017/database_name`
   - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority`

## 注意事项

- 环境文件已被 Git 忽略，不会被提交到版本控制
- 请确保生产环境的敏感信息（如密码、密钥）妥善保管
- 可以使用 `dotenv` 包来加载环境变量（Next.js 默认支持）
