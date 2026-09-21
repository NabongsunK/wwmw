# Chrome On-Device AI

Google Chrome Built-in AI(Gemini Nano)를 **서버 없이 브라우저에서만** 쓰는 단독 앱입니다.
WWMW(위무위)와는 별개 프로젝트이며, `npm run dev`로 따로 실행합니다.

## 실행

```bash
cd chrome-ai
npm install
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 을 엽니다. **데스크톱 Chrome**이 필요합니다.

## Chrome 설정

1. Chrome 138+ (Prompt API는 148+)
2. `chrome://flags/#optimization-guide-on-device-model` → Enabled
3. `chrome://flags/#prompt-api-for-gemini-nano` → Enabled 또는 Enabled multilingual
4. Chrome 재시작 후 앱에서 기능을 누르면 모델이 한 번 내려받아집니다.

작성·다듬기·교정은 추가 플래그 또는 Origin Trial이 필요할 수 있습니다.

## 기능

- 채팅 (Prompt API, 스트리밍, 이미지)
- 한국어 중계: 언어 감지 → 번역 → Gemini Nano → 한국어
- 요약 / 번역 / 작성·다듬기·교정

Prompt·요약·작성 계열의 공식 언어는 영어·일본어·스페인어·독일어·프랑스어입니다. 한국어는 번역 API 또는 채팅의 한국어 중계로 다룹니다.
