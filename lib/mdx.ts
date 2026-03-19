import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

import { WanderingTalesFrontmatter } from '@/types/wanderingtales'
import { mdxComponents } from '@/app/components/mdx/WTMdxComponents'

import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'

export async function renderMDX(source: string) {
  const { content } = await compileMDX<WanderingTalesFrontmatter>({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false, // 이미 API에서 정보 따로 저장함.
      mdxOptions: {
        remarkPlugins: [[remarkGfm]],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'append',
              properties: {
                className: ['anchor'],
              },
              content: {
                type: 'text',
                value: ' 🔗',
              },
            },
          ],
          [
            rehypePrettyCode,
            {
              theme: 'github-dark',
              keepBackground: false,
            },
          ],
        ],
      },
    },
  })

  return { content }
}
