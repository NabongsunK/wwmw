'use client'

import PuzzleRankingPanel from '@/app/components/archi/PuzzleRankingPanel'

interface PuzzlePlayLayoutProps {
  puzzleId: string
  rankingRefreshKey?: number
  children: React.ReactNode
}

export default function PuzzlePlayLayout({
  puzzleId,
  rankingRefreshKey = 0,
  children,
}: PuzzlePlayLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
      <div className="min-w-0 flex-1">{children}</div>
      <PuzzleRankingPanel puzzleId={puzzleId} refreshKey={rankingRefreshKey} />
    </div>
  )
}
