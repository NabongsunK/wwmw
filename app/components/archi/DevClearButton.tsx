'use client'

interface DevClearButtonProps {
  onClear: () => void
  disabled?: boolean
}

/** 즉시 클리어·DB 저장 (테스트·운영 공통) */
export default function DevClearButton({ onClear, disabled = false }: DevClearButtonProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      disabled={disabled}
      className="rounded-md border border-dashed border-violet-500/60 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300 hover:bg-violet-500/20 disabled:opacity-40"
    >
      강제 클리어
    </button>
  )
}
