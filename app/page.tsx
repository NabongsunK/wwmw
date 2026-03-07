import { Suspense } from 'react'
// import { BuildList } from '@/app/components/BuildList'
import MsyticPage from '@/app/simulator/mystic/page'

export default function Home() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">로딩 중...</div>}>
      {/* TODO: 나중에 메인페이지 변경 시 수정해줘야함. 26.03.07 - 김무겸 */}
      {/* <BuildList /> */}
      <MsyticPage />
    </Suspense>
  )
}
