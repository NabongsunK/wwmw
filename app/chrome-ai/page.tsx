import type { Metadata } from 'next'
import { ChromeAiStudio } from '@/app/components/chrome-ai/ChromeAiStudio'

export const metadata: Metadata = {
  title: '온디바이스 AI - WWMW',
  description: 'Chrome Built-in AI(Gemini Nano)로 이 기기에서만 채팅, 요약, 번역, 작성을 실행합니다.',
}

export default function ChromeAiPage() {
  return <ChromeAiStudio />
}
