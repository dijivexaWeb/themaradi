import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import RejectModal from '../_components/RejectModal'
import ApproveButton from './_ApproveButton'
import DocApproveButton from './_DocApproveButton'
import { createPresignedReadUrl } from '@/lib/r2'

export default async function VerificationsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  // Ödeme onayı bekleyenler
  const { data: paymentQueue } = await supabase
    .from('vaults')
    .select(`
      id, display_name, slug, created_at, product_type,
      profiles!vaults_owner_id_fkey (full_name, email),
      payments (id, amount, currency, product_type, payment_method, notes, status)
    `)
    .eq('status', 'pending_verification')
    .order('created_at', { ascending: true })

  // Belge inceleme kuyruğu
  const { data: docQueue } = await supabase
    .from('memorial_verification_docs')
    .select(`
      id, file_name, file_url, mime_type, file_size_bytes, created_at, status, file_key, storage_bucket,
      vaults (id, display_name, slug, status, profiles!vaults_owner_id_fkey (full_name, email)),
      memorial_witnesses (id, full_name, email, phone, status, confirmed_at, consent_processing, consent_phone, consent_email)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // Generate dynamic signed URLs for R2 documents
  const docQueueWithUrls = docQueue
    ? await Promise.all(
        docQueue.map(async (doc) => {
          let viewUrl = doc.file_url
          if (doc.file_key && doc.storage_bucket) {
            try {
              viewUrl = await createPresignedReadUrl(doc.storage_bucket, doc.file_key, 3600) // 1 hour expiry
            } catch (err) {
              console.error('Error generating signed URL:', err)
            }
          }
          return { ...doc, viewUrl }
        })
      )
    : []


  // eslint-disable-next-line react-hooks/purity
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
          {(docQueue?.length ?? 0) > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              {docQueue!.length}
            </span>
          )}
        </div>

        {(docQueueWithUrls.length === 0) ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
            İncelenecek belge yok.
          </div>
        ) : (
          <div className="space-y-4">
            {docQueueWithUrls.map((doc) => {
              const vault = Array.isArray(doc.vaults) ? doc.vaults[0] : doc.vaults as Record<string, unknown> | null
              const owner = vault ? (Array.isArray((vault as Record<string, unknown>).profiles) ? ((vault as Record<string, unknown>).profiles as Record<string, unknown>[])[0] : (vault as Record<string, unknown>).profiles) as Record<string, unknown> | null : null
              const witnesses = (Array.isArray(doc.memorial_witnesses) ? doc.memorial_witnesses : []) as Array<{ id: string; full_name: string; email: string; phone: string | null; status: string; confirmed_at: string | null; consent_processing: boolean; consent_phone: boolean; consent_email: boolean }>
              const confirmedCount = witnesses.filter(w => w.status === 'confirmed').length

              return (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{(vault as Record<string, unknown>)?.display_name as string ?? '—'}</p>
                      <p className="text-xs text-slate-400">{owner?.email as string ?? '—'} · {owner?.full_name as string ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">
                        {new Date(doc.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 grid sm:grid-cols-2 gap-6">
                    {/* Belge */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Yüklenen Belge</p>
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 mb-3">
                        <span className="text-lg">📄</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-700">{doc.file_name}</p>
                          {doc.file_size_bytes && (
                            <p className="text-xs text-slate-400">{(doc.file_size_bytes / 1024).toFixed(0)} KB</p>
                          )}
                        </div>
                        <a href={doc.viewUrl} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
                          Görüntüle →
                        </a>
                      </div>
                      <DocApproveButton docId={doc.id} vaultId={(vault as Record<string, unknown>)?.id as string} />
                    </div>

                    {/* Şahitler */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Şahitler — {confirmedCount} / {witnesses.length} onayladı
                      </p>
                      {witnesses.length === 0 ? (
                        <p className="text-xs text-slate-400">Henüz şahit eklenmemiş.</p>
                      ) : (
                        <div className="space-y-2">
                          {witnesses.map(w => (
                            <div key={w.id} className={`rounded-lg border px-3 py-2.5 text-xs ${w.status === 'confirmed' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${w.status === 'confirmed' ? 'text-emerald-700' : 'text-amber-600'}`}>
                                  {w.status === 'confirmed' ? '✓' : '○'}
                                </span>
                                <span className="font-medium text-slate-700">{w.full_name}</span>
                                {w.status === 'confirmed' && w.confirmed_at ? (
                                  <span className="ml-auto shrink-0 text-slate-400">
                                    {new Date(w.confirmed_at).toLocaleDateString('tr-TR')}
                                  </span>
                                ) : (
                                  <span className="ml-auto shrink-0 font-semibold text-amber-600">Bekliyor</span>
                                )}
                              </div>
                              <div className="mt-1 space-y-0.5 pl-4">
                                <p className="text-slate-500">{w.email}</p>
                                {w.phone && <p className="text-slate-500">📞 {w.phone}</p>}
                                <div className="flex gap-2 mt-1">
                                  <span className={`rounded px-1.5 py-0.5 font-medium ${w.consent_processing ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>İşleme {w.consent_processing ? '✓' : '✗'}</span>
                                  <span className={`rounded px-1.5 py-0.5 font-medium ${w.consent_phone ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>Telefon {w.consent_phone ? '✓' : '✗'}</span>
                                  <span className={`rounded px-1.5 py-0.5 font-medium ${w.consent_email ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>E-posta {w.consent_email ? '✓' : '✗'}</span>
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
