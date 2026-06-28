interface CardProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'article' | 'section'
  href?: string
}

export default function Card({
  children,
  className = '',
  as: Tag = 'div',
  ...props
}: CardProps & Record<string, any>) {
  return (
    <Tag
      className={`bg-card rounded-2xl border border-arena overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-arena/50 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
