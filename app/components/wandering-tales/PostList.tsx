// import { TalePost } from '@/app/wandering-tales/page'
import Link from 'next/link'

const data = [
  {
    id: 1,
    region: '하서',
    subRegion: '미진 나루',
    title: '그대에게 보내는 서신',
    created_at: '2026-03-07T22:32:53.000Z',
    updated_at: '2026-03-07T22:32:53.000Z',
    writer: '관리자',
    notice: 0,
    sort_order: 1,
  },
]

export default function PostList({ region, subRegion }: { region: string; subRegion: string }) {
  const posts = data
  console.log('PostList region:', region, 'subRegion:', subRegion)

  if (posts.length === 0) {
    return <div className="py-20 text-center text-muted-foreground">게시글이 없습니다.</div>
  }

  // const goToPostDetail = (postId: number) => {}

  return (
    <div className="grid gap-1 border-t border-border">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/wandering-tales/${post.region}/${post.id}`}
          className="group flex items-center justify-between py-4 border-b border-border hover:bg-muted/20 transition-colors px-2 cursor-pointer"
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {/* <span>{post.writer}</span> */}
              <span>갱신일 : </span>
              <time>{new Date(post.updated_at).toLocaleDateString()}</time>
            </div>
          </div>
          <div className="text-muted-foreground/30 group-hover:text-foreground transition-colors">
            →
          </div>
        </Link>
      ))}
    </div>
  )
}
