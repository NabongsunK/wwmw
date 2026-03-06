import { Suspense } from 'react'
import { BuildList } from '@/app/components/BuildList'

export default function Home() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">로딩 중...</div>}>
      <BuildList />
    </Suspense>
  )
}
