import { getTranslations } from 'next-intl/server'
import { getProducts } from '@/lib/repositories/products'
import Hero from '@/components/layout/Hero'

interface Props {
  params: Promise<{ locale: string }>
}

const benefits = [
  { icon: '🐠', title: 'Peces saludables', desc: 'Cuarentena y aclimatación profesional antes de la venta.' },
  { icon: '🚚', title: 'Envíos seguros', desc: 'Empaque térmico especial para peces y plantas.' },
  { icon: '🛡️', title: 'Garantía', desc: 'Satisfacción garantizada o te reembolsamos.' },
  { icon: '💬', title: 'Asesoría gratuita', desc: 'Expertos acuaristas listos para ayudarte.' },
]

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  const heroProducts = getProducts({ activo: true, limit: 4 })

  return (
    <>
      <Hero locale={locale} products={heroProducts} />

      {/* Why choose us */}
      <section className="bg-[#071221] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#10B981] uppercase tracking-widest mb-3">Por qué nosotros</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-heading)] tracking-tight">
              ¿Por qué comprar con nosotros?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-[#4FC3F7]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-2xl block mb-4 group-hover:scale-110 transition-transform duration-300">{b.icon}</span>
                <h3 className="text-white font-semibold mb-2 font-[family-name:var(--font-heading)]">{b.title}</h3>
                <p className="text-sm text-blue-200/40 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-[#071221] py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 font-[family-name:var(--font-heading)] tracking-tight">
            {t('historia_titulo')}
          </h2>
          <p className="text-blue-200/50 leading-relaxed text-sm">
            {t('historia_texto')}
          </p>
        </div>
      </section>
    </>
  )
}
