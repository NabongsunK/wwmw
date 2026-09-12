import { availabilityLabel } from '@/lib/chrome-ai'
import type { ChromeAiApiStatus } from '@/types/chrome-ai'

function toneClass(status: ChromeAiApiStatus): string {
  switch (status.availability) {
    case 'available':
      return 'border-accent/40 bg-accent-soft/50 text-foreground'
    case 'downloadable':
    case 'downloading':
      return 'border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'
    default:
      return 'border-border bg-muted/40 text-muted-foreground'
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
          className={`rounded-md border px-3 py-2 ${toneClass(status)}`}
        >
          <p className="text-xs font-medium">{status.label}</p>
          <p className="mt-0.5 text-[11px] opacity-80">{availabilityLabel(status)}</p>
        </div>
      ))}
    </div>
  )
}
