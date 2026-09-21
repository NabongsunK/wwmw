import { useState } from 'react'

const FLAGS = [
  {
    flag: 'chrome://flags/#optimization-guide-on-device-model',
    value: 'Enabled',
    note: '온디바이스 모델 엔진',
  },
  {
    flag: 'chrome://flags/#prompt-api-for-gemini-nano',
    value: 'Enabled 또는 Enabled multilingual',
    note: 'Prompt API · Gemini Nano',
  },
  {
    flag: 'chrome://flags/#summarizer-api-for-gemini-nano',
    value: 'Enabled',
    note: '요약 API (버전에 따라 기본 활성)',
  },
  {
    flag: 'chrome://flags/#writer-api-for-gemini-nano',
    value: 'Enabled',
    note: '작성 · 다듬기 API',
  },
  {
    flag: 'chrome://flags/#proofreader-api',
    value: 'Enabled',
    note: '교정 API',
  },
]

export function SetupGuide() {
  const [open, setOpen] = useState(true)

  return (
    <section className="rounded-xl border border-border bg-surface/70">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium">Chrome에서 켜는 방법</span>
        <span className="text-xs text-muted-foreground">{open ? '접기' : '펼치기'}</span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <p className="break-keep">
            데스크톱 Chrome 148+ (Prompt API) / 138+ (번역·감지·요약)에서 동작합니다. 모델은 처음 한 번만
            내려받으며, 이후에는 이 기기에서만 실행됩니다.
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>데스크톱 Chrome을 최신 버전으로 업데이트합니다.</li>
            <li>아래 플래그를 켠 뒤 Chrome을 재시작합니다.</li>
            <li>
              <code className="rounded bg-muted px-1 py-0.5 text-xs">chrome://on-device-internals</code>
              에서 모델 상태를 확인합니다.
            </li>
            <li>이 앱에서 원하는 기능을 누르면 모델 다운로드가 시작됩니다.</li>
          </ol>
          <ul className="space-y-2">
            {FLAGS.map((item) => (
              <li key={item.flag} className="rounded-lg border border-border bg-background px-3 py-2">
                <p className="break-all font-mono text-xs text-foreground">{item.flag}</p>
                <p className="mt-1 text-xs">
                  {item.value} · {item.note}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs break-keep">
            Prompt / 요약 / 작성 API는 현재 영어·일본어·스페인어·독일어·프랑스어를 공식 지원합니다. 한국어는
            번역 API로 중계하거나, 번역 탭에서 직접 사용할 수 있습니다.
          </p>
        </div>
      ) : null}
    </section>
  )
}
