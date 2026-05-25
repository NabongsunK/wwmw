'use client'

import { notFound, useParams } from 'next/navigation'
import PuzzleGame from '@/app/components/puzzle/PuzzleGame'
import { getLevel } from '@/lib/puzzle/levels'

export default function ArchiPuzzlePage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : params.id?.[0]
  if (!id) notFound()

  const level = getLevel(id)
  if (!level) notFound()

  return <PuzzleGame level={level} />
}
