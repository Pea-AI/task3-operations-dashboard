'use client'

import { Suspense } from 'react'
import { AuthLayout } from '@/components/auth-layout'
import { Dashboard } from '@/components/dashboard'

function HomeContent() {
  return (
    <AuthLayout>
      <Dashboard />
    </AuthLayout>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
