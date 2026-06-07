import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

interface Props { params: Promise<{ id: string }> }

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'İnceleniyor', color: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'Değerlendirmede', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Onaylandı', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
  contested: { label: 'İtiraz Var', color: 'bg-orange-100 text-orange-700' },
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

  const isLocked = vault.status === 'pending_verification'
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

  const fieldCls = `w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500`

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalarım</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Belgeler</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 mb-2">Belge Doğrulama</h1>
        <p className="text-slate-500 text-sm mb-6">
          Anma profilinin aktive edilmesi için ölüm belgesi ve kimlik belgesi yüklemeniz gerekmektedir.
          Belgeler ekibimiz tarafından incelenerek onaylanır.
        </p>

        {/* Existing claims */}
        {claims && claims.length > 0 && (
          <div className="space-y-3 mb-6">
            {claims.map((claim) => {
              const s = statusLabels[claim.status] ?? { label: claim.status, color: 'bg-slate-100 text-slate-600' }
              return (
                <div key={claim.id} className="glass border border-slate-800/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-200 text-sm">Belge Başvurusu</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Gönderildi: {new Date(claim.created_at).toLocaleDateString('tr-TR')}
                  </p>
                  {claim.rejection_reason && (
                    <p className="text-xs text-red-400 mt-1">Red gerekçesi: {claim.rejection_reason}</p>
                  )}
                  {claim.verification_notes && (
                    <p className="text-xs text-slate-400 mt-1 italic">{claim.verification_notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!hasPendingOrApproved && (
          <div className="glass border border-slate-800/60 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-1">Belge Yükle</h2>
            <p className="text-xs text-slate-500 mb-4">
              Şu an için belgeleri URL olarak girin (Google Drive, Dropbox vb. paylaşım linki).
              Dosya yükleme özelliği yakında gelecek.
            </p>

            <form action={submitDocuments} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Belge Türü</label>
                <select name="document_type" className={`bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 w-full`}>
                  <option value="death_certificate">Ölüm Belgesi</option>
                  <option value="official_record">Resmi Kayıt</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Ölüm Belgesi URL <span className="text-amber-400">*</span>
                </label>
                <input type="url" name="document_url" required placeholder="https://drive.google.com/..."
                  className={fieldCls} />
                <p className="text-xs text-slate-600 mt-1">Ölüm cüzdanı veya resmi ölüm belgesi</p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Başvuran Kimlik URL</label>
                <input type="url" name="requester_id_url" placeholder="https://... (TC Kimlik veya pasaport)"
                  className={fieldCls} />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Vefat Eden Kimlik URL</label>
                <input type="url" name="deceased_id_url" placeholder="https://... (vefat eden kişinin kimliği)"
                  className={fieldCls} />
              </div>

              <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-amber-400">
                  ⚠️ Belgeler gizli tutulur ve yalnızca ekibimiz tarafından incelenir. Sahte belge yüklemek hesabın kalıcı olarak askıya alınmasına neden olur.
                </p>
              </div>

              <button type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Belgeleri Gönder
              </button>
            </form>
          </div>
        )}

        {hasPendingOrApproved && (
          <div className="glass border border-emerald-500/20 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-slate-300 font-medium text-sm">Belgeleriniz alındı</p>
            <p className="text-slate-500 text-xs mt-1">Ekibimiz belgelerinizi inceliyor. En kısa sürede geri dönüş yapacağız.</p>
          </div>
        )}
      </div>
    </div>
  )
}
