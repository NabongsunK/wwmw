'use client'

import { useState } from 'react'
import { useChromeAiAvailability } from '@/hooks/useChromeAiAvailability'
import { ApiStatusGrid } from './ApiStatusGrid'
import { ChatPanel } from './ChatPanel'
import { SetupGuide } from './SetupGuide'
import { SummarizePanel } from './SummarizePanel'
import { TranslatePanel } from './TranslatePanel'
import { WriteAssistPanel } from './WriteAssistPanel'

const TABS = [
  { id: 'chat', label: '채팅' },
  { id: 'summarize', label: '요약' },
  { id: 'translate', label: '번역' },
  { id: 'write', label: '작성 도구' },
] as const

type TabId = (typeof TABS)[number]['id']

export function ChromeAiStudio() {
  const { statuses, loading, error, refresh } = useChromeAiAvailability()
  const [tab, setTab] = useState<TabId>('chat')
  const readyCount = statuses.filter((item) => item.availability === 'available').length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-accent/40 bg-accent-soft/40 px-3 py-1 text-xs font-medium text-foreground">
          서버 없이 · Chrome Gemini Nano
        </p>
        <h1 className="font-soonbatang text-3xl font-bold tracking-tight">온디바이스 AI</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Google Chrome Built-in AI를 이 사이트에서 바로 써 봅니다. Prompt API, 요약, 번역, 언어 감지, 작성
          도구가 모두 브라우저 안에서 실행되며 입력은 Google 서버로 올라가지 않습니다. 데스크톱 Chrome과
          충분한 저장공간(약 22GB 여유)·하드웨어가 필요합니다.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{loading ? '상태 확인 중' : `${readyCount}개 API 준비됨`}</span>
          <button type="button" onClick={() => void refresh()} className="underline-offset-2 hover:underline">
            다시 확인
          </button>
        </div>
      </header>

      <ApiStatusGrid statuses={statuses} loading={loading} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <SetupGuide />

      <nav className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              tab === item.id
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === 'chat' ? <ChatPanel /> : null}
      {tab === 'summarize' ? <SummarizePanel /> : null}
      {tab === 'translate' ? <TranslatePanel /> : null}
      {tab === 'write' ? <WriteAssistPanel /> : null}
    </div>
  )
}
