# 언어 관리 시스템 사용 가이드

## 📁 생성된 파일

1. **`app/providers/LanguageProvider.tsx`** - Context Provider (localStorage 연동)
2. **`app/components/LanguageSwitcher.tsx`** - 언어 전환 UI 컴포넌트 (2가지 버전)
3. **`hooks/useApi.ts`** - 언어가 자동 적용되는 API 호출 Hook
4. **`app/layout.tsx`** - Provider 적용 완료 ✅

---

## 🚀 사용 방법

### 1. 언어 전환 UI 추가

```tsx
// 어떤 컴포넌트에서든 사용 가능
import { LanguageSwitcher, LanguageSwitcherButtons } from '@/app/components/LanguageSwitcher'

export default function Header() {
  return (
    <header>
      <h1>WWE</h1>
      {/* Select 박스 버전 */}
      <LanguageSwitcher />

      {/* 또는 버튼 버전 */}
      <LanguageSwitcherButtons />
    </header>
  )
}
```

---

### 2. 현재 언어 가져오기

```tsx
'use client'

import { useLanguage } from '@/app/providers/LanguageProvider'

export default function MyComponent() {
  const { lang, setLang } = useLanguage()

  return (
    <div>
      <p>현재 언어: {lang}</p>
      <button onClick={() => setLang('en')}>영어로 변경</button>
    </div>
  )
}
```

---

### 3. API 호출 (언어 자동 적용) ⭐ 추천

```tsx
'use client'

import { useApi } from '@/hooks/useApi'
import { useEffect, useState } from 'react'

export default function InnerwayList() {
  const { fetchApi } = useApi() // 현재 언어가 자동으로 적용됨
  const [innerways, setInnerways] = useState([])

  useEffect(() => {
    // /api/{lang}/innerways 로 자동 호출
    fetchApi('innerways')
      .then((data) => setInnerways(data))
      .catch(console.error)
  }, [fetchApi])

  return <div>{/* 렌더링 */}</div>
}
```

**또는 직접 호출:**

```tsx
const { lang } = useLanguage()
const response = await fetch(`/api/${lang}/innerways`)
```

---

### 4. Server Component에서 사용 (URL 파라미터 방식)

Server Component에서는 Context를 사용할 수 없으므로, 필요시 URL 파라미터로 전달:

```tsx
// app/innerways/page.tsx (Server Component)
export default async function InnerwaysPage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = searchParams.lang || 'ko'

  // 서버에서 직접 API 호출
  const response = await fetch(`http://localhost:3000/api/${lang}/innerways`)
  const data = await response.json()

  return <div>{/* 렌더링 */}</div>
}
```

---

## 🔧 API Hook 고급 사용

### GET 요청

```tsx
const { fetchApi } = useApi()

// 기본 GET
const innerways = await fetchApi('innerways')

// 쿼리 파라미터
const filtered = await fetchApi('innerways?유파_code=1001001')
```

### POST/PUT/DELETE 요청

```tsx
const { fetchApi } = useApi()

// POST
await fetchApi('innerways', {
  method: 'POST',
  body: JSON.stringify({ title: '...' }),
})

// PUT
await fetchApi('innerways/123', {
  method: 'PUT',
  body: JSON.stringify({ title: '...' }),
})

// DELETE
await fetchApi('innerways/123', {
  method: 'DELETE',
})
```

---

## 💾 localStorage 동기화

- 언어 선택 시 자동으로 `localStorage`에 저장됨
- 브라우저를 새로고침해도 언어 설정 유지
- Key: `wwe-language`

---

## 🎨 LanguageSwitcher 커스터마이징

스타일을 원하는 대로 수정하세요:

```tsx
// app/components/LanguageSwitcher.tsx
// Tailwind 클래스를 수정하여 디자인 변경 가능
```

---

## 📌 주의사항

1. **Client Component에서만 사용**: `'use client'` 필수
2. **Provider 내부에서 사용**: `LanguageProvider`로 감싸진 컴포넌트에서만 사용 가능 (이미 `layout.tsx`에 적용됨)
3. **Hydration 안전**: SSR과 CSR 간 mismatch 방지 처리 완료

---

## 예시: 실전 적용

```tsx
'use client'

import { useApi } from '@/hooks/useApi'
import { useEffect, useState } from 'react'
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher'

export default function SimulatorPage() {
  const { fetchApi, lang } = useApi()
  const [innerways, setInnerways] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchApi('innerways/simulator')
      .then((data) => {
        setInnerways(data.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [fetchApi]) // fetchApi는 lang이 변경되면 다시 생성됨

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <header>
        <h1>심법 시뮬레이터</h1>
        <LanguageSwitcher />
      </header>

      <ul>
        {innerways.map((item) => (
          <li key={item.id}>
            {item.심법명} - {item.유파}
          </li>
        ))}
      </ul>
    </div>
  )
}
```
