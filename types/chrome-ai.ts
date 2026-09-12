export type ChromeAiAvailability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available'

export type ChromeAiApiName =
  | 'LanguageModel'
  | 'Summarizer'
  | 'Translator'
  | 'LanguageDetector'
  | 'Writer'
  | 'Rewriter'
  | 'Proofreader'

export type ChromeAiApiStatus = {
  name: ChromeAiApiName
  label: string
  supported: boolean
  availability: ChromeAiAvailability | 'unsupported'
  detail?: string
}

export type DownloadProgressCallback = (loaded: number) => void

export type PromptLanguage = 'en' | 'es' | 'ja' | 'de' | 'fr'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  relay?: {
    detectedLanguage?: string
    englishPrompt?: string
    englishReply?: string
  }
}

export type LanguageDetection = {
  detectedLanguage: string
  confidence: number
}

export type ProofreadCorrection = {
  startIndex: number
  endIndex: number
  correction?: string
  type?: string
  explanation?: string
}

export type ProofreadResult = {
  correctedInput?: string
  correction?: string
  corrections?: ProofreadCorrection[]
}
