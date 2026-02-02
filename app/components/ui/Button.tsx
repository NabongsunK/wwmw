import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

const Button = ({
  variant = 'primary',
  isLoading,
  loadingText,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'px-6 py-2 rounded-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center'

  const variants = {
    primary: 'bg-foreground text-background hover:opacity-90',
    outline: 'border border-border text-foreground hover:bg-muted',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} cursor-pointer`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          {/*로딩 스피너 아이콘*/}
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
