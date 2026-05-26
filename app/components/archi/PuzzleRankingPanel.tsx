'use client'

import { formatClearedAt } from '@/lib/archi/format-cleared-at'
import { usePuzzleRanking } from '@/hooks/usePuzzleRanking'

interface PuzzleRankingPanelProps {
  puzzleId: string
  refreshKey?: number
}

function rankBadge(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}`
}

export default function PuzzleRankingPanel({
  puzzleId,
  refreshKey = 0,
}: PuzzleRankingPanelProps) {
  const { entries, loading, error } = usePuzzleRanking(puzzleId, refreshKey)

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">랭킹</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          이동 횟수 적은 순 · 달성 시간
        </p>

        {loading && (
          <p className="mt-4 text-sm text-muted-foreground">불러오는 중…</p>
        )}

        {error && !loading && (
          <p className="mt-4 text-sm text-amber-500">{error}</p>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            아직 클리어 기록이 없습니다.
          </p>
        )}

        {!loading && entries.length > 0 && (
          <ol className="mt-4 max-h-[min(70vh,520px)] space-y-2 overflow-y-auto">
            {entries.map((entry) => (
              <li
                key={`${entry.rank}-${entry.nickname}-${entry.clearedAt}`}
                className="flex gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm"
              >
                <span
                  className="w-7 shrink-0 text-center font-bold tabular-nums text-foreground"
                  aria-hidden
                >
                  {rankBadge(entry.rank)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {entry.nickname}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="font-mono text-foreground/90">
                      {entry.moveCount}회
                    </span>
                    <span className="mx-1">·</span>
                    <time dateTime={entry.clearedAt}>
                      {formatClearedAt(entry.clearedAt)}
                    </time>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  )
}
