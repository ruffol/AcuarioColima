# -*- coding: utf-8 -*-
from fpdf import FPDF
import re

def clean(text):
    return re.sub(r'[\u2013\u2014\u2018\u2019\u201c\u201d\u2020\u2022\u2026\u2030]', '', str(text))

class PDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(180, 150, 130)
            self.cell(0, 8, 'Tlalchichi Store - Informe de Proyecto', align='R')
            self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(180, 150, 130)
        self.cell(0, 10, f'Pagina {self.page_no()}/{self.alias_nb_pages()}', align='C')

    def section_title(self, num, title):
        self.set_font('Helvetica', 'B', 16)
        self.set_text_color(44, 40, 35)
        self.cell(0, 12, f'{num}. {clean(title)}', new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 106, 78)
        self.set_line_width(0.5)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def sub_title(self, title):
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(44, 40, 35)
        self.cell(0, 8, clean(title), new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def body_text(self, txt):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(60, 55, 50)
        self.multi_cell(0, 5.5, clean(txt))
        self.ln(3)

    def bullet(self, txt):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(60, 55, 50)
        self.cell(6, 5.5, '-')
        self.multi_cell(0, 5.5, clean(txt))
        self.ln(1)

    def key_value(self, key, value):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(200, 106, 78)
        self.cell(50, 5.5, clean(key))
        self.set_font('Helvetica', '', 10)
        self.set_text_color(60, 55, 50)
        self.cell(0, 5.5, clean(value), new_x="LMARGIN", new_y="NEXT")
        self.ln(1)


pdf = PDF()
pdf.alias_nb_pages()
pdf.set_auto_page_break(auto=True, margin=20)
pdf.add_page()

# PORTADA
pdf.ln(30)
pdf.set_font('Helvetica', 'B', 36)
pdf.set_text_color(200, 106, 78)
pdf.cell(0, 15, 'Tlalchichi Store', align='C', new_x="LMARGIN", new_y="NEXT")
pdf.ln(5)
pdf.set_font('Helvetica', '', 18)
pdf.set_text_color(44, 40, 35)
pdf.cell(0, 10, 'Informe Completo del Proyecto', align='C', new_x="LMARGIN", new_y="NEXT")
pdf.ln(3)
pdf.set_font('Helvetica', 'I', 12)
pdf.set_text_color(120, 110, 100)
pdf.cell(0, 8, 'Arquitectura, tecnologias y modelo de negocio', align='C', new_x="LMARGIN", new_y="NEXT")
pdf.ln(30)
pdf.set_draw_color(200, 106, 78)
pdf.set_line_width(1)
pdf.line(60, pdf.get_y(), 150, pdf.get_y())
pdf.ln(15)
pdf.set_font('Helvetica', '', 10)
pdf.set_text_color(120, 110, 100)
pdf.cell(0, 6, 'Documento generado el 25 de junio de 2026', align='C', new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 6, 'Proyecto: Tlalchichi Store - Tienda en linea de artesanias mexicanas', align='C', new_x="LMARGIN", new_y="NEXT")

# INDICE
pdf.add_page()
pdf.set_font('Helvetica', 'B', 20)
pdf.set_text_color(44, 40, 35)
pdf.cell(0, 12, 'Indice', new_x="LMARGIN", new_y="NEXT")
pdf.ln(5)
for num, title in [
    ('1', 'Resumen Ejecutivo'), ('2', 'Arquitectura del Sistema'),
    ('3', 'Tecnologias Utilizadas'), ('4', 'Caracteristicas Principales'),
    ('5', 'Base de Datos'), ('6', 'Internacionalizacion'),
    ('7', 'Pagos y Transacciones'), ('8', 'Despliegue y Hosting'),
    ('9', 'SEO y Performance'), ('10', 'Modelo de Costos'),
    ('11', 'Personalizacion'), ('12', 'Roadmap y Proximos Pasos'),
]:
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(44, 40, 35)
    pdf.cell(10, 7, num)
    pdf.set_text_color(200, 106, 78)
    pdf.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")

# 1. RESUMEN
pdf.add_page()
pdf.section_title('1', 'Resumen Ejecutivo')
pdf.body_text(
    'Tlalchichi Store es una tienda en linea moderna y completa para la venta de figuras artesanales '
    'Tlalchichi (perros de barro de Colima, Mexico). El proyecto fue construido desde cero utilizando '
    'Next.js 16, la tecnologia de React mas avanzada para aplicaciones web. Esta disenado para ser '
    'rapido, seguro, escalable y facil de mantener.'
)
pdf.body_text(
    'La tienda incluye catalogo de productos con imagenes, carrito de compras, pagos con Stripe y PayPal, '
    'panel de administracion, soporte bilingue (espanol/ingles), modo oscuro, SEO optimizado y despliegue '
    'en Railway con Docker. El proyecto esta completamente funcional.'
)

# 2. ARQUITECTURA
pdf.add_page()
pdf.section_title('2', 'Arquitectura del Sistema')
pdf.sub_title('Diagrama de Arquitectura')
pdf.body_text('La aplicacion sigue una arquitectura moderna con server-side rendering (SSR):')
for i in [
    'Cliente (Browser) -> CDN (Cloudflare) -> Railway (Servidor Node.js) -> SQLite (Base de Datos)',
    'El contenido se renderiza en el servidor (SSR) y se entrega como HTML estatico.',
    'Las API routes (Next.js) manejan la logica de backend: pagos, webhooks, admin, SEO.',
    'El hosting es Railway con Docker y volumen persistente para la base de datos SQLite.',
]:
    pdf.bullet(i)

pdf.sub_title('Flujo de una compra')
for i in [
    '1. El usuario navega el catalogo (SSR)',
    '2. Agrega productos al carrito (Zustand + localStorage)',
    '3. Procede al checkout (formulario de envio)',
    '4. Paga con Stripe o PayPal',
    '5. Webhook confirma el pago y crea la orden en SQLite',
    '6. Se envia email de confirmacion (Resend)',
    '7. El administrador ve la orden en el panel de admin',
]:
    pdf.bullet(i)

# 3. TECNOLOGIAS
pdf.add_page()
pdf.section_title('3', 'Tecnologias Utilizadas')
for key, val in [
    ('Framework', 'Next.js 16.2.9 (App Router)'),
    ('Lenguaje', 'TypeScript 5'),
    ('UI', 'React 19 + Tailwind CSS 4'),
    ('Base de Datos', 'SQLite (better-sqlite3)'),
    ('Pagos', 'Stripe + PayPal'),
    ('Email', 'Resend + React Email'),
    ('Estado Cliente', 'Zustand 5 (persistencia localStorage)'),
    ('i18n', 'next-intl 4 (espanol/ingles)'),
    ('Hosting', 'Railway (Docker + volumen persistente)'),
    ('CDN', 'Cloudflare (SSL + proxy)'),
    ('Fuente', 'Inter (Google Fonts)'),
]:
    pdf.key_value(key, val)

pdf.ln(5)
pdf.sub_title('Dependencias Clave')
pdf.body_text(
    'El proyecto utiliza menos de 15 dependencias en produccion, lo que lo hace ligero y facil de mantener. '
    'No depende de servicios externos costosos. La base de datos es SQLite local, las imagenes se sirven '
    'desde el propio servidor y el hosting es de costo fijo mensual.'
)

# 4. CARACTERISTICAS
pdf.add_page()
pdf.section_title('4', 'Caracteristicas Principales')
for title, desc in [
    ('Catalogo de Productos', 'Galeria con imagenes, categorias, precios en MXN/USD, historias artesanales.'),
    ('Carrito de Compras', 'Drawer lateral con persistencia en localStorage, seleccion de pais de envio.'),
    ('Pagos Integrados', 'Stripe (tarjetas) y PayPal, dos procesadores confiables.'),
    ('Panel Admin', 'Gestion completa de productos y ordenes.'),
    ('Modo Oscuro', 'Toggle con persistencia en localStorage, diseno calido en ambos modos.'),
    ('Bilingue', 'Espanol e ingles con next-intl, URLs con prefijo de idioma.'),
    ('SEO', 'Sitemap, robots.txt, meta tags, Open Graph, titulos SEO por producto.'),
    ('Responsive', 'Diseno adaptable a movil, tablet y escritorio.'),
    ('WhatsApp', 'Boton flotante para consultas directas.'),
    ('Email transaccional', 'Confirmacion de compra via Resend al cliente.'),
]:
    pdf.sub_title(title)
    pdf.body_text(desc)

# 5. BASE DE DATOS
pdf.add_page()
pdf.section_title('5', 'Base de Datos')
pdf.body_text(
    'La base de datos es SQLite, un motor de base de datos embebido que no requiere servidor externo. '
    'Los datos se almacenan en un archivo .db dentro de un volumen persistente en Railway.'
)
pdf.sub_title('Tablas')
for name, desc in [
    ('products:', 'Almacena los productos: nombre, descripcion, precio, stock, imagenes, SEO.'),
    ('orders:', 'Ordenes de compra: email, direccion, moneda, total, proveedor de pago.'),
    ('order_items:', 'Detalle de cada producto en una orden.'),
    ('settings:', 'Configuraciones: costos de envio, WhatsApp, email, password admin.'),
]:
    pdf.key_value(name, desc)
pdf.ln(5)
pdf.body_text(
    'Ventaja: No necesitas contratar una base de datos externa. SQLite es perfecto para tiendas '
    'pequenas y medianas. Si el negocio crece, migrar a PostgreSQL es sencillo.'
)

# 6. INTERNACIONALIZACION
pdf.add_page()
pdf.section_title('6', 'Internacionalizacion')
pdf.body_text(
    'El sitio es completamente bilingue (espanol e ingles) usando next-intl.'
)
for b in [
    'URLs con prefijo: /es/... y /en/...',
    'Traducciones en archivos JSON separados',
    'Boton de cambio de idioma en el header',
    'Productos con nombre, descripcion e historia en ambos idiomas',
    'Precios en MXN (espanol) y USD (ingles)',
]:
    pdf.bullet(b)

# 7. PAGOS
pdf.add_page()
pdf.section_title('7', 'Pagos y Transacciones')
pdf.body_text('La tienda integra Stripe y PayPal.')
pdf.sub_title('Stripe')
pdf.body_text(
    'Acepta tarjetas de credito/debito (Visa, Mastercard, Amex). Usa Stripe Checkout. '
    'El webhook confirma el pago y actualiza el stock automaticamente.'
)
pdf.sub_title('PayPal')
pdf.body_text('Clientes pueden pagar con su cuenta de PayPal. Ideal para ventas internacionales.')
pdf.sub_title('Costos de envio')
pdf.body_text('Mexico: $100 MXN | Resto del mundo: $150 MXN ($8 USD)')

# 8. DESPLIEGUE
pdf.add_page()
pdf.section_title('8', 'Despliegue y Hosting')
pdf.body_text('El proyecto se despliega en Railway, una plataforma PaaS.')
for i in [
    'Docker: App empaquetada con Node.js 20',
    'Volumen persistente: SQLite en volumen que persiste entre deploys',
    'SSL: Railway genera certificados Let\'s Encrypt automaticamente',
    'Dominio personalizado: https://www.tlalchichi.xyz',
    'Deploy automatico: Cada push a GitHub dispara build y deploy',
    'Logs en tiempo real desde el dashboard de Railway',
]:
    pdf.bullet(i)

# 9. SEO
pdf.add_page()
pdf.section_title('9', 'SEO y Performance')
for s in [
    'Sitemap XML dinamico con todas las URLs del sitio',
    'robots.txt configurado para acceso total a crawlers',
    'Meta tags unicos por pagina',
    'Open Graph para redes sociales',
    'Titulos SEO personalizados por producto',
    'Nombres de archivo de imagenes con keywords',
    'Alt text en imagenes (espanol e ingles)',
    'URLs limpias y semanticas',
    'Server-side rendering para indexacion inmediata',
]:
    pdf.bullet(s)

# 10. COSTOS
pdf.add_page()
pdf.section_title('10', 'Modelo de Costos')
pdf.body_text('Proyecto economico sin multiples suscripciones:')

pdf.set_font('Helvetica', 'B', 10)
pdf.set_text_color(200, 106, 78)
pdf.cell(50, 6, 'Servicio')
pdf.cell(40, 6, 'Costo')
pdf.cell(0, 6, 'Detalle', new_x="LMARGIN", new_y="NEXT")
pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
pdf.ln(2)
for svc, cost, detail in [
    ('Railway Hobby', '$5 USD/mes', 'Hosting + base de datos'),
    ('Dominio Porkbun', '~$8 USD/anual', 'tlalchichi.xyz'),
    ('Cloudflare DNS', 'Gratis', 'CDN y SSL'),
    ('Stripe', '2.9% + $0.30', 'Solo cuando vendes'),
    ('PayPal', '2.99% + $0.49', 'Solo cuando vendes'),
    ('Resend Email', 'Gratis (100/dia)', 'Confirmaciones de compra'),
]:
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(60, 55, 50)
    pdf.cell(50, 6, svc)
    pdf.cell(40, 6, cost)
    pdf.cell(0, 6, detail, new_x="LMARGIN", new_y="NEXT")

pdf.ln(5)
pdf.sub_title('Total estimado: ~$5-8 USD/mes + comisiones por venta')
pdf.body_text(
    'No necesitas contratar Supabase, Vercel Pro, AWS ni ningun otro servicio. Todo incluido en Railway.'
)

# 11. PERSONALIZACION
pdf.add_page()
pdf.section_title('11', 'Personalizacion')
pdf.body_text('Posibilidades de personalizacion para tu proyecto:')
for c in [
    'Cambiar productos, precios, imagenes y categorias',
    'Modificar colores y estilo visual (CSS variables)',
    'Agregar o quitar idiomas',
    'Cambiar proveedor de pagos',
    'Agregar campos a productos (tamano, color, material)',
    'Conectar dominio propio',
    'Integrar envios con paqueteria (DHL, FedEx, Correos de Mexico)',
    'Agregar cupones de descuento',
    'Integrar Google Analytics o Meta Pixel',
]:
    pdf.bullet(c)

pdf.sub_title('Tiempo estimado')
pdf.body_text(
    'Tienda basica funcional: 1-2 semanas\n'
    'Con pagos y emails: 2-3 semanas\n'
    'Personalizacion visual completa: 3-4 semanas'
)

# 12. ROADMAP
pdf.add_page()
pdf.section_title('12', 'Roadmap y Proximos Pasos')
for period, items in [
    ('Corto plazo', [
        'Catalogo completo con fotos de productos',
        'Optimizacion de imagenes WebP/AVIF',
        'Google Analytics / Meta Pixel',
        'Politica de privacidad y terminos',
    ]),
    ('Mediano plazo', [
        'Notificaciones al admin por email',
        'Historial de ordenes para clientes',
        'Cupones de descuento',
        'Multiples variantes por producto',
        'Redes sociales',
    ]),
    ('Largo plazo', [
        'App movil (React Native)',
        'Marketplace multi-vendedor',
        'Inventario automatizado',
        'Analytics avanzados',
        'Sistema de resenas',
    ]),
]:
    pdf.sub_title(period)
    for item in items:
        pdf.bullet(item)

# FINAL
pdf.add_page()
pdf.ln(40)
pdf.set_font('Helvetica', 'B', 24)
pdf.set_text_color(200, 106, 78)
pdf.cell(0, 12, 'Gracias por tu interes', align='C', new_x="LMARGIN", new_y="NEXT")
pdf.ln(5)
pdf.set_font('Helvetica', '', 12)
pdf.set_text_color(44, 40, 35)
pdf.cell(0, 8, 'Tlalchichi Store esta listo para servir como base', align='C', new_x="LMARGIN", new_y="NEXT")
pdf.cell(0, 8, 'para tu propio proyecto de tienda en linea.', align='C', new_x="LMARGIN", new_y="NEXT")
pdf.ln(10)
pdf.set_font('Helvetica', 'I', 10)
pdf.set_text_color(120, 110, 100)
pdf.cell(0, 6, 'https://www.tlalchichi.xyz', align='C', new_x="LMARGIN", new_y="NEXT")

output_path = 'C:/Users/42/Desktop/Tlalchichi_Store_Informe.pdf'
pdf.output(output_path)
print(f'PDF creado: {output_path}')
