import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import RejectModal from '../_components/RejectModal'
import ApproveButton from './_ApproveButton'
import DocApproveButton from './_DocApproveButton'
import { createPresignedReadUrl } from '@/lib/r2'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'

export default async function VerificationsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  // Ödeme onayı bekleyenler
  const { data: paymentQueue } = await supabase
    .from('vaults')
    .select(`
      id, display_name, slug, created_at, product_type,
      profiles!vaults_owner_id_fkey (full_name, email, phone),
      payments (id, amount, currency, product_type, payment_method, notes, status)
    `)
    .eq('status', 'pending_verification')
    .order('created_at', { ascending: true })

  // Belge inceleme kuyruğu
  const { data: docQueue } = await supabase
    .from('memorial_verification_docs')
    .select(`
      id, file_name, file_url, mime_type, file_size_bytes, created_at, status, admin_note, file_key, storage_bucket,
      vaults (
        id, display_name, slug, status, created_at,
        birth_date, death_date, tagline,
        profiles!vaults_owner_id_fkey (full_name, email, phone),
        memorial_witnesses (id, full_name, email, phone, status, confirmed_at, consent_processing, consent_phone, consent_email)
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // Presigned URLs
  const docQueueWithUrls = docQueue
    ? await Promise.all(
        docQueue.map(async (doc) => {
          let viewUrl = doc.file_url
          if (doc.file_key && doc.storage_bucket) {
            try {
              viewUrl = await createPresignedReadUrl(doc.storage_bucket, doc.file_key, 3600)
            } catch (err) {
              console.error('Error generating signed URL:', err)
            }
          }
          return { ...doc, viewUrl }
        })
      )
    : []

  const now = Date.now()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Doğrulama Kuyruğu</h1>
        <p className="text-slate-500 text-sm mt-1">Ödeme ve belge onay işlemleri</p>
      </div>

      {/* BÖLÜM 1: Ödeme Onayı */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Ödeme Onayı</h2>
          {(paymentQueue?.length ?? 0) > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {paymentQueue!.length}
            </span>
          )}
        </div>

        {(!paymentQueue || paymentQueue.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
            Ödeme bekleyen kayıt yok.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Vault</th>
                  <th className="text-left px-4 py-3">Sahip</th>
                  <th className="text-left px-4 py-3">Bekliyor</th>
                  <th className="text-left px-4 py-3">14 Gün Biter</th>
                  <th className="text-left px-4 py-3">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentQueue.map((v) => {
                  const createdAt = new Date(v.created_at)
                  const daysWaiting = Math.floor((now - createdAt.getTime()) / 86400000)
                  const daysLeft = Math.max(0, Math.ceil((createdAt.getTime() + 14 * 86400000 - now) / 86400000))
                  const owner = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
                  const payment = Array.isArray(v.payments) ? v.payments[0] : (v as Record<string, unknown>).payments as Record<string, unknown> | undefined

                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{v.display_name}</p>
                        <p className="text-xs text-slate-400">/{v.slug ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{(owner as { full_name?: string })?.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{(owner as { email?: string })?.email ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysWaiting > 10 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                          {daysWaiting} gün
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysLeft <= 2 ? 'bg-red-100 text-red-700' : daysLeft <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {daysLeft} gün kaldı
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {payment && <span className="text-sm font-bold text-slate-800">{payment.amount as number} {payment.currency as string}</span>}
                          <ApproveButton vaultId={v.id} paymentId={(payment as { id?: string })?.id} />
                          <RejectModal vaultId={v.id} vaultName={v.display_name} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BÖLÜM 2: Belge İnceleme */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Vefat Belgesi İnceleme</h2>
          {(docQueueWithUrls.length) > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              {docQueueWithUrls.length}
            </span>
          )}
        </div>

        {docQueueWithUrls.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
            İncelenecek belge yok.
          </div>
        ) : (
          <div className="space-y-6">
            {docQueueWithUrls.map((doc) => {
              const vault = (Array.isArray(doc.vaults) ? doc.vaults[0] : doc.vaults) as Record<string, unknown> | null
              const owner = vault ? ((Array.isArray((vault).profiles) ? (vault.profiles as Record<string, unknown>[])[0] : vault.profiles) as Record<string, unknown> | null) : null
              const witnessesRaw = vault ? vault.memorial_witnesses : []
              const witnesses = (Array.isArray(witnessesRaw) ? witnessesRaw : []) as Array<{
                id: string; full_name: string; email: string; phone: string | null
                status: string; confirmed_at: string | null
                consent_processing: boolean; consent_phone: boolean; consent_email: boolean
              }>
              const confirmedCount = witnesses.filter(w => w.status === 'confirmed').length
              const vaultSlug = vault?.slug as string | null
              const previewUrl = vaultSlug ? `${SITE_URL}/memorial/${vaultSlug}?preview=1` : null
              const birthYear = vault?.birth_date ? new Date(vault.birth_date as string).getFullYear() : null
              const deathYear = vault?.death_date ? new Date(vault.death_date as string).getFullYear() : null
              const vaultCreatedAt = vault?.created_at ? new Date(vault.created_at as string) : null

              return (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                  {/* Başlık */}
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-lg font-bold">
                        {(vault?.display_name as string ?? '?')[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{vault?.display_name as string ?? '—'}</p>
                        <p className="text-xs text-slate-400">
                          {birthYear && deathYear ? `${birthYear} – ${deathYear}` : birthYear ? `d. ${birthYear}` : ''}
                          {vault?.tagline ? ` · ${vault.tagline as string}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {previewUrl && (
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                          Sayfayı Önizle →
                        </a>
                      )}
                      <span className="text-xs text-slate-400">
                        Belge yüklendi: {new Date(doc.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 grid lg:grid-cols-3 gap-6">

                    {/* Hesap Sahibi */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Hesap Sahibi</p>
                      <div className="space-y-1.5 text-sm">
                        <p className="font-semibold text-slate-800">{owner?.full_name as string ?? '—'}</p>
                        <p className="text-slate-500">{owner?.email as string ?? '—'}</p>
                        {(owner?.phone as string | null) && (
                          <p className="text-slate-500">📞 {owner.phone as string}</p>
                        )}
                        {vaultCreatedAt && (
                          <p className="text-xs text-slate-400 pt-1 border-t border-slate-200 mt-2">
                            Hesap açıldı: {vaultCreatedAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Yüklenen Belge + Onay */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Yüklenen Belge</p>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 mb-3">
                        <span className="text-2xl">📄</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-700">{doc.file_name}</p>
                          {doc.file_size_bytes && (
                            <p className="text-xs text-slate-400">{(doc.file_size_bytes / 1024).toFixed(0)} KB · {doc.mime_type}</p>
                          )}
                        </div>
                        <a href={doc.viewUrl} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900">
                          Görüntüle →
                        </a>
                      </div>
                      <DocApproveButton docId={doc.id} vaultId={vault?.id as string} />
                    </div>

                    {/* Şahitler */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                        Şahitler
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${confirmedCount >= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {confirmedCount}/{witnesses.length} onayladı
                        </span>
                      </p>
                      {witnesses.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Henüz şahit eklenmemiş.</p>
                      ) : (
                        <div className="space-y-2">
                          {witnesses.map(w => (
                            <div key={w.id} className={`rounded-xl border px-3 py-2.5 text-xs ${w.status === 'confirmed' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-sm ${w.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                  {w.status === 'confirmed' ? '✓' : '○'}
                                </span>
                                <span className="font-semibold text-slate-700">{w.full_name}</span>
                                <span className="ml-auto shrink-0 text-slate-400">
                                  {w.status === 'confirmed' && w.confirmed_at
                                    ? new Date(w.confirmed_at).toLocaleDateString('tr-TR')
                                    : <span className="text-amber-600 font-semibold">Bekliyor</span>}
                                </span>
                              </div>
                              <div className="mt-1 pl-5 space-y-0.5 text-slate-500">
                                <p>{w.email}</p>
                                {w.phone && <p>📞 {w.phone}</p>}
                                <div className="flex gap-1.5 mt-1 flex-wrap">
                                  {[
                                    { key: 'consent_processing', label: 'İşleme', val: w.consent_processing },
                                    { key: 'consent_phone', label: 'Tel', val: w.consent_phone },
                                    { key: 'consent_email', label: 'E-posta', val: w.consent_email },
                                  ].map(c => (
                                    <span key={c.key} className={`rounded px-1.5 py-0.5 font-medium text-[10px] ${c.val ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                      {c.label} {c.val ? '✓' : '✗'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
