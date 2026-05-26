'use client'

const IS_DEV = process.env.NODE_ENV === 'development'

interface DevClearButtonProps {
  onClear: () => void
  disabled?: boolean
}

/** 개발 환경에서만 보이는 즉시 클리어·DB 저장 테스트 버튼 */
export default function DevClearButton({
  onClear,
  disabled = false,
}: DevClearButtonProps) {
  if (!IS_DEV) return null

  return (
    <button
      type="button"
      onClick={onClear}
      disabled={disabled}
      className="rounded-md border border-dashed border-violet-500/60 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300 hover:bg-violet-500/20 disabled:opacity-40"
    >
      [DEV] 클리어 처리
    </button>
  )
}
