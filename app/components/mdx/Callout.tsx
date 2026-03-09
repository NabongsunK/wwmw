export function Callout({
  children,
  type = 'info',
}: {
  children: React.ReactNode
  type?: 'info' | 'warning' | 'tip'
}) {
  const styles = {
    info: 'bg-border border-blue-300',
    warning: 'bg-border border-yellow-300',
    tip: 'bg-border border-blue-300',
  }

  return <div className={`border-l-4 p-4 my-4 rounded ${styles[type]}`}>{children}</div>
}
