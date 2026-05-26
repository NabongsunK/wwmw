import type { ClearSaveStatus } from '@/hooks/usePuzzleClearSave'

interface ClearSaveStatusMessageProps {
  status: ClearSaveStatus
  errorMessage: string | null
  savedNickname?: string | null
}

export default function ClearSaveStatusMessage({
  status,
  errorMessage,
  savedNickname,
}: ClearSaveStatusMessageProps) {
  if (status === 'idle') return null
  if (status === 'saving') {
    return (
      <p className="mt-2 text-center text-sm text-muted-foreground">
        클리어 기록 저장 중…
      </p>
    )
  }
  if (status === 'saved') {
    return (
      <p className="mt-2 text-center text-sm text-green-500">
        클리어 기록이 저장되었습니다.
        {savedNickname ? (
          <>
            <br />
            <span className="text-muted-foreground">({savedNickname})</span>
          </>
        ) : null}
      </p>
    )
  }
  return (
    <p className="mt-2 text-center text-sm text-amber-500">
      {errorMessage ?? '저장에 실패했습니다. 다시 클리어해 주세요.'}
    </p>
  )
}
