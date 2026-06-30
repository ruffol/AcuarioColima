import { getResend } from '../resend'

interface SendOrderConfirmationParams {
  email: string
  nombre: string
  total: number
  moneda?: string
}

const FROM = process.env.EMAIL_FROM || 'AcuarioColima <onboarding@resend.dev>'

function orderConfirmationHtml({ nombre, total, moneda = 'MXN' }: SendOrderConfirmationParams): string {
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="color:#0F4C81;font-size:24px;margin-bottom:8px">¡Gracias por tu compra!</h1>
      <p style="color:#292524;font-size:16px;margin-bottom:24px">Hola ${nombre || 'Cliente'},</p>
      <p style="color:#57534e;font-size:14px;margin-bottom:24px">Tu pedido ha sido confirmado.</p>
      <p style="font-size:18px;font-weight:600;color:#292524;margin-bottom:8px">Total: $${total.toFixed(2)} ${moneda}</p>
      <p style="font-size:14px;color:#57534e">Te enviaremos un correo cuando tu pedido sea enviado.</p>
      <p style="font-size:14px;color:#0F4C81;font-style:italic;margin-top:24px">¡Gracias por confiar en AcuarioColima!</p>
    </div>
  `
}

export async function sendOrderConfirmation(params: SendOrderConfirmationParams) {
  if (!process.env.RESEND_API_KEY) return
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: '¡Gracias por tu compra! - AcuarioColima',
    html: orderConfirmationHtml(params),
  })
}
