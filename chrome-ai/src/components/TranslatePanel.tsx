import { useState } from 'react'
import { Button } from './Button.tsx'
import {
  TRANSLATOR_LANGUAGES,
  consumeTextStream,
  createChromeAiSession,
  languageLabel,
  pickDetectedLanguage,
  toErrorMessage,
} from '../lib/chrome-ai.ts'
import type { LanguageDetection } from '../types.ts'
import { DownloadBar, ErrorText, OutputBox, SelectField, TextAreaField } from './ui.tsx'

const SAMPLE = '크롬에 내장된 Gemini Nano로, 서버 없이 이 컴퓨터에서 바로 번역하고 대화할 수 있습니다.'

type TranslatorSession = {
  translate: (text: string, options?: { signal?: AbortSignal }) => Promise<string>
  translateStreaming?: (
    text: string,
    options?: { signal?: AbortSignal },
  ) => ReadableStream<string> | AsyncIterable<string>
  destroy?: () => void
}

type DetectorSession = {
  detect: (text: string) => Promise<LanguageDetection[]>
  destroy?: () => void
}

export function TranslatePanel() {
  const [text, setText] = useState(SAMPLE)
  const [sourceLanguage, setSourceLanguage] = useState('auto')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [detected, setDetected] = useState<string | null>(null)
  const [result, setResult] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!text.trim() || busy) return
    setBusy(true)
    setError(null)
    setResult('')
    setDetected(null)
    let detector: DetectorSession | null = null
    let translator: TranslatorSession | null = null
    try {
      let from = sourceLanguage
      if (from === 'auto') {
        detector = await createChromeAiSession<DetectorSession>('LanguageDetector', {}, setProgress)
        const guess = pickDetectedLanguage(await detector.detect(text))
        if (!guess) throw new Error('입력 언어를 감지하지 못했습니다.')
        from = guess.detectedLanguage
        setDetected(`${languageLabel(from)} (${Math.round(guess.confidence * 100)}%)`)
      }
      if (from === targetLanguage) {
        setResult(text)
        return
      }
      translator = await createChromeAiSession<TranslatorSession>(
        'Translator',
        { sourceLanguage: from, targetLanguage },
        setProgress,
      )
      if (translator.translateStreaming) {
        await consumeTextStream(translator.translateStreaming(text), setResult)
      } else {
        setResult(await translator.translate(text))
      }
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      detector?.destroy?.()
      translator?.destroy?.()
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label="원문 언어" value={sourceLanguage} onChange={setSourceLanguage}>
          <option value="auto">자동 감지</option>
          {TRANSLATOR_LANGUAGES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="번역 언어" value={targetLanguage} onChange={setTargetLanguage}>
          {TRANSLATOR_LANGUAGES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </SelectField>
      </div>
      {detected ? <p className="text-xs text-muted-foreground">감지 결과: {detected}</p> : null}
      <DownloadBar progress={progress} />
      <ErrorText message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField label="번역할 텍스트" value={text} onChange={setText} rows={10} />
        <OutputBox value={result} empty="번역 결과가 여기 표시됩니다." />
      </div>
      <Button onClick={() => void run()} isLoading={busy} disabled={!text.trim()}>
        이 기기에서 번역
      </Button>
    </div>
  )
}
