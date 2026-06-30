interface Props {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">{icon}</div>}
      <p className="text-foreground font-medium mb-1">{title}</p>
      {description && <p className="text-sm text-muted mb-6">{description}</p>}
      {action}
    </div>
  )
}
