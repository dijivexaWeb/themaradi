import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import StatusBadge from '../../_components/StatusBadge'
import PaymentStatusForm from '../_PaymentStatusForm'
import WhatsAppButton from '../_WhatsAppButton'
import AdminNotesForm from './_AdminNotesForm'

const PROFILE_FOR_LABELS: Record<string, string> = {
  baba: 'Babası için', anne: 'Annesi için', es: 'Eşi için',
  kardes: 'Kardeşi için', yakin: 'Yakını için', diger: 'Diğer',
}

const PRODUCT_LABELS: Record<string, string> = {
  memorial_one_time: 'Anma Profili',
  vault_setup: 'Yaşam Kasası',
  vault_monthly: 'Yaşam Kasası (Aylık)',
  family_package: 'Aile Paketi',
}

interface Props {
  params: Promise<{ paymentId: string }>
}

export default async function PaymentDetailPage({ params }: Props) {
  await requireAdmin()
  const { paymentId } = await params
  const supabase = await createServiceClient()

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle()

  if (!payment) notFound()

  const [{ data: profile }, { data: consent }, { data: vault }, { data: family }] = await Promise.all([
    supabase.from('profiles').select('full_name, email, phone, locale').eq('id', payment.user_id).maybeSingle(),
    supabase
      .from('user_consents')
      .select('privacy_notice_ack, data_processing_consent, marketing_permission, consent_language, consent_ip, user_agent, accepted_at, consent_version, created_at')
      .eq('user_id', payment.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    payment.vault_id
      ? supabase.from('vaults').select('id, display_name, status, slug, birth_date, death_date, cover_photo_url, shipping_address, shipping_status').eq('id', payment.vault_id).maybeSingle()
      : Promise.resolve({ data: null }),
    payment.family_id
      ? supabase.from('memorial_families').select('id, name, slug, is_public').eq('id', payment.family_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const productLabel = PRODUCT_LABELS[payment.product_type] ?? payment.product_type

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium text-right">{value ?? '—'}</span>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/admin/kasa" className="text-xs text-slate-500 hover:text-slate-800 mb-4 inline-block">
        ← Kasa / Ödemeler listesine dön
      </Link>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-mono">{payment.order_code}</h1>
          <p className="text-slate-500 text-sm mt-1">{productLabel} — {Number(payment.amount).toFixed(2)} {payment.currency}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={payment.status} />
          <PaymentStatusForm paymentId={payment.id} currentStatus={payment.status} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Kullanıcı bilgileri */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Kullanıcı Bilgileri</h2>
          {row('Ad Soyad', profile?.full_name)}
          {row('E-posta', profile?.email)}
          {row('Telefon', profile?.phone)}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <WhatsAppButton phone={profile?.phone ?? null} orderCode={payment.order_code} locale={payment.order_locale} />
          </div>
        </div>

        {/* Sipariş bilgileri */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Sipariş Bilgileri</h2>
          {row('Sipariş Kodu', <span className="font-mono">{payment.order_code}</span>)}
          {row('Ürün', productLabel)}
          {row('Tutar', `${Number(payment.amount).toFixed(2)} ${payment.currency}`)}
          {row('Sipariş Dili', payment.order_locale)}
          {row('Profil Kimin İçin', payment.profile_for ? (PROFILE_FOR_LABELS[payment.profile_for] ?? payment.profile_for) : null)}
          {row('Oluşturulma', new Date(payment.created_at).toLocaleString('tr-TR'))}
          {row('Vade', payment.due_date)}
          {row('Ödeme Tarihi', payment.paid_at ? new Date(payment.paid_at).toLocaleString('tr-TR') : null)}
          {payment.notes && (
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 italic leading-5">{payment.notes}</div>
          )}
        </div>

        {/* Profil / Yayın durumu */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Profil / Yayın Durumu</h2>
          {vault ? (
            <>
              {row('Profil Adı', vault.display_name)}
              {row('Yayın Durumu', <StatusBadge status={vault.status} />)}
              {row('Doğum Tarihi', vault.birth_date)}
              {row('Vefat Tarihi', vault.death_date)}
              {row('Kargo Adresi', vault.shipping_address ? '✓ Girildi' : 'Girilmedi')}
              {vault.slug && (
                <Link href={`/admin/memorials/${vault.id}`} className="mt-2 inline-block text-xs text-emerald-700 hover:underline">
                  Profil admin sayfasına git →
                </Link>
              )}
            </>
          ) : family ? (
            <>
              {row('Aile Sayfası', family.name)}
              {row('Yayın Durumu', family.is_public ? 'Yayında' : 'Özel')}
            </>
          ) : (
            <p className="text-sm text-slate-400">Henüz bir profil/aile sayfası oluşturulmamış.</p>
          )}
        </div>

        {/* KVKK onay kaydı */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">KVKK Onay Kaydı</h2>
          {consent ? (
            <>
              {row('Aydınlatma okundu', <span className={consent.privacy_notice_ack ? 'text-emerald-600' : 'text-red-600'}>{consent.privacy_notice_ack ? 'Evet' : 'Hayır'}</span>)}
              {row('Veri işleme rızası', <span className={consent.data_processing_consent ? 'text-emerald-600' : 'text-red-600'}>{consent.data_processing_consent ? 'Evet' : 'Hayır'}</span>)}
              {row('Pazarlama izni', consent.marketing_permission ? 'Evet' : 'Hayır')}
              {row('Onay Dili', consent.consent_language)}
              {row('IP Adresi', consent.consent_ip)}
              {row('Onay Tarihi', consent.accepted_at ? new Date(consent.accepted_at).toLocaleString('tr-TR') : null)}
              {row('Sözleşme Versiyonu', consent.consent_version)}
              <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 truncate" title={consent.user_agent ?? ''}>
                User-Agent: {consent.user_agent ?? '—'}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400">Bu kullanıcı için KVKK onay kaydı bulunamadı.</p>
          )}
        </div>
      </div>

      {/* WhatsApp mesaj geçmişi / admin notları */}
      <div className="mt-5 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">WhatsApp Mesaj Geçmişi / Notlar</h2>
        <AdminNotesForm paymentId={payment.id} initialNotes={payment.admin_notes} />
      </div>
    </div>
  )
}
