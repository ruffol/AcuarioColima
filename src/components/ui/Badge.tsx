interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'terracota' | 'outline'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-arena text-negro-suave',
    terracota: 'bg-terracota text-white',
    outline: 'border border-terracota text-terracota',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
