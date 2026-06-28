'use client'

import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracota/50 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-terracota text-white hover:bg-terracota-dark active:bg-terracota-dark',
      secondary: 'bg-arena text-negro-suave hover:bg-arena/80',
      outline: 'border-2 border-terracota text-terracota hover:bg-terracota hover:text-white',
      ghost: 'text-negro-suave hover:bg-arena',
    }

    const sizes = {
      sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-base px-5 py-2.5 rounded-xl gap-2',
      lg: 'text-lg px-7 py-3.5 rounded-xl gap-2',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
