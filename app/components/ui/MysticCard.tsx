'use client'

import Image from 'next/image'
import { type MysticCard } from '@/lib/mystic-gacha'

type CardProps = {
  card: MysticCard
  count?: number
  removeCard?: () => void // 카드 제거 핸들러
  isTracked?: boolean // 추적 여부 (보관)
  onSave?: () => void // 저장 버튼 클릭 핸들러
  getRarityColorClass: (rarity: MysticCard['등급']) => string
}

export default function MysticCard({
  card,
  count,
  removeCard,
  isTracked,
  onSave,
  getRarityColorClass,
}: CardProps) {
  return (
    <div
      className={`group relative border rounded-lg p-3 ${getRarityColorClass(
        card.등급,
      )} flex items-center gap-4 transition-colors hover:bg-muted/40 text-black hover:text-foreground cursor-pointer ${
        isTracked ? 'opacity-75' : ''
      }`}
    >
      {/* 아이콘 */}
      {card.심법_img && (
        <div className="relative w-12 h-12 rounded overflow-hidden bg-black flex-shrink-0">
          <Image
            src={card.심법_img}
            alt={card.title}
            fill
            className="object-contain text-white text-sm"
          />
        </div>
      )}

      {/* 텍스트 */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="font-medium truncate">{card.title}</div>

        {card.유파_img && (
          <div className="flex items-center">
            <div className="relative w-8 h-8">
              <Image
                src={card.유파_img}
                alt={card.유파 || card.title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* 수량 */}
      {count && <div className="text-base font-semibold flex-shrink-0 tabular-nums">×{count}</div>}

      {onSave &&
        (isTracked ? (
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground"
            title="보관함에 저장됨"
          >
            🔒
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSave()
            }}
            className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition"
            title="보관함으로 이동"
          >
            ➕
          </button>
        ))}

      {/* 카드 제거 버튼 */}
      {removeCard && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            removeCard()
          }}
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition"
          title={`${card.title} 전체 제거`}
        >
          ✕
        </button>
      )}
    </div>
  )
}
