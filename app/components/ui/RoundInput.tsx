import { InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  width?: string
  height?: string
  leftIcon?: ReactNode
}

export default function RoundInput({ width, height, leftIcon, className = '', ...props }: Props) {
  return (
    <div className={`relative `}>
      <div className="absolute left-3 inset-y-0 flex items-center text-muted-foreground">
        {leftIcon}
      </div>

      <input
        {...props}
        className={`${width || 'w-full'} ${height || ''} px-4 py-2 border border-border rounded-md 
        focus:ring-1 focus:ring-accent focus:outline-none bg-background text-foreground 
        ${leftIcon ? 'pl-10' : ''} ${className}`}
      />
    </div>
  )
}
