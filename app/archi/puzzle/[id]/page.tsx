'use client'

import { useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import PuzzleGame from '@/app/components/puzzle/PuzzleGame'
import PegGame from '@/app/components/peg/PegGame'
import PuzzleNicknameGate from '@/app/components/archi/PuzzleNicknameGate'
import { getPuzzle } from '@/lib/archi/puzzle-registry'
import { useUid } from '@/hooks/useUid'

export default function ArchiPuzzlePage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : params.id?.[0]
  const [nickname, setNickname] = useState<string | null>(null)
  const { uid } = useUid()

  if (!id) notFound()

  const entry = getPuzzle(id)
  if (!entry) notFound()

  const title =
    entry.kind === 'sliding' ? entry.level.title : entry.level.title

  if (!nickname) {
    return (
      <PuzzleNicknameGate
        puzzleId={id}
        puzzleTitle={title}
        onStart={setNickname}
      />
    )
  }

  if (entry.kind === 'sliding') {
    return (
      <PuzzleGame
        level={entry.level}
        puzzleId={id}
        nickname={nickname}
        uid={uid}
      />
    )
  }
  return (
    <PegGame level={entry.level} puzzleId={id} nickname={nickname} uid={uid} />
  )
}
