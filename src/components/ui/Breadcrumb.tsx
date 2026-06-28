import { Link } from '@/i18n/routing'

interface Crumb {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-negro-suave/40 mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-terracota transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-negro-suave/60">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
