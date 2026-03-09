import ZoomImage from '@/app/components/mdx/ZoomImage'
import { renderMDX } from '@/lib/mdx'

const getSampleMdx = (regions: string, area: string, title: string) => `---
title: ${title} 가이드
author: Gemini
---

# ${title}

- **대지역:** ${regions}
- **중지역:** ${area}

---

<CustomHeader>가이드 소개 (커스텀 컴포넌트)</CustomHeader>

이것은 **${title}** 에 대한 샘플 가이드 콘텐츠입니다.
MDX를 사용하면 이렇게 React 컴포넌트를 직접 사용할 수 있습니다.

<GuideImage src="https://cdn.discordapp.com/attachments/1336682544544088085/1480096971284025414/image.png?ex=69ae6f38&is=69ad1db8&hm=c666bdb16a58785ad890d3aadbf8517a3265074ae7312ad610fa0df4c838b0f0&" alt="가이드에 사용될 이미지 예시" />

## 데이터 표

| 구분 | 값 | 비고 |
|---|---|---|
| 능력치 A | 100 | 높음 |
| 능력치 B | 75 | 중간 |
| 능력치 C | 25 | 낮음 |

<Callout type="info">hf </Callout>

~~취소선~~



가이드를 읽어주셔서 감사합니다.
`

export default async function WanderingTalesPage({
  params,
}: {
  params: Promise<{ regions: string; id: string }>
}) {
  const { regions } = await params

  const decodedRegions = decodeURIComponent(regions)

  const source = getSampleMdx(decodedRegions, '어딘가', '거위잡기')

  const { content, frontmatter } = await renderMDX(source)

  return (
    <div className="min-h-screen p-4">
      <main className="max-w-4xl mx-auto py-8">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold ">
            {frontmatter.title ? String(frontmatter.title) : '가이드'}
          </h1>
        </header>

        <ZoomImage />
        <article className="prose dark:prose-invert lg:prose-xl">{content}</article>
      </main>
    </div>
  )
}
