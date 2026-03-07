import { useMemo } from 'react'

export function useHighlight(keyword: string) {
  return useMemo(() => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const regex = new RegExp(`(${escaped})`, 'gi')

    const highlight = (text: string) => {
      if (!keyword || !text) return text

      const parts = text.split(regex)

      return parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300/60 dark:bg-yellow-400/40 rounded">
            {part}
          </mark>
        ) : (
          part
        ),
      )
    }

    return highlight
  }, [keyword])
}
