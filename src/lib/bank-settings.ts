import { createServiceClient } from '@/lib/supabase/server'

export interface BankSettings {
  iban: string
  bankName: string
  recipient: string
  paypalLink: string
}

const DEFAULTS: BankSettings = {
  iban: 'GE29TB7522145061700002',
  bankName: 'TBC Bank',
  recipient: 'The Eternal Memory LLC',
  paypalLink: '',
}

export async function getBankSettings(): Promise<BankSettings> {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', ['bank_iban', 'bank_name', 'bank_recipient', 'paypal_link'])

    if (!data?.length) return DEFAULTS

    const map = Object.fromEntries(data.map((r) => [r.key, r.value]))
    return {
      iban: map.bank_iban || DEFAULTS.iban,
      bankName: map.bank_name || DEFAULTS.bankName,
      recipient: map.bank_recipient || DEFAULTS.recipient,
      paypalLink: map.paypal_link || '',
    }
  } catch {
    return DEFAULTS
  }
}
