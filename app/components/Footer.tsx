export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background">
      <div className="container flex flex-col items-start justify-between gap-10 py-4 md:flex-row md:items-end">
        {/* 로고 & 카피라이트 */}
        <div className="space-y-3">
          <h2 className="font-soonbatang text-2xl font-bold text-foreground tracking-tight">
            위무위
          </h2>
          <p className="text-xs text-muted-foreground/80">
            © {currentYear} WWMW. All rights reserved.
          </p>
        </div>

        {/* 연락처 */}
        <div className="flex flex-col gap-8 sm:flex-row md:gap-16">
          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">
              Contact
            </h4>
            <a
              href="mailto:nabongsun142@gmail.com"
              className="block text-sm transition-colors hover:text-primary"
            >
              nabongsun142@gmail.com
            </a>
          </div>

          {/* GitHub  */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/50">
              Github
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://github.com/hgyeom"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
              >
                @hgyeom
              </a>
              <a
                href="https://github.com/NabongsunK"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-primary"
              >
                @NabongsunK
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
