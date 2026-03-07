export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-10 text-sm text-muted-foreground flex flex-col gap-4 md:flex-row md:justify-between">
        <p>연운 · 빌드</p>
        <p>{process.env.MY_EMAIL}</p>
        <p>© {new Date().getFullYear()} WWMW</p>
      </div>
    </footer>
  )
}
