import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

interface Props { params: Promise<{ id: string }> }

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'İnceleniyor', color: 'bg-[#fff7e6] text-[#725212] border-[#dfbd72]/50' },
  under_review: { label: 'Değerlendirmede', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  approved: { label: 'Onaylandı', color: 'bg-[#f0fdf4] text-[#174f35] border-[#174f35]/20' },
  rejected: { label: 'Reddedildi', color: 'bg-red-50 text-red-700 border-red-200' },
  contested: { label: 'İtiraz Var', color: 'bg-orange-50 text-orange-700 border-orange-200' },
}

export default async function BelgelerPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, display_name, status').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: claims } = await supabase
    .from('death_claims')
    .select('*')
    .eq('vault_id', id)
    .order('created_at', { ascending: false })

  const hasPendingOrApproved = claims?.some(c => ['pending', 'under_review', 'approved'].includes(c.status))

  async function submitDocuments(formData: FormData) {
    'use server'
    const supabase2 = await createClient()
    const { data: { user: u } } = await supabase2.auth.getUser()
    if (!u) return

    const { data: v } = await supabase2.from('vaults').select('id').eq('id', id).eq('owner_id', u.id).single()
    if (!v) return

    const docUrl = (formData.get('document_url') as string)?.trim()
    const idDocUrl = (formData.get('requester_id_url') as string)?.trim()
    const deceasedIdUrl = (formData.get('deceased_id_url') as string)?.trim()
    const docType = formData.get('document_type') as string

    if (!docUrl) return

    await supabase2.from('death_claims').insert({
      vault_id: id,
      claimant_id: u.id,
      document_url: docUrl,
      document_type: docType || 'death_certificate',
      requester_id_document_url: idDocUrl || null,
      deceased_id_document_url: deceasedIdUrl || null,
      status: 'pending',
    })

    revalidatePath(`/dashboard/vault/${id}/belgeler`)
    revalidatePath(`/dashboard/vault/${id}`)
  }

  const inputCls = `w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10`
  const labelCls = `mb-1.5 block text-xs font-semibold text-[#4a5e55]`

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Belgeler</span>
        </div>

        <h1 className="font-serif text-3xl text-[#1f2d27] mb-2">Belge Doğrulama</h1>
        <p className="text-sm text-[#788177] mb-7 leading-6">
          Anma profilinin aktive edilmesi için ölüm belgesi ve kimlik belgesi yüklemeniz gerekmektedir.
          Belgeler ekibimiz tarafından incelenerek onaylanır.
        </p>

        {claims && claims.length > 0 && (
          <div className="space-y-3 mb-6">
            {claims.map((claim) => {
              const s = statusLabels[claim.status] ?? { label: claim.status, color: 'bg-[#f5efdf] text-[#788177] border-[#e5dccb]' }
              return (
                <div key={claim.id} className="rounded-2xl border border-[#e5dccb] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1f2d27] text-sm">Belge Başvurusu</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-[#788177]">
                    Gönderildi: {new Date(claim.created_at).toLocaleDateString('tr-TR')}
                  </p>
                  {claim.rejection_reason && (
                    <p className="text-xs text-red-500 mt-1">Red gerekçesi: {claim.rejection_reason}</p>
                  )}
                  {claim.verification_notes && (
                    <p className="text-xs text-[#4a5e55] mt-1 italic">{claim.verification_notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!hasPendingOrApproved && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_16px_50px_rgba(64,48,24,0.06)]">
            <h2 className="text-sm font-semibold text-[#1f2d27] mb-1">Belge Yükle</h2>
            <p className="text-xs text-[#788177] mb-5">
              Belgeleri URL olarak girin (Google Drive, Dropbox vb. paylaşım linki).
            </p>

            <form action={submitDocuments} className="space-y-4">
              <div>
                <label className={labelCls}>Belge Türü</label>
                <select
                  name="document_type"
                  className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10"
                >
                  <option value="death_certificate">Ölüm Belgesi</option>
                  <option value="official_record">Resmi Kayıt</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Ölüm Belgesi URL <span className="text-[#dfbd72]">*</span>
                </label>
                <input type="url" name="document_url" required placeholder="https://drive.google.com/..." className={inputCls} />
                <p className="mt-1 text-xs text-[#adb5ab]">Ölüm cüzdanı veya resmi ölüm belgesi</p>
              </div>

              <div>
                <label className={labelCls}>Başvuran Kimlik URL</label>
                <input type="url" name="requester_id_url" placeholder="https://... (TC Kimlik veya pasaport)" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Vefat Eden Kimlik URL</label>
                <input type="url" name="deceased_id_url" placeholder="https://... (vefat eden kişinin kimliği)" className={inputCls} />
              </div>

              <div className="rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-4 py-3">
                <p className="text-xs text-[#725212] leading-5">
                  Belgeler gizli tutulur ve yalnızca ekibimiz tarafından incelenir. Sahte belge yüklemek hesabın kalıcı olarak askıya alınmasına neden olur.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#174f35] py-3.5 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors"
              >
                Belgeleri Gönder
              </button>
            </form>
          </div>
        )}

        {hasPendingOrApproved && (
          <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-8 text-center shadow-[0_16px_50px_rgba(64,48,24,0.06)]">
            <div className="text-3xl mb-3">📋</div>
            <p className="font-semibold text-[#1f2d27] text-sm">Belgeleriniz alındı</p>
            <p className="text-[#788177] text-xs mt-1.5">Ekibimiz belgelerinizi inceliyor. En kısa sürede geri dönüş yapacağız.</p>
          </div>
        )}
      </div>
    </div>
  )
}
