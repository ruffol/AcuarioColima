import { redirect } from '@/i18n/routing'

export default function AdminRedirect() {
  redirect({ href: '/admin/acuario', locale: 'es' })
}
