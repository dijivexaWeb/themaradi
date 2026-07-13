import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theeternalmemory.com'

const TOKEN_URL = 'https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token'
const ORDERS_URL = 'https://api.bog.ge/payments/v1/ecommerce/orders'
const RECEIPT_URL = (orderId: string) => `https://api.bog.ge/payments/v1/receipt/${orderId}`

// BOG'un callback imzalarını doğrulamak için kullandığı sabit public key
// (https://api.bog.ge/docs/en/payments/standard-process/callback) — hesaba özel değil.
const BOG_CALLBACK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQhzHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrrTYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhxtcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPnPwIDAQAB
-----END PUBLIC KEY-----`

export type BogSettings = {
  enabled: boolean
  clientId: string
  clientSecret: string
}

export async function getBogSettings(): Promise<BogSettings> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('key, value')
    .in('key', ['payment_gateway_provider', 'payment_gateway_api_key', 'payment_gateway_secret', 'payment_gateway_enabled'])

  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  return {
    enabled: map.payment_gateway_enabled === 'true' && map.payment_gateway_provider === 'bog_pay',
    clientId: map.payment_gateway_api_key ?? '',
    clientSecret: map.payment_gateway_secret ?? '',
  }
}

// Modül seviyesinde bellek-içi token cache — her istekte yeniden auth olmayı önler.
// Not: Vercel serverless'ta her instance kendi cache'ine sahip olur, bu normal ve zararsızdır.
let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 10_000) {
    return cachedToken.value
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`BOG auth başarısız: ${res.status} ${await res.text().catch(() => '')}`)
  }

  const json = await res.json() as { access_token: string; expires_in: number }
  // expires_in bazen saniye bazen epoch-ms olarak dönebiliyor (dokümantasyon tutarsız) —
  // saniye varsayımıyla, makul olmayan (çok büyük) değerlerde 5 dakikaya düşürüyoruz.
  const ttlMs = json.expires_in > 100_000 ? 5 * 60_000 : json.expires_in * 1000
  cachedToken = { value: json.access_token, expiresAt: Date.now() + ttlMs }
  return json.access_token
}

export type CreateBogOrderInput = {
  paymentId: string
  orderCode: string
  amount: number
  currency: 'GEL' | 'USD' | 'EUR' | 'GBP'
  description: string
  locale: 'ka' | 'en'
}

export type CreateBogOrderResult = {
  orderId: string
  redirectUrl: string
}

export async function createBogOrder(input: CreateBogOrderInput): Promise<CreateBogOrderResult> {
  const settings = await getBogSettings()
  if (!settings.enabled) throw new Error('BOG ödeme yöntemi aktif değil')

  const token = await getAccessToken(settings.clientId, settings.clientSecret)

  const res = await fetch(ORDERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Accept-Language': input.locale === 'ka' ? 'ka' : 'en',
    },
    body: JSON.stringify({
      callback_url: `${SITE_URL}/api/bog/callback`,
      // Sipariş kodunun ilk 25 karakteri banka ekstresinde görünür — mutabakat için ideal.
      external_order_id: input.orderCode.slice(0, 25),
      purchase_units: {
        currency: input.currency,
        total_amount: input.amount,
        basket: [
          {
            product_id: input.paymentId,
            quantity: 1,
            unit_price: input.amount,
            description: input.description,
          },
        ],
      },
      redirect_urls: {
        success: `${SITE_URL}/satin-al/odeme/${input.paymentId}?bog=success`,
        fail: `${SITE_URL}/satin-al/odeme/${input.paymentId}?bog=fail`,
      },
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`BOG sipariş oluşturma başarısız: ${res.status} ${await res.text().catch(() => '')}`)
  }

  const json = await res.json() as { id: string; _links: { redirect: { href: string } } }
  return { orderId: json.id, redirectUrl: json._links.redirect.href }
}

export async function getBogPaymentDetails(orderId: string): Promise<{ statusKey: string; raw: unknown }> {
  const settings = await getBogSettings()
  const token = await getAccessToken(settings.clientId, settings.clientSecret)

  const res = await fetch(RECEIPT_URL(orderId), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`BOG ödeme detayı alınamadı: ${res.status} ${await res.text().catch(() => '')}`)
  }
  const json = await res.json() as { order_status?: { key?: string } }
  return { statusKey: json.order_status?.key ?? 'unknown', raw: json }
}

// Callback body'sini JSON.parse ETMEDEN ÖNCE, ham (raw) string üzerinde doğrulanmalı.
export function verifyBogCallbackSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false
  try {
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(rawBody, 'utf8')
    verifier.end()
    return verifier.verify(BOG_CALLBACK_PUBLIC_KEY, signatureHeader, 'base64')
  } catch {
    return false
  }
}
