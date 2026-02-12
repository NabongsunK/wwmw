import { getApiDocs } from '@/lib/swagger'
import ReactSwagger from './react-swagger'

export default async function ApiDocPage() {
  const spec = await getApiDocs()
  return (
    <section className="container mx-auto py-8">
      <h1 className="mb-4 text-2xl font-bold">API 문서</h1>
      <ReactSwagger spec={spec} />
    </section>
  )
}
