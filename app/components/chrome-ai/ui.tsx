import type { ReactNode } from 'react'

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground mb-1.5">{children}</label>
}

export function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {children}
      </select>
    </div>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 8,
  placeholder,
  disabled,
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className="flex-1 min-h-0">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full min-h-[8rem] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
      />
    </div>
  )
}

export function OutputBox({
  label = '결과',
  value,
  empty = '결과가 여기 표시됩니다.',
}: {
  label?: string
  value: string
  empty?: string
}) {
  return (
    <div className="flex-1 min-h-0">
      <FieldLabel>{label}</FieldLabel>
      <div className="min-h-[8rem] rounded-md border border-border bg-surface px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed">
        {value || <span className="text-muted-foreground">{empty}</span>}
      </div>
    </div>
  )
}

export function DownloadBar({ progress }: { progress: number | null }) {
  if (progress === null) return null
  const percent = Math.min(100, Math.round(progress * 100))
  return (
    <div className="rounded-md border border-accent/30 bg-accent-soft/40 px-3 py-2 text-sm">
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>온디바이스 모델 다운로드</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-accent transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="rounded-md border border-red-300/60 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
      {message}
    </p>
  )
}
