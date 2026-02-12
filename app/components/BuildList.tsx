'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BuildForm } from './BuildForm'
import { useUid } from '@/app/hooks/useUid'
import type { Build } from '@/types/build'

export function BuildList() {
  const searchParams = useSearchParams()
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBuildId, setEditBuildId] = useState<number | undefined>()
  const { uid, isAdmin } = useUid()

  const editFromUrl = searchParams.get('edit')
  useEffect(() => {
    if (editFromUrl) {
      const num = parseInt(editFromUrl, 10)
      if (!isNaN(num)) {
        setEditBuildId(num)
        setShowForm(true)
      }
    }
  }, [editFromUrl])

  const canEditBuild = useCallback(
    (build: Build) => {
      if (!uid) return false
      if (isAdmin) return true
      return build.user_id != null && build.user_id === uid
    },
    [uid, isAdmin],
  )
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [likeLoadingId, setLikeLoadingId] = useState<number | null>(null)

  const fetchBuilds = async () => {
    try {
      const response = await fetch('/api/builds')
      const result = await response.json()

      if (result.success) {
        setBuilds(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch builds:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBuilds()
  }, [])

  // uid가 있고 빌드 목록이 있으면 각 빌드의 좋아요 여부 조회
  useEffect(() => {
    if (!uid || builds.length === 0) return
    const controller = new AbortController()
    Promise.all(
      builds.map(async (b) => {
        try {
          const res = await fetch(`/api/builds/${b.id}/like?uid=${encodeURIComponent(uid)}`, {
            signal: controller.signal,
          })
          const json = await res.json()
          return json?.success && json?.data?.liked ? b.id : null
        } catch {
          return null
        }
      }),
    ).then((ids) => {
      setLikedIds(new Set(ids.filter((id): id is number => id != null)))
    })
    return () => controller.abort()
  }, [uid, builds])

  const handleLike = useCallback(
    async (buildId: number) => {
      if (!uid) return
      setLikeLoadingId(buildId)
      try {
        const liked = likedIds.has(buildId)
        const res = await fetch(`/api/builds/${buildId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, action: liked ? 'remove' : 'add' }),
        })
        const json = await res.json()
        if (json?.success) {
          setLikedIds((prev) => {
            const next = new Set(prev)
            if (liked) next.delete(buildId)
            else next.add(buildId)
            return next
          })
          fetchBuilds()
        }
      } catch (e) {
        console.error('Like failed:', e)
      } finally {
        setLikeLoadingId(null)
      }
    },
    [uid, likedIds],
  )

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEditBuildId(undefined)
            setShowForm(true)
          }}
          className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90"
        >
          + 빌드 등록
        </button>
      </div>

      {builds.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">등록된 빌드가 없습니다.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => (
            <div key={build.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <Link
                  href={`/builds/${build.id}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {build.name}
                </Link>
                <div className="flex gap-2 items-center">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      build.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : build.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }`}
                  >
                    {build.status === 'active'
                      ? '활성'
                      : build.status === 'inactive'
                      ? '비활성'
                      : '보관됨'}
                  </span>
                </div>
              </div>
              {build.category && (
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  {build.category}
                </p>
              )}
              {build.version_name && (
                <p className="text-sm text-muted-foreground mb-2">버전: {build.version_name}</p>
              )}
              {build.description && (
                <p className="text-sm text-muted-foreground mb-2">{build.description}</p>
              )}
              <p className="text-xs text-muted-foreground mb-3">
                생성일: {new Date(build.created_at).toLocaleDateString('ko-KR')}
                {build.좋아요수 != null && (
                  <span className="ml-2">
                    · 좋아요 <span className="font-medium">{build.좋아요수.toLocaleString()}</span>
                    회
                  </span>
                )}
              </p>

              {/* 좋아요 + 액션 버튼 */}
              <div className="flex gap-2 items-center flex-wrap">
                {uid && (
                  <button
                    type="button"
                    onClick={() => handleLike(build.id)}
                    disabled={likeLoadingId === build.id}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                      likedIds.has(build.id)
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                        : 'border border-border hover:bg-muted'
                    }`}
                    title={likedIds.has(build.id) ? '좋아요 취소' : '좋아요'}
                  >
                    <span>{likedIds.has(build.id) ? '❤️' : '🤍'}</span>
                    <span className="text-xs">
                      {likeLoadingId === build.id
                        ? '...'
                        : likedIds.has(build.id)
                        ? '좋아요 취소'
                        : '좋아요'}
                    </span>
                  </button>
                )}
                {canEditBuild(build) && (
                  <>
                    <button
                      onClick={() => {
                        setEditBuildId(build.id)
                        setShowForm(true)
                      }}
                      className="flex-1 px-3 py-1.5 text-sm border border-border rounded hover:bg-muted transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('정말 삭제하시겠습니까?')) {
                          try {
                            const response = await fetch(
                              `/api/builds/${build.id}?uid=${encodeURIComponent(uid!)}`,
                              { method: 'DELETE' },
                            )
                            if (response.ok) {
                              fetchBuilds()
                            } else {
                              const json = await response.json()
                              alert(json?.message ?? '삭제에 실패했습니다.')
                            }
                          } catch (error) {
                            console.error('Failed to delete build:', error)
                          }
                        }
                      }}
                      className="px-3 py-1.5 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BuildForm
          editBuildId={editBuildId}
          onClose={() => {
            setShowForm(false)
            setEditBuildId(undefined)
          }}
          onSuccess={() => {
            fetchBuilds()
            setShowForm(false)
            setEditBuildId(undefined)
          }}
        />
      )}
    </>
  )
}
