import { useState } from 'react'
import { Button } from './Button.tsx'
import { consumeTextStream, createChromeAiSession, toErrorMessage } from '../lib/chrome-ai.ts'
import { DownloadBar, ErrorText, OutputBox, SelectField, TextAreaField } from './ui.tsx'

const SAMPLE = `Chrome Built-in AI runs Gemini Nano locally in the browser. After a one-time model download, prompting, summarizing, and translating can happen on-device. No prompt text is sent to a remote API, which keeps short-lived content on the user's computer.`

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
