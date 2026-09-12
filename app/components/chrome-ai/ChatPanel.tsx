'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/app/components/ui/Button'
import {
  LANGUAGE_MODEL_SYSTEM_PROMPT,
  PROMPT_LANGUAGES,
  consumeTextStream,
  createChromeAiSession,
  languageLabel,
  pickDetectedLanguage,
  toErrorMessage,
} from '@/lib/chrome-ai'
import type { ChatMessage, LanguageDetection, PromptLanguage } from '@/types/chrome-ai'
import { DownloadBar, ErrorText, FieldLabel, SelectField } from './ui'

type LanguageModelSession = {
  prompt: (input: unknown, options?: { signal?: AbortSignal }) => Promise<string>
  promptStreaming?: (
    input: unknown,
    options?: { signal?: AbortSignal },
  ) => ReadableStream<string> | AsyncIterable<string>
  destroy?: () => void
  contextUsage?: number
  contextWindow?: number
  inputUsage?: number
  inputQuota?: number
}

type TranslatorSession = {
  translate: (text: string) => Promise<string>
  destroy?: () => void
}

type DetectorSession = {
  detect: (text: string) => Promise<LanguageDetection[]>
  destroy?: () => void
}

type PromptContent =
  | string
  | {
      role: 'user'
      content: Array<{ type: 'text'; value: string } | { type: 'image'; value: Blob }>
    }[]

async function runPrompt(
  session: LanguageModelSession,
  input: PromptContent,
  onUpdate: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (session.promptStreaming) {
    return consumeTextStream(session.promptStreaming(input, { signal }), onUpdate, signal)
  }
  const result = await session.prompt(input, { signal })
  onUpdate(result)
  return result
}

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ChatPanel() {
  const [language, setLanguage] = useState<PromptLanguage>('en')
  const [koreanRelay, setKoreanRelay] = useState(true)
  const [input, setInput] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<string | null>(null)
  const sessionRef = useRef<LanguageModelSession | null>(null)
  const translatorsRef = useRef<Map<string, TranslatorSession>>(new Map())
  const detectorRef = useRef<DetectorSession | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const imageUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  useEffect(() => {
    const translators = translatorsRef.current
    return () => {
      abortRef.current?.abort()
      sessionRef.current?.destroy?.()
      detectorRef.current?.destroy?.()
      translators.forEach((session) => session.destroy?.())
    }
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy])

  const updateQuota = (session: LanguageModelSession) => {
    const used = session.contextUsage ?? session.inputUsage
    const total = session.contextWindow ?? session.inputQuota
    if (typeof used === 'number' && typeof total === 'number' && total > 0) {
      setQuota(`${used.toLocaleString()} / ${total.toLocaleString()} 토큰`)
    }
  }

  const ensureSession = async () => {
    if (sessionRef.current) return sessionRef.current
    const createSession = (withImage: boolean) =>
      createChromeAiSession<LanguageModelSession>(
        'LanguageModel',
        {
          initialPrompts: [{ role: 'system', content: LANGUAGE_MODEL_SYSTEM_PROMPT }],
          expectedInputs: [
            { type: 'text', languages: language === 'en' ? ['en'] : ['en', language] },
            ...(withImage ? [{ type: 'image' }] : []),
          ],
          expectedOutputs: [{ type: 'text', languages: [language] }],
        },
        setProgress,
      )

    try {
      sessionRef.current = await createSession(true)
    } catch {
      if (image) throw new Error('이 브라우저의 Prompt API가 이미지 입력을 지원하지 않습니다.')
      sessionRef.current = await createSession(false)
    }
    updateQuota(sessionRef.current)
    setProgress(null)
    return sessionRef.current
  }

  const ensureTranslator = async (sourceLanguage: string, targetLanguage: string) => {
    const key = `${sourceLanguage}:${targetLanguage}`
    const cached = translatorsRef.current.get(key)
    if (cached) return cached
    const translator = await createChromeAiSession<TranslatorSession>(
      'Translator',
      { sourceLanguage, targetLanguage },
      setProgress,
    )
    translatorsRef.current.set(key, translator)
    setProgress(null)
    return translator
  }

  const ensureDetector = async () => {
    if (detectorRef.current) return detectorRef.current
    const detector = await createChromeAiSession<DetectorSession>('LanguageDetector', {}, setProgress)
    detectorRef.current = detector
    setProgress(null)
    return detector
  }

  const resetSession = () => {
    abortRef.current?.abort()
    sessionRef.current?.destroy?.()
    sessionRef.current = null
    setMessages([])
    setQuota(null)
    setError(null)
  }

  const send = async () => {
    const text = input.trim()
    if ((!text && !image) || busy) return

    setBusy(true)
    setError(null)
    setInput('')
    const userMessage: ChatMessage = { id: nextId(), role: 'user', content: text || '(이미지)' }
    const assistantId = nextId()
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: '' },
    ])

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      let promptText = text || 'Describe this image.'
      const relay: ChatMessage['relay'] = {}

      if (koreanRelay && text) {
        const detector = await ensureDetector()
        const detected = pickDetectedLanguage(await detector.detect(text))
        if (detected) {
          relay.detectedLanguage = detected.detectedLanguage
          if (detected.detectedLanguage !== language) {
            const toPrompt = await ensureTranslator(detected.detectedLanguage, language)
            promptText = await toPrompt.translate(text)
            relay.englishPrompt = promptText
          }
        }
      }

      const session = await ensureSession()
      const promptInput: PromptContent = image
        ? [
            {
              role: 'user',
              content: [
                { type: 'text', value: promptText },
                { type: 'image', value: image },
              ],
            },
          ]
        : promptText

      let reply = await runPrompt(
        session,
        promptInput,
        (chunk) => {
          setMessages((prev) =>
            prev.map((item) => (item.id === assistantId ? { ...item, content: chunk, relay } : item)),
          )
        },
        controller.signal,
      )

      if (koreanRelay && reply) {
        relay.englishReply = reply
        const toKorean = await ensureTranslator(language, 'ko')
        reply = await toKorean.translate(reply)
      }

      setMessages((prev) =>
        prev.map((item) => (item.id === assistantId ? { ...item, content: reply, relay } : item)),
      )
      updateQuota(session)
      setImage(null)
    } catch (err) {
      setError(toErrorMessage(err))
      setMessages((prev) =>
        prev.map((item) =>
          item.id === assistantId && !item.content
            ? { ...item, content: '응답을 만들지 못했습니다.' }
            : item,
        ),
      )
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <SelectField
          label="Gemini Nano 대화 언어"
          value={language}
          onChange={(value) => {
            setLanguage(value as PromptLanguage)
            resetSession()
          }}
        >
          {PROMPT_LANGUAGES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </SelectField>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={koreanRelay}
            onChange={(event) => setKoreanRelay(event.target.checked)}
          />
          한국어 중계 (감지 → 번역 → Nano → 한국어)
        </label>
      </div>

      <DownloadBar progress={progress} />
      <ErrorText message={error} />

      <div
        ref={listRef}
        className="h-[28rem] overflow-y-auto rounded-lg border border-border bg-surface/40 p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            서버로 보내지 않습니다. Chrome에 내려받은 Gemini Nano가 이 기기에서 답합니다.
            {koreanRelay
              ? ' 한국어 중계를 켜면 입력을 감지·번역한 뒤 Nano에 넘기고, 답을 다시 한국어로 돌립니다.'
              : null}
          </p>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'ml-auto bg-foreground text-background'
                  : 'bg-background border border-border'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content || (busy ? '...' : '')}</p>
              {message.relay?.detectedLanguage ? (
                <p className="mt-2 text-[11px] opacity-70">
                  감지 {languageLabel(message.relay.detectedLanguage)}
                  {message.relay.englishPrompt ? ` → ${language}` : ''}
                </p>
              ) : null}
            </article>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{quota ?? '세션 토큰 사용량은 대화 시작 후 표시됩니다.'}</span>
        <button type="button" className="underline-offset-2 hover:underline" onClick={resetSession}>
          대화 초기화
        </button>
      </div>

      {imageUrl ? (
        <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="첨부 이미지" className="h-14 w-14 rounded object-cover" />
          <button type="button" className="text-sm text-muted-foreground" onClick={() => setImage(null)}>
            이미지 제거
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <FieldLabel>메시지</FieldLabel>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
            }}
            rows={3}
            placeholder="Shift+Enter로 줄바꿈"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex flex-col justify-end gap-2">
          <label className="cursor-pointer rounded-md border border-border px-4 py-2 text-center text-sm hover:bg-muted">
            이미지
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setImage(event.target.files?.[0] ?? null)}
            />
          </label>
          <Button onClick={() => void send()} isLoading={busy} disabled={!input.trim() && !image}>
            보내기
          </Button>
        </div>
      </div>
    </div>
  )
}
