import { useState } from 'react'
import { useChromeAiAvailability } from './hooks/useChromeAiAvailability.ts'
import { ApiStatusGrid } from './components/ApiStatusGrid.tsx'
import { ChatPanel } from './components/ChatPanel.tsx'
import { SetupGuide } from './components/SetupGuide.tsx'
import { SummarizePanel } from './components/SummarizePanel.tsx'
import { TranslatePanel } from './components/TranslatePanel.tsx'
import { WriteAssistPanel } from './components/WriteAssistPanel.tsx'

const TABS = [
  { id: 'chat', label: '채팅' },
  { id: 'summarize', label: '요약' },
  { id: 'translate', label: '번역' },
  { id: 'write', label: '작성 도구' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const { statuses, loading, error, refresh } = useChromeAiAvailability()
  const [tab, setTab] = useState<TabId>('chat')
  const readyCount = statuses.filter((item) => item.availability === 'available').length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Built-in AI</p>
            <h1 className="text-xl font-semibold">Chrome On-Device AI</h1>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">Gemini Nano · 이 기기에서만 실행</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="space-y-3">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground break-keep">
            Google Chrome Built-in AI를 단독 앱으로 실행합니다. Prompt API, 요약, 번역, 언어 감지, 작성 도구가
            브라우저 안에서만 돌고 입력은 서버로 올라가지 않습니다. 데스크톱 Chrome과 충분한 저장공간(약 22GB
            여유)이 필요합니다.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{loading ? '상태 확인 중' : `${readyCount}개 API 준비됨`}</span>
            <button type="button" onClick={() => void refresh()} className="underline-offset-2 hover:underline">
              다시 확인
            </button>
          </div>
        </section>

        <ApiStatusGrid statuses={statuses} loading={loading} />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <SetupGuide />

        <nav className="flex flex-wrap gap-2 border-b border-border pb-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                tab === item.id
                  ? 'bg-accent text-white'
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
      </main>
    </div>
  )
}
