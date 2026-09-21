import type {
  ChromeAiApiName,
  ChromeAiApiStatus,
  ChromeAiAvailability,
  DownloadProgressCallback,
  LanguageDetection,
  PromptLanguage,
} from '../types.ts'

export const PROMPT_LANGUAGES: { code: PromptLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
]

export const TRANSLATOR_LANGUAGES: { code: string; label: string }[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'zh-Hant', label: '中文(繁體)' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'th', label: 'ไทย' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'it', label: 'Italiano' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
]

const API_LABELS: Record<ChromeAiApiName, string> = {
  LanguageModel: 'Prompt',
  Summarizer: '요약',
  Translator: '번역',
  LanguageDetector: '언어 감지',
  Writer: '작성',
  Rewriter: '다듬기',
  Proofreader: '교정',
}

type AvailabilityFn = (options?: unknown) => Promise<ChromeAiAvailability>

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

export function getChromeAiApi(name: ChromeAiApiName): Record<string, unknown> | undefined {
  if (typeof globalThis === 'undefined') return undefined
  const value = asRecord((globalThis as Record<string, unknown>)[name])
  return value ?? undefined
}

export async function readAvailability(
  name: ChromeAiApiName,
  options?: unknown,
): Promise<ChromeAiApiStatus> {
  const api = getChromeAiApi(name)
  if (!api || typeof api.availability !== 'function') {
    return {
      name,
      label: API_LABELS[name],
      supported: false,
      availability: 'unsupported',
      detail: '이 브라우저에 API가 없습니다.',
    }
  }

  try {
    const availability = (await (api.availability as AvailabilityFn)(options)) ?? 'unavailable'
    return {
      name,
      label: API_LABELS[name],
      supported: true,
      availability,
    }
  } catch (error) {
    return {
      name,
      label: API_LABELS[name],
      supported: true,
      availability: 'unavailable',
      detail: toErrorMessage(error),
    }
  }
}

export async function readAllChromeAiStatuses(): Promise<ChromeAiApiStatus[]> {
  const promptOptions = {
    expectedInputs: [{ type: 'text', languages: ['en'] }],
    expectedOutputs: [{ type: 'text', languages: ['en'] }],
  }

  return Promise.all([
    readAvailability('LanguageModel', promptOptions),
    readAvailability('Summarizer'),
    readAvailability('Translator', { sourceLanguage: 'en', targetLanguage: 'ko' }),
    readAvailability('LanguageDetector'),
    readAvailability('Writer'),
    readAvailability('Rewriter'),
    readAvailability('Proofreader'),
  ])
}

export function mergeStreamChunk(previous: string, chunk: string): string {
  if (!chunk) return previous
  if (!previous) return chunk
  if (chunk.startsWith(previous)) return chunk
  if (previous.startsWith(chunk) && chunk.length < previous.length) return previous
  return previous + chunk
}

async function* iterateTextStream(
  stream: ReadableStream<string> | AsyncIterable<string>,
): AsyncGenerator<string> {
  if (Symbol.asyncIterator in Object(stream)) {
    for await (const chunk of stream as AsyncIterable<string>) {
      if (typeof chunk === 'string') yield chunk
    }
    return
  }

  const reader = (stream as ReadableStream<string>).getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (typeof value === 'string') yield value
    }
  } finally {
    reader.releaseLock()
  }
}

export async function consumeTextStream(
  stream: ReadableStream<string> | AsyncIterable<string>,
  onUpdate: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  let text = ''
  for await (const chunk of iterateTextStream(stream)) {
    if (signal?.aborted) break
    text = mergeStreamChunk(text, chunk)
    onUpdate(text)
  }
  return text
}

export function createDownloadMonitor(onProgress?: DownloadProgressCallback) {
  return (monitor: EventTarget) => {
    monitor.addEventListener('downloadprogress', (event) => {
      const progress = event as Event & { loaded?: number }
      if (typeof progress.loaded === 'number') onProgress?.(progress.loaded)
    })
  }
}

export async function createChromeAiSession<T>(
  name: ChromeAiApiName,
  options: Record<string, unknown> = {},
  onProgress?: DownloadProgressCallback,
): Promise<T> {
  const api = getChromeAiApi(name)
  if (!api || typeof api.create !== 'function') {
    throw new Error(`${API_LABELS[name]} API를 이 브라우저에서 사용할 수 없습니다.`)
  }

  return (await (api.create as (opts: Record<string, unknown>) => Promise<T>)({
    ...options,
    monitor: createDownloadMonitor(onProgress),
  })) as T
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return '요청이 취소되었습니다.'
  }
  if (error instanceof Error && error.message) return error.message
  return '온디바이스 AI 요청을 처리하지 못했습니다.'
}

export function availabilityLabel(status: ChromeAiApiStatus): string {
  switch (status.availability) {
    case 'available':
      return '준비됨'
    case 'downloadable':
      return '다운로드 필요'
    case 'downloading':
      return '다운로드 중'
    case 'unavailable':
      return '사용 불가'
    default:
      return '미지원'
  }
}

export function languageLabel(code: string): string {
  return TRANSLATOR_LANGUAGES.find((item) => item.code === code)?.label ?? code
}

export function pickDetectedLanguage(
  results: LanguageDetection[] | undefined,
): LanguageDetection | null {
  if (!results?.length) return null
  const first = results.find((item) => item.detectedLanguage && item.detectedLanguage !== 'und')
  return first ?? null
}

export const LANGUAGE_MODEL_SYSTEM_PROMPT =
  'You are a concise, helpful on-device assistant running locally in Google Chrome. Prefer short, clear answers.'
