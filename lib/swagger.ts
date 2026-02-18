import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = async (): Promise<Record<string, unknown>> => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'WWE API',
        version: '1.0',
        description: 'WWE 프로젝트 API 문서',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: '개발 서버',
        },
      ],
    },
  })
  return spec as Record<string, unknown>
}
