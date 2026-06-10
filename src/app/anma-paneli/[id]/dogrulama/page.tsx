import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  publishMemorialAction,
  uploadVerificationDocAction,
  deleteVerificationDocAction,
  addWitnessAction,
  resendWitnessEmailAction,
  removeWitnessAction,
} from '../actions'
import {
  CheckCircle2, Clock, Globe, Lock, AlertTriangle, Eye, ArrowRight,
  FileText, Users, Mail, Trash2, RefreshCw, Upload,
} from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

type Doc = {
  id: string
  file_name: string
  file_url: string
  status: string
  admin_note: string | null
  created_at: string
}

type Witness = {
  id: string
  full_name: string
  email: string
  status: string
  confirmed_at: string | null
  created_at: string
}

const STATUS_CONFIG = {
  pending_verification: {
    icon: Clock, iconCls: 'text-[#b08340]', cardCls: 'border-[#ead4a5] bg-[#fff9ee]', titleCls: 'text-[#6b4c10]',
    title: 'Ödeme Bekleniyor',
    desc: 'Banka havalesi alındıktan sonra ekibimiz 1-2 iş günü içinde hesabınızı aktif eder.',
  },
  hidden_vault: {
    icon: Lock, iconCls: 'text-[#496056]', cardCls: 'border-[#dfe6d8] bg-[#eef1ea]', titleCls: 'text-[#2e4038]',
    title: 'Hesap Aktif — Doğrulama Gerekli',
    desc: 'Anma sayfasını yayına alabilmek için vefat belgesi ve 2 şahit onayı gereklidir.',
  },
  private_memorial: {
    icon: CheckCircle2, iconCls: 'text-[#174f35]', cardCls: 'border-[#cfe7d3] bg-[#e9f5ec]', titleCls: 'text-[#0d3a22]',
    title: 'Doğrulandı — Yayına Hazır',
    desc: 'Tüm doğrulama adımları tamamlandı. Dilediğiniz zaman yayına alabilirsiniz.',
  },
  public_memorial: {
    icon: Globe, iconCls: 'text-[#176b3f]', cardCls: 'border-[#a0d4b0] bg-[#d6f0df]', titleCls: 'text-[#0a2e1a]',
    title: 'Yayında',
    desc: 'Anma sayfanız herkese açık.',
  },
  suspended: {
    icon: AlertTriangle, iconCls: 'text-red-600', cardCls: 'border-red-200 bg-red-50', titleCls: 'text-red-800',
    title: 'Askıya Alındı',
    desc: 'Hesabınız geçici olarak askıya alınmıştır. Destek ekibiyle iletişime geçin.',
  },
}

export default async function MemorialDogrulamaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, status, slug, biography, cover_photo_url')
    .eq('id', id).eq('owner_id', user.id).eq('product_type', 'memorial_profile').single()
  if (!vault) notFound()

  const [
    { data: docs },
    { data: witnesses },
  ] = await Promise.all([
    supabase.from('memorial_verification_docs').select('*').eq('vault_id', id).order('created_at', { ascending: false }),
    supabase.from('memorial_witnesses').select('*').eq('vault_id', id).order('created_at', { ascending: true }),
  ])

  const status = (vault.status ?? 'pending_verification') as keyof typeof STATUS_CONFIG
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_verification
  const StatusIcon = cfg.icon
  const isLocked = status === 'pending_verification'
  const isActive = !isLocked

  const activeDoc = (docs ?? []).find(d => d.status !== 'rejected') as Doc | undefined
  const typedWitnesses = (witnesses ?? []) as Witness[]
  const confirmedWitnesses = typedWitnesses.filter(w => w.status === 'confirmed')

  // Doğrulama adımları
  const docOk = activeDoc?.status === 'approved'
  const witnessesOk = confirmedWitnesses.length >= 2
  const allVerified = docOk && witnessesOk

  const uploadDocAction = uploadVerificationDocAction.bind(null, id)
  const deleteDocAction = deleteVerificationDocAction.bind(null, id)
  const addWitness = addWitnessAction.bind(null, id)
  const publishAction = publishMemorialAction.bind(null, id)

  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10 disabled:opacity-40'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link href={`/anma-paneli/${id}`} className="text-[#788177] transition-colors hover:text-[#174f35]">
            {vault.display_name}
          </Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Doğrulama & Yayın</span>
        </div>

        <div className="mb-6">
          <h1 className="font-serif text-3xl text-[#1f2d27]">Doğrulama & Yayın</h1>
          <p className="mt-1 text-sm text-[#788177]">Anma sayfanızın yayın sürecini buradan yönetebilirsiniz.</p>
        </div>

        {/* Durum kartı */}
        <div className={`mb-6 rounded-2xl border p-5 ${cfg.cardCls}`}>
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60">
              <StatusIcon className={`h-5 w-5 ${cfg.iconCls}`} />
            </div>
            <div>
              <h2 className={`font-semibold ${cfg.titleCls}`}>{cfg.title}</h2>
              <p className={`mt-1 text-sm leading-6 ${cfg.titleCls} opacity-80`}>{cfg.desc}</p>
            </div>
          </div>
        </div>

        {/* Ödeme bilgisi */}
        {status === 'pending_verification' && (
          <div className="mb-6 rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.06)]">
            <h3 className="mb-3 font-semibold text-[#1f2d27]">Banka Havalesi Bilgileri</h3>
            <div className="space-y-2 text-sm">
              {[['Banka', 'TBC Bank'], ['IBAN', 'GE12TBC0000000000000'], ['Açıklama', `Anma — ${vault.display_name}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-xl border border-[#e5dccb] bg-white px-4 py-3">
                  <span className="text-[#788177]">{k}</span>
                  <span className="font-semibold text-[#1f2d27] font-mono">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[#788177]">
              Havale sonrası{' '}
              <Link href="/contact" className="text-[#174f35] underline">destek ekibimize</Link>{' '}
              bildirim gönderin.
            </p>
          </div>
        )}

        {/* Doğrulama Adımları */}
        {isActive && (status === 'hidden_vault' || status === 'private_memorial' || status === 'public_memorial') && (
          <div className="mb-6 space-y-4">

            {/* ADIM 1 — Belge */}
            <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] shadow-[0_4px_24px_rgba(64,48,24,0.06)] overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[#e5dccb] px-6 py-4">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${docOk ? 'bg-[#174f35] text-white' : 'bg-[#e5dccb] text-[#788177]'}`}>
                  {docOk ? '✓' : '1'}
                </div>
                <FileText className="h-4 w-4 text-[#b08340]" />
                <h3 className="font-semibold text-[#1f2d27]">Vefat Belgesi</h3>
                <div className="ml-auto">
                  {!activeDoc && <span className="rounded-full bg-[#f5efdf] px-2.5 py-0.5 text-[11px] font-semibold text-[#788177]">Yüklenmedi</span>}
                  {activeDoc?.status === 'pending' && <span className="rounded-full bg-[#fff4dc] px-2.5 py-0.5 text-[11px] font-semibold text-[#93620f]">İnceleniyor</span>}
                  {activeDoc?.status === 'approved' && <span className="rounded-full bg-[#e9f5ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#176b3f]">Onaylandı ✓</span>}
                  {activeDoc?.status === 'rejected' && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">Reddedildi</span>}
                </div>
              </div>

              <div className="p-6">
                {activeDoc?.status === 'rejected' && activeDoc.admin_note && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <strong>Red sebebi:</strong> {activeDoc.admin_note}
                  </div>
                )}

                {activeDoc && activeDoc.status !== 'rejected' ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[#e5dccb] bg-[#f9f5ec] px-4 py-3">
                    <FileText className="h-5 w-5 shrink-0 text-[#b08340]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1f2d27]">{activeDoc.file_name}</p>
                      <p className="text-xs text-[#adb5ab]">
                        {new Date(activeDoc.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <a href={activeDoc.file_url} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 rounded-lg border border-[#e5dccb] px-3 py-1.5 text-xs font-medium text-[#174f35] hover:bg-[#f0faf4]">
                      Görüntüle
                    </a>
                    {activeDoc.status === 'pending' && (
                      <form action={deleteDocAction}>
                        <button type="submit" className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-400 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="mb-3 text-xs text-[#788177]">
                      Vefat belgesi, nüfus cüzdanı veya resmi bir doğrulama belgesi yükleyin. (PDF, JPEG, PNG — maks. 20 MB)
                    </p>
                    <form action={uploadDocAction}>
                      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#e5dccb] bg-white px-5 py-8 text-center hover:border-[#174f35]/40 hover:bg-[#f9f5ec] transition-all">
                        <Upload className="h-6 w-6 text-[#c7a76f]" />
                        <span className="text-sm font-medium text-[#1f2d27]">Belge seçin veya sürükleyin</span>
                        <span className="text-xs text-[#adb5ab]">PDF, JPG, PNG — maks. 20 MB</span>
                        <input type="file" name="doc_file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={e => e.target.form?.requestSubmit()} />
                      </label>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* ADIM 2 — Şahitler */}
            <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] shadow-[0_4px_24px_rgba(64,48,24,0.06)] overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[#e5dccb] px-6 py-4">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${witnessesOk ? 'bg-[#174f35] text-white' : 'bg-[#e5dccb] text-[#788177]'}`}>
                  {witnessesOk ? '✓' : '2'}
                </div>
                <Users className="h-4 w-4 text-[#b08340]" />
                <h3 className="font-semibold text-[#1f2d27]">Şahit Onayları</h3>
                <div className="ml-auto flex items-center gap-2">
                  <span className={`text-xs font-semibold ${witnessesOk ? 'text-[#176b3f]' : 'text-[#788177]'}`}>
                    {confirmedWitnesses.length} / 2 onaylandı
                  </span>
                  {witnessesOk && <span className="rounded-full bg-[#e9f5ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#176b3f]">Tamamlandı ✓</span>}
                </div>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-[#788177] mb-1">
                  En az 2 kişi email ile şahitliğini onaylamalıdır. Şahitler vefatı bilen, sizin dışınızda kişiler olmalıdır.
                </p>

                {/* Mevcut şahitler */}
                {typedWitnesses.map((w) => {
                  const resend = resendWitnessEmailAction.bind(null, w.id, id)
                  const remove = removeWitnessAction.bind(null, w.id, id)
                  return (
                    <div key={w.id} className={`flex items-center gap-3 rounded-2xl border p-4 ${w.status === 'confirmed' ? 'border-[#cfe7d3] bg-[#f0faf4]' : 'border-[#e5dccb] bg-white'}`}>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${w.status === 'confirmed' ? 'bg-[#174f35] text-white' : 'bg-[#f5efdf] text-[#b08340]'}`}>
                        {w.status === 'confirmed' ? '✓' : w.full_name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1f2d27]">{w.full_name}</p>
                        <p className="text-xs text-[#adb5ab]">{w.email}</p>
                        {w.status === 'confirmed' && w.confirmed_at && (
                          <p className="text-[11px] text-[#174f35] mt-0.5">
                            {new Date(w.confirmed_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {w.status === 'confirmed' ? (
                          <span className="rounded-full bg-[#e9f5ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#176b3f]">Onaylandı</span>
                        ) : (
                          <>
                            <span className="rounded-full bg-[#fff4dc] px-2.5 py-0.5 text-[11px] font-semibold text-[#93620f]">Bekliyor</span>
                            <form action={resend}>
                              <button type="submit" title="Email'i yeniden gönder" className="rounded-lg border border-[#e5dccb] p-1.5 text-[#788177] hover:bg-[#f5efdf] hover:text-[#174f35]">
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                            </form>
                            <form action={remove}>
                              <button type="submit" title="Şahiti kaldır" className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-400 hover:text-red-600">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Şahit ekle formu */}
                {typedWitnesses.length < 5 && (
                  <form action={addWitness} className="rounded-2xl border border-dashed border-[#e5dccb] bg-white p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-4 w-4 text-[#b08340]" />
                      <span className="text-xs font-semibold text-[#4a5e55]">Şahit Ekle</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Ad Soyad</label>
                        <input type="text" name="full_name" required placeholder="Ahmet Yılmaz" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>E-posta</label>
                        <input type="email" name="email" required placeholder="ahmet@example.com" className={inputCls} />
                      </div>
                    </div>
                    <button type="submit"
                      className="flex items-center gap-2 rounded-xl bg-[#174f35] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(23,79,53,0.18)] hover:bg-[#123f2b] transition-colors">
                      <Mail className="h-3.5 w-3.5" />
                      Onay Emaili Gönder
                    </button>
                    <p className="text-[11px] text-[#adb5ab]">
                      Şahide bir onay e-postası gönderilecektir. Linklere tıklayarak onaylamalarını bekleyin.
                    </p>
                  </form>
                )}
              </div>
            </div>

            {/* ADIM 3 — Özet / Yayına Al */}
            {status === 'private_memorial' && (
              <div className={`rounded-3xl border p-6 ${allVerified ? 'border-[#cfe7d3] bg-[#e9f5ec]' : 'border-[#e5dccb] bg-[#fffdf8]'}`}>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-[#0d3a22]">
                  <Globe className="h-5 w-5 text-[#174f35]" />
                  Yayına Al
                </h3>

                {!allVerified ? (
                  <div className="space-y-2">
                    <p className="text-sm text-[#788177] mb-3">Yayına alabilmek için tüm adımların tamamlanması gerekiyor:</p>
                    {[
                      { label: 'Vefat belgesi onaylandı', done: docOk },
                      { label: 'En az 2 şahit onayladı', done: witnessesOk },
                    ].map(step => (
                      <div key={step.label} className="flex items-center gap-3 rounded-xl border border-[#e5dccb] bg-white px-4 py-3">
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${step.done ? 'bg-[#174f35]' : 'border border-[#c8bfb0]'}`}>
                          {step.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <span className={`text-sm ${step.done ? 'text-[#1f2d27]' : 'text-[#adb5ab]'}`}>{step.label}</span>
                        {!step.done && <span className="ml-auto text-xs text-[#dfbd72]">Eksik</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="mb-5 text-sm leading-6 text-[#2e4038]">
                      Tüm doğrulama adımları tamamlandı. Sayfayı yayına aldığınızda herkes görebilir ve taziye bırakabilir.
                    </p>
                    <form action={publishAction}>
                      <button type="submit"
                        className="flex items-center gap-2 rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.25)] hover:bg-[#123f2b] transition-colors">
                        <Globe className="h-4 w-4" />
                        Yayına Al
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Yayında görüntüle */}
        {status === 'public_memorial' && vault.slug && (
          <div className="rounded-3xl border border-[#a0d4b0] bg-[#d6f0df] p-6">
            <div className="mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#174f35]" />
              <h3 className="font-semibold text-[#0a2e1a]">Anma Sayfanız Yayında</h3>
            </div>
            <p className="mb-4 font-mono text-sm text-[#1a4a2a]">/memorial/{vault.slug}</p>
            <Link href={`/memorial/${vault.slug}`} target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-[#7ec49a] bg-white/60 px-5 py-2.5 text-sm font-semibold text-[#0d3a22] hover:bg-white transition-colors">
              <Eye className="h-4 w-4" />
              Sayfayı Görüntüle →
            </Link>
          </div>
        )}

        {/* Askıya alındı */}
        {status === 'suspended' && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700 leading-6">Hesabınız askıya alınmıştır. Destek ekibimizle iletişime geçin.</p>
            <Link href="/contact" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-700">
              Destek →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
