'use client'

import { useState } from 'react'
import Button from '@/app/components/ui/Button'
import { consumeTextStream, createChromeAiSession, toErrorMessage } from '@/lib/chrome-ai'
import { DownloadBar, ErrorText, OutputBox, SelectField, TextAreaField } from './ui'

const SAMPLE = `Where Winds Meet is a wuxia action RPG set in a living Jianghu. Players wander open landscapes, learn martial arts, and get pulled into faction politics. Instead of a single linear campaign, the game leans on traversal, duels, investigation, and chance encounters that make the world feel inhabited.`

type SummarizerSession = {
  summarize: (text: string, options?: { context?: string; signal?: AbortSignal }) => Promise<string>
  summarizeStreaming?: (
    text: string,
    options?: { context?: string; signal?: AbortSignal },
  ) => ReadableStream<string> | AsyncIterable<string>
  destroy?: () => void
}

export function SummarizePanel() {
  const [text, setText] = useState(SAMPLE)
  const [type, setType] = useState('key-points')
  const [length, setLength] = useState('short')
  const [outputLanguage, setOutputLanguage] = useState('en')
  const [result, setResult] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!text.trim() || busy) return
    setBusy(true)
    setError(null)
    setResult('')
    let summarizer: SummarizerSession | null = null
    try {
      summarizer = await createChromeAiSession<SummarizerSession>(
        'Summarizer',
        {
          type,
          format: 'plain-text',
          length,
          outputLanguage,
          expectedInputLanguages: ['en', 'ja', 'es', 'de', 'fr'],
          sharedContext: 'Summarize clearly for a web app user.',
        },
        setProgress,
      )
      if (summarizer.summarizeStreaming) {
        await consumeTextStream(summarizer.summarizeStreaming(text), setResult)
      } else {
        setResult(await summarizer.summarize(text))
      }
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      summarizer?.destroy?.()
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SelectField label="유형" value={type} onChange={setType}>
          <option value="key-points">핵심 포인트</option>
          <option value="tldr">TL;DR</option>
          <option value="teaser">티저</option>
          <option value="headline">헤드라인</option>
        </SelectField>
        <SelectField label="길이" value={length} onChange={setLength}>
          <option value="short">짧게</option>
          <option value="medium">보통</option>
          <option value="long">길게</option>
        </SelectField>
        <SelectField label="출력 언어" value={outputLanguage} onChange={setOutputLanguage}>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
        </SelectField>
      </div>
      <DownloadBar progress={progress} />
      <ErrorText message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField label="원문" value={text} onChange={setText} rows={12} />
        <OutputBox value={result} />
      </div>
      <Button onClick={() => void run()} isLoading={busy} disabled={!text.trim()}>
        이 기기에서 요약
      </Button>
    </div>
  )
}
