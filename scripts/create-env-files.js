#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Local development environment template
const localEnvTemplate = `# Local Development Environment Configuration
# MongoDB Database Connection
DATABASE_URL="mongodb://localhost:27017/task3_operations_dashboard_dev"

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# JWT Secret (for authentication if needed)
JWT_SECRET=your-local-jwt-secret-key-here

# Optional: MongoDB Atlas connection (comment out the localhost one above if using this)
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/task3_operations_dashboard_dev?retryWrites=true&w=majority"
`

// Production environment template
const prodEnvTemplate = `# Production Environment Configuration
# MongoDB Database Connection (MongoDB Atlas recommended)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/task3_operations_dashboard?retryWrites=true&w=majority"

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# JWT Secret (use a secure random string)
JWT_SECRET=your-production-jwt-secret-key-here

# Additional production configurations
# SSL and security settings can be added here
`

const projectRoot = path.resolve(__dirname, '..')

function createEnvFile(filename, content) {
  const filePath = path.join(projectRoot, filename)

  if (fs.existsSync(filePath)) {
    console.log(`⚠️  ${filename} already exists, skipping...`)
    return
  }

  try {
    fs.writeFileSync(filePath, content)
    console.log(`✅ Created ${filename}`)
  } catch (error) {
    console.error(`❌ Error creating ${filename}:`, error.message)
  }
}

function main() {
  console.log('🚀 Creating environment configuration files...\n')

  // Create local development environment file
  createEnvFile('.env.local', localEnvTemplate)

  // Create production environment file
  createEnvFile('.env.production', prodEnvTemplate)

  console.log('\n📝 Next steps:')
  console.log('1. Edit .env.local with your local MongoDB connection details')
  console.log('2. Edit .env.production with your production MongoDB connection details')
  console.log('3. Generate secure JWT secrets for both environments')
  console.log('4. Run "pnpm dev" to start development server')
  console.log('\n📚 For more details, see docs/environment-setup.md')
}

main()
