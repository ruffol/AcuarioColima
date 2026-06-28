declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
    STRIPE_SECRET_KEY: string
    STRIPE_WEBHOOK_SECRET: string
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: string
    PAYPAL_CLIENT_SECRET: string
    PAYPAL_WEBHOOK_ID: string
    RESEND_API_KEY: string
    EMAIL_FROM: string
    NEXT_PUBLIC_BASE_URL: string
    NEXT_PUBLIC_WHATSAPP_NUMBER: string
  }
}
