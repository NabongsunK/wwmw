import { availabilityLabel } from '../lib/chrome-ai.ts'
import type { ChromeAiApiStatus } from '../types.ts'

function toneClass(status: ChromeAiApiStatus): string {
  switch (status.availability) {
    case 'available':
      return 'border-accent/40 bg-accent-soft/70 text-foreground'
    case 'downloadable':
    case 'downloading':
      return 'border-amber-400/40 bg-amber-950/40 text-amber-100'
    default:
      return 'border-border bg-muted/50 text-muted-foreground'
  }
}

export function ApiStatusGrid({
  statuses,
  loading,
}: {
  statuses: ChromeAiApiStatus[]
  loading: boolean
}) {
  if (loading && statuses.length === 0) {
    return <p className="text-sm text-muted-foreground">브라우저 AI 상태를 확인하는 중...</p>
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {statuses.map((status) => (
        <div
          key={status.name}
          title={status.detail}
          className={`min-h-[3.25rem] rounded-lg border px-3 py-2 ${toneClass(status)}`}
        >
          <p className="text-xs font-medium">{status.label}</p>
          <p className="mt-0.5 text-[11px] opacity-80">{availabilityLabel(status)}</p>
        </div>
      ))}
    </div>
  )
}
