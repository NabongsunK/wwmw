'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useUid } from '@/hooks/useUid'
import type { Build, BuildItem } from '@/types/build'

function parseList(
  value: unknown,
): BuildItem[] | { id: number; title?: string; 등급?: string; [k: string]: unknown }[] {
  if (Array.isArray(value)) return value as BuildItem[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function BuildDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : null
  const { uid, isAdmin } = useUid()

  const [build, setBuild] = useState<Build | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  const canEdit = uid && (isAdmin || (build?.user_id != null && build.user_id === uid))

  const fetchBuild = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const res = await fetch(`/api/builds/${id}`)
      const json = await res.json()
      if (json?.success && json?.data) {
        setBuild(json.data)
      } else {
        setBuild(null)
      }
    } catch {
      setBuild(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBuild()
  }, [fetchBuild])

  useEffect(() => {
    if (!uid || !build?.id) return
    fetch(`/api/builds/${build.id}/like?uid=${encodeURIComponent(uid)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json?.data?.liked) setLiked(true)
      })
      .catch(() => {})
  }, [uid, build?.id])

  const handleLike = useCallback(async () => {
    if (!uid || !build?.id) return
    setLikeLoading(true)
    try {
      const res = await fetch(`/api/builds/${build.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action: liked ? 'remove' : 'add' }),
      })
      const json = await res.json()
      if (json?.success) {
        setLiked(!liked)
        fetchBuild()
      }
    } finally {
      setLikeLoading(false)
    }
  }, [uid, build?.id, liked, fetchBuild])

  const handleDelete = useCallback(async () => {
    if (!uid || !build?.id || !confirm('정말 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`/api/builds/${build.id}?uid=${encodeURIComponent(uid)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/builds')
      } else {
        const json = await res.json()
        alert(json?.message ?? '삭제에 실패했습니다.')
      }
    } catch (e) {
      console.error(e)
    }
  }, [uid, build?.id, router])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (!build) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">빌드를 찾을 수 없습니다.</p>
          <Link href="/builds" className="text-foreground underline">
            목록으로
          </Link>
        </div>
      </div>
    )
  }

  const 무술들 = parseList(build.무술들)
  const 비결들 = parseList(build.비결들) as {
    id: number
    title?: string
    비결_img?: string
    순서?: number
  }[]
  const 심법들 = parseList(build.심법들) as {
    id: number
    title?: string
    등급?: string
    심법_img?: string
    유파_img?: string
    순서?: number
  }[]

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/builds" className="text-muted-foreground hover:text-foreground text-sm">
          ← 목록으로
        </Link>
      </div>

      <article className="border rounded-lg p-6 md:p-8 bg-card">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{build.name}</h1>
            <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
              {build.category && (
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  {build.category}
                </span>
              )}
              {build.version_name && <span>버전: {build.version_name}</span>}
              {build.status && (
                <span
                  className={
                    build.status === 'active'
                      ? 'text-green-600 dark:text-green-400'
                      : build.status === 'inactive'
                        ? 'text-gray-500'
                        : 'text-orange-600 dark:text-orange-400'
                  }
                >
                  {build.status === 'active'
                    ? '활성'
                    : build.status === 'inactive'
                      ? '비활성'
                      : '보관됨'}
                </span>
              )}
              <span>생성일: {new Date(build.created_at).toLocaleDateString('ko-KR')}</span>
              {build.좋아요수 != null && <span>· 좋아요 {build.좋아요수.toLocaleString()}회</span>}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {uid && (
              <button
                type="button"
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  liked
                    ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {liked ? '❤️' : '🤍'} {liked ? '좋아요 취소' : '좋아요'}
              </button>
            )}
            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => router.push(`/builds?edit=${build.id}`)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>

        {build.description && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">설명</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{build.description}</p>
          </div>
        )}

        {무술들.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">무기 & 무술</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {무술들.map((m, idx) => (
                <div
                  key={m.id ?? idx}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30"
                >
                  {(m as BuildItem & { 무술_img?: string }).무술_img ? (
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-background flex-shrink-0">
                      <Image
                        src={(m as BuildItem & { 무술_img?: string }).무술_img ?? ''}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-background flex items-center justify-center text-2xl flex-shrink-0">
                      ⚔️
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {(m as BuildItem).무술_code ?? `무술 #${(m as BuildItem).id}`}
                    </div>
                    {(m as BuildItem).장비_code && (
                      <div className="text-sm text-muted-foreground">
                        장비: {(m as BuildItem).장비_code}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {비결들.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">비결</h2>
            <ul className="space-y-2">
              {비결들.map((b, idx) => (
                <li key={b.id ?? idx} className="flex items-center gap-3 p-3 border rounded-lg">
                  {b.비결_img ? (
                    <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                      <Image src={b.비결_img} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      📜
                    </div>
                  )}
                  <span className="font-medium">{b.title ?? `비결 #${b.id}`}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {심법들.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">심법</h2>
            <ul className="space-y-2">
              {심법들.map((s, idx) => (
                <li key={s.id ?? idx} className="flex items-center gap-3 p-3 border rounded-lg">
                  {s.심법_img ? (
                    <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                      <Image src={s.심법_img} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      🧘
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{s.title ?? `심법 #${s.id}`}</span>
                    {s.유파_img ? (
                      <Image src={s.유파_img} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        🧘
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  )
}
