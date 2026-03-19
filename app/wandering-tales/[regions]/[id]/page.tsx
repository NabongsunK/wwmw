'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { renderMDX } from '@/lib/mdx'
import { useApi } from '@/hooks/useApi'
import { WanderingTalesFrontmatter } from '@/types/wanderingtales'
import ZoomImage from '@/app/components/mdx/ZoomImage'

export default function WanderingTalesPage() {
  const params = useParams()
  const { fetchApi } = useApi()

  const postId = params.id

  const [content, setContent] = useState<ReactNode>('')
  const [frontmatter, setFrontmatter] = useState<WanderingTalesFrontmatter>({
    title: '',
    region: '',
    subRegion: '',
  })

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return
      const json = await fetchApi(`/wanderingtales/${postId}`)
      if (json?.success && json?.data) {
        const { content } = await renderMDX(json.data.body)

        const info = {
          title: json.data.title,
          region: json.data.region,
          subRegion: json.data.subRegion,
        }

        setContent(content)
        setFrontmatter(info)
      } else {
        setContent('포스트를 불러오는 데 실패했습니다.')
        console.error('Failed to fetch post data')
      }
    }

    try {
      fetchPost()
    } catch (error) {
      console.error('Error fetching post:', error)
    }
  }, [fetchApi, postId])

  return (
    <div className="min-h-screen p-4">
      <main className="max-w-5xl mx-auto py-8">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold ">
            {frontmatter.title ? String(frontmatter.title) : '가이드'}
            {frontmatter.region && (
              <span className="ml-4 text-sm text-muted-foreground">
                ({frontmatter.region} - {frontmatter.subRegion ?? ''})
              </span>
            )}
          </h1>
        </header>
        <ZoomImage />
        <article className="prose dark:prose-invert lg:prose-l max-w-full">{content}</article>
      </main>
    </div>
  )
}
