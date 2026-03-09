import Image from 'next/image'

export function GuideImage({ src, alt }: { src: string; alt?: string }) {
  return (
    <>
      <Image
        src={src}
        alt={alt ?? ''}
        width={1200}
        height={800}
        className="rounded-xl border shadow-sm w-full h-auto"
      />
      {alt && <p className="text-sm text-muted-foreground text-center mt-2">{alt}</p>}
    </>
  )
}
