'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useApi } from '@/hooks/useApi'
import { WanderingTales } from '@/types/wanderingtales'
import { formatIsoToClean } from '@/lib/date'

export default function PostList({ region, subRegion }: { region: string; subRegion: string }) {
  const { fetchApi } = useApi()
  const [posts, setPosts] = useState<WanderingTales[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      const json = await fetchApi(
        `/wanderingtales/?region=${encodeURIComponent(region)}&subRegion=${encodeURIComponent(subRegion)}`,
      )
      if (json?.success && json?.data) {
        setPosts(json.data)
      } else {
        setPosts([])
      }
    }

    try {
      fetchPosts()
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }, [region, subRegion, fetchApi])

  if (posts.length === 0) {
    return <div className="py-20 text-center text-muted-foreground">게시글이 없습니다.</div>
  }

  return (
    <div className="grid gap-1 border-t border-border">
      {posts.map((post) => (
        <div
          key={post.id}
          className="group flex flex-col border-b border-border hover:bg-muted/20 transition-colors cursor-default"
        >
          {/* [위쪽] 클릭 시 상세 페이지로 이동 */}
          <Link
            href={`/wandering-tales/${post.region}/${post.id}`}
            className="flex items-center justify-between px-4 py-4 cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-sm bg-muted text-muted-foreground font-bold uppercase">
                  {post.region} : {post.subRegion}
                </span>
                <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </div>
            </div>
            <span className="text-muted-foreground/30 group-hover:text-foreground transition-colors">
              →
            </span>
          </Link>

          {/* [아래쪽] 복사 가능 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-4 pb-4 select-text">
            <span className="select-none">갱신일 : </span>
            <time className="hover:text-foreground transition-colors">
              {formatIsoToClean(post.updated_at.toString())}
            </time>
            {/* <span>{post.writer}</span> */}
          </div>
        </div>
      ))}
    </div>
  )
}
