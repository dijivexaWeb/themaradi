const BASE_URL =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

export async function getAccessToken(): Promise<string> {
  const clientId =
    process.env.PAYPAL_MODE === 'live'
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE!
      : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
  const clientSecret =
    process.env.PAYPAL_MODE === 'live'
      ? process.env.PAYPAL_CLIENT_SECRET_LIVE!
      : process.env.PAYPAL_CLIENT_SECRET!
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

export async function createOrder(amountValue: string, currency: string, description: string) {
  const token = await getAccessToken()
  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: currency, value: amountValue },
          description,
        },
      ],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal createOrder failed: ${err}`)
  }
  return res.json() as Promise<{ id: string; status: string }>
}

export async function captureOrder(orderId: string) {
  const token = await getAccessToken()
  const res = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal captureOrder failed: ${err}`)
  }
  return res.json() as Promise<{ id: string; status: string; purchase_units: unknown[] }>
}

export function getPublicClientId(): string {
  return (process.env.PAYPAL_MODE === 'live'
    ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE
    : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) ?? ''
}
