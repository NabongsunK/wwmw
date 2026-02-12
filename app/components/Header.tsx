import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold text-xl">WWE</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/"
            >
              Home
            </Link>
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/builds"
            >
              Builds
            </Link>
            <Link
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              href="/simulator/mystic"
            >
              심법 뽑기
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
