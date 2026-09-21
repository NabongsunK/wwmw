import { useState } from 'react'
import { Button } from './Button.tsx'
import { consumeTextStream, createChromeAiSession, toErrorMessage } from '../lib/chrome-ai.ts'
import type { ProofreadCorrection, ProofreadResult } from '../types.ts'
import { DownloadBar, ErrorText, FieldLabel, OutputBox, SelectField, TextAreaField } from './ui.tsx'

type WriterSession = {
  write: (prompt: string, options?: { context?: string; signal?: AbortSignal }) => Promise<string>
  writeStreaming?: (
    prompt: string,
    options?: { context?: string; signal?: AbortSignal },
  ) => ReadableStream<string> | AsyncIterable<string>
  destroy?: () => void
}

type RewriterSession = {
  rewrite: (text: string, options?: { context?: string; signal?: AbortSignal }) => Promise<string>
  rewriteStreaming?: (
    text: string,
    options?: { context?: string; signal?: AbortSignal },
  ) => ReadableStream<string> | AsyncIterable<string>
  destroy?: () => void
}

type ProofreaderSession = {
  proofread: (text: string) => Promise<ProofreadResult>
  destroy?: () => void
}

const MODES = [
  { id: 'write', label: '작성' },
  { id: 'rewrite', label: '다듬기' },
  { id: 'proofread', label: '교정' },
] as const

type Mode = (typeof MODES)[number]['id']

export function WriteAssistPanel() {
  const [mode, setMode] = useState<Mode>('write')
  const [input, setInput] = useState(
    'A short welcome note for a playground that runs Chrome Built-in AI entirely on-device.',
  )
  const [tone, setTone] = useState('neutral')
  const [length, setLength] = useState('short')
  const [result, setResult] = useState('')
  const [corrections, setCorrections] = useState<ProofreadCorrection[]>([])
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!input.trim() || busy) return
    setBusy(true)
    setError(null)
    setResult('')
    setCorrections([])
    try {
      if (mode === 'write') {
        const writer = await createChromeAiSession<WriterSession>(
          'Writer',
          {
            tone,
            format: 'plain-text',
            length,
            outputLanguage: 'en',
            expectedInputLanguages: ['en'],
          },
          setProgress,
        )
        try {
          if (writer.writeStreaming) await consumeTextStream(writer.writeStreaming(input), setResult)
          else setResult(await writer.write(input))
        } finally {
          writer.destroy?.()
        }
        return
      }

      if (mode === 'rewrite') {
        const rewriter = await createChromeAiSession<RewriterSession>(
          'Rewriter',
          {
            tone: tone === 'casual' ? 'more-casual' : tone === 'formal' ? 'more-formal' : 'as-is',
            format: 'plain-text',
            length: length === 'short' ? 'shorter' : length === 'long' ? 'longer' : 'as-is',
            outputLanguage: 'en',
            expectedInputLanguages: ['en'],
          },
          setProgress,
        )
        try {
          if (rewriter.rewriteStreaming) {
            await consumeTextStream(rewriter.rewriteStreaming(input), setResult)
          } else {
            setResult(await rewriter.rewrite(input))
          }
        } finally {
          rewriter.destroy?.()
        }
        return
      }

      const proofreader = await createChromeAiSession<ProofreaderSession>(
        'Proofreader',
        { expectedInputLanguages: ['en'] },
        setProgress,
      )
      try {
        const proof = await proofreader.proofread(input)
        setResult(proof.correctedInput ?? proof.correction ?? '')
        setCorrections(proof.corrections ?? [])
      } finally {
        proofreader.destroy?.()
      }
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id)
              setResult('')
              setCorrections([])
              setError(null)
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              mode === item.id
                ? 'border-accent bg-accent text-white'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode !== 'proofread' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField label="톤" value={tone} onChange={setTone}>
            <option value="casual">캐주얼</option>
            <option value="neutral">중립</option>
            <option value="formal">격식</option>
          </SelectField>
          <SelectField label="길이" value={length} onChange={setLength}>
            <option value="short">짧게</option>
            <option value="medium">보통</option>
            <option value="long">길게</option>
          </SelectField>
        </div>
      ) : null}

      <DownloadBar progress={progress} />
      <ErrorText message={error} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextAreaField
          label={mode === 'write' ? '작성할 내용' : mode === 'rewrite' ? '다듬을 문장' : '교정할 문장'}
          value={input}
          onChange={setInput}
          rows={10}
        />
        <div className="space-y-3">
          <OutputBox value={result} />
          {corrections.length > 0 ? (
            <div>
              <FieldLabel>교정 위치</FieldLabel>
              <ul className="space-y-1 text-sm">
                {corrections.map((item, index) => (
                  <li key={`${item.startIndex}-${item.endIndex}-${index}`} className="text-muted-foreground">
                    {item.startIndex}–{item.endIndex}
                    {item.correction ? ` → ${item.correction}` : ''}
                    {item.type ? ` (${item.type})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
      <Button onClick={() => void run()} isLoading={busy} disabled={!input.trim()}>
        {mode === 'write' ? '작성' : mode === 'rewrite' ? '다듬기' : '교정'} 실행
      </Button>
      <p className="text-xs text-muted-foreground break-keep">
        작성·다듬기·교정 API는 Chrome 플래그 또는 Origin Trial이 켜져 있어야 합니다. 공식 지원 언어는 영어 등
        Prompt 계열과 같습니다.
      </p>
    </div>
  )
}
