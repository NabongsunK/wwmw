# Wandering Tales MDX 작성 가이드

이 문서는 Wandering Tales 가이드를 작성할 때 사용하는 **MDX 문법 가이드**입니다.  
가이드는 **Markdown + React 컴포넌트(MDX)** 형식으로 작성됩니다.

---

# 1. 기본 구조

모든 가이드는 **Frontmatter + Markdown 내용** 구조로 작성합니다.

```md
---
title: 가이드 제목
region: 지역
subRegion: 하위지역
---

# 제목

본문 내용
```

### 지원 Frontmatter

| 필드      | 설명        |
| --------- | ----------- |
| title     | 가이드 제목 |
| region    | 지역        |
| subRegion | 하위지역    |

---

# 2. 기본 Markdown 문법

## 제목

```md
# H1

## H2

### H3
```

렌더링 시 자동으로 **Anchor 링크가 생성됩니다.**

예

```
## 데이터 표
```

→ `데이터 표 🔗`

---

## 강조

```md
**굵게**

_기울임_

~~취소선~~
```

---

# 3. 리스트

```md
- 항목1
- 항목2
- 항목3
```

또는

```md
1. 첫번째
2. 두번째
3. 세번째
```

---

# 4. 표 (GFM 지원)

```md
| 구분     | 값  | 비고 |
| -------- | --- | ---- |
| 능력치 A | 100 | 높음 |
| 능력치 B | 75  | 중간 |
| 능력치 C | 25  | 낮음 |
```

---

# 5. 이미지

이미지는 **GuideImage 컴포넌트**를 사용합니다.

```mdx
<GuideImage src="https://example.com/image.png" alt="이미지 설명" />
```

예

```mdx
<GuideImage src="https://cdn.example.com/image.png" alt="보스 위치" />
```

---

# 6. Callout (중요 안내 박스)

정보, 경고 등을 표시할 수 있습니다.

### Info

```mdx
<Callout type="info">이것은 정보 박스입니다.</Callout>
```

---

### Warning

```mdx
<Callout type="warning">주의가 필요한 내용입니다.</Callout>
```

---

### Tip

```mdx
<Callout type="tip">팁을 표시할 때 사용합니다.</Callout>
```

---

# 7. 커스텀 헤더

```mdx
<CustomHeader>특별한 섹션 제목</CustomHeader>
```

---

# 8. 코드 블록

코드 블록은 **syntax highlight**가 적용됩니다.

````md
```ts
const example = 'Hello World'
console.log(example)
```
````
