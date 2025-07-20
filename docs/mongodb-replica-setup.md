# MongoDB副本集配置指南

为了支持Prisma事务，需要将MongoDB配置为副本集模式。

## 本地开发环境配置

### 1. 停止现有MongoDB服务
```bash
sudo systemctl stop mongod
# 或者
brew services stop mongodb/brew/mongodb-community
```

### 2. 启动副本集模式
```bash
# 创建数据目录
mkdir -p /usr/local/var/mongodb-replica

# 启动MongoDB副本集
mongod --replSet myReplSet --dbpath /usr/local/var/mongodb-replica --port 27017
```

### 3. 初始化副本集
在新的终端中连接到MongoDB：
```bash
mongo --port 27017
```

在MongoDB shell中执行：
```javascript
rs.initiate({
  _id: "myReplSet",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})
```

### 4. 更新数据库连接字符串
在 `.env.local` 中更新：
```
DATABASE_URL="mongodb://localhost:27017/footrace_ai_dev?replicaSet=myReplSet"
```

## Docker配置（推荐本地开发）

创建 `docker-compose.yml`：
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    container_name: mongodb-replica
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: footrace_ai_dev
    command: ["--replSet", "myReplSet", "--bind_ip_all"]
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

启动并初始化：
```bash
docker-compose up -d
docker exec -it mongodb-replica mongo --eval "rs.initiate({_id: 'myReplSet', members: [{_id: 0, host: 'localhost:27017'}]})"
```

更新连接字符串：
```
DATABASE_URL="mongodb://root:password@localhost:27017/footrace_ai_dev?authSource=admin&replicaSet=myReplSet"
```

## 验证配置

运行以下命令验证副本集状态：
```bash
mongo --eval "rs.status()"
```

应该看到副本集状态为 "PRIMARY"。
