'use client'

import useInput from '@/hooks/useInput'
import RoundInput from '../components/ui/RoundInput'
import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { TwentyQuestion } from '@/types/twenty-questions'
import { useHighlight } from '@/hooks/useHighlight'

const searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export default function TwentyQuestionsPage() {
  const { fetchApi } = useApi()
  const searchQuery = useInput('')

  const [questions, setQuestions] = useState<TwentyQuestion[]>([])
  const [beforeQuery, setBeforeQuery] = useState('')

  const hasQuery = searchQuery.value.trim().length > 0

  const highlight = useHighlight(beforeQuery)

  useEffect(() => {
    if (!searchQuery.value.trim()) {
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const json = await fetchApi(`/twenty-questions?q=${encodeURIComponent(searchQuery.value)}`)
        setBeforeQuery(searchQuery.value)
        if (json?.success && json?.data?.data) {
          setQuestions(json.data.data)
        } else {
          setQuestions([])
        }
      } catch (error) {
        console.error('Error fetching questions:', error)
        setQuestions([])
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [searchQuery.value, fetchApi])

  return (
    <main className="container max-w-5xl py-6 min-h-screen">
      <header className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">스무고개</h1>
      </header>

      <RoundInput
        value={searchQuery.value}
        onChange={searchQuery.onChange}
        placeholder="단서를 입력하세요"
        leftIcon={searchIcon}
      />

      <div className="mt-2 border border-border rounded-lg mb-6 space-y-6 shadow-sm">
        <table className="w-full text-left border border-border rounded-lg overflow-hidden">
          <thead className="bg-surface/40">
            <tr>
              <th className="px-4 py-3 border-b border-border text-sm font-semibold">번호</th>
              <th className="px-4 py-3 border-b border-border text-sm font-semibold">단서</th>
              <th className="px-4 py-3 border-b border-border text-sm font-semibold">정답</th>
              <th className="px-4 py-3 border-b border-border text-sm font-semibold">제보</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {!hasQuery && !questions.length && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-muted-foreground">
                  검색어를 입력하세요 🔍
                </td>
              </tr>
            )}

            {hasQuery && questions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-muted-foreground">
                  검색 결과가 없습니다
                </td>
              </tr>
            )}
            {questions.map((row) => (
              <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3 text-sm">{row.id}</td>
                <td className="px-4 py-3">{highlight(row.hint)}</td>
                <td className="px-4 py-3 font-bold text-blue-500">{highlight(row.answer)}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.user_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
