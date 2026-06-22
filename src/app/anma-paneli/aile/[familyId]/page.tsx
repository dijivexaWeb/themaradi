import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getTranslation } from '@/i18n/server'
import Link from 'next/link'
import Image from 'next/image'
import BrandLogo from '@/components/BrandLogo'
import LangSwitcherDashboard from '@/components/LangSwitcherDashboard'
import SubmitButton from '@/components/SubmitButton'
import { LogOut, Settings, Eye, Plus, X, Globe, Lock, Users, Trash2, Pencil, Check } from 'lucide-react'
import R2ImageUploadLight from '@/components/R2ImageUploadLight'
import QuickPurchaseModal from '@/components/QuickPurchaseModal'
import { fetchPricingConfig } from '@/lib/pricing'
import QRCode from 'qrcode'
import FamilyLinkQr from './FamilyLinkQr'
import {
  updateFamilyInfoAction,
  updateEnabledActionsAction,
  addFamilyVaultMemberAction,
  removeFamilyVaultMemberAction,
  approveFamilyGuestbookAction,
  rejectFamilyGuestbookAction,
  addFamilyPhotoAction,
  deleteFamilyPhotoAction,
  addFamilyMemoryAction,
  deleteFamilyMemoryAction,
  editFamilyMemoryAction,
} from './actions'
import {
  approveFamilyCondolenceAction,
  rejectFamilyCondolenceAction,
} from '@/lib/actions/family-public'

interface Props {
  params: Promise<{ familyId: string }>
  searchParams: Promise<{ edit?: string; addMember?: string }>
}

interface MemberVault {
  id: string
  display_name: string
  status: string
  cover_photo_url: string | null
  birth_date: string | null
  death_date: string | null
  tagline: string | null
}

interface GuestbookEntry {
  id: string
  vault_id: string
  author_name: string
  author_email: string | null
  message: string
  relation: string | null
  status: string
  created_at: string
}

interface FamilyPhoto {
  id: string
  original_url: string
  caption: string | null
  taken_at: string | null
  created_at: string
}

interface FamilyMemory {
  id: string
  title: string | null
  content: string
  memory_date: string | null
  created_at: string
}

function getYears(birth: string | null, death: string | null): string {
  const by = birth ? new Date(birth).getFullYear() : null
  const dy = death ? new Date(death).getFullYear() : null
  if (by && dy) return `${by} – ${dy}`
  if (by) return `${by} –`
  return ''
}

function getStatusBadge(status: string, sb: { published: string; pendingVerification: string; draft: string }) {
  switch (status) {
    case 'public_memorial': return { cls: 'bg-[#174f35]/20 text-[#174f35]', label: sb.published }
    case 'pending_verification': return { cls: 'bg-amber-100 text-amber-700', label: sb.pendingVerification }
    default: return { cls: 'bg-[#f5efdf] text-[#788177]', label: sb.draft }
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function AileAnmaPaneliPage({ params, searchParams }: Props) {
  const { familyId } = await params
  const { edit: editMode, addMember: showAddMember } = await searchParams
  const { t } = await getTranslation()
  const fp = t.familyPanel
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: family } = await supabase
    .from('memorial_families')
    .select('*')
    .eq('id', familyId)
    .eq('owner_id', user.id)
    .single()
  if (!family) notFound()

  const { data: memberRows } = await supabase
    .from('family_members')
    .select('vault_id, sort_order')
    .eq('family_id', familyId)
    .order('sort_order', { ascending: true })

  const vaultIds = (memberRows ?? []).map(r => r.vault_id)
  let memberVaults: MemberVault[] = []
  let pending: (GuestbookEntry & { vault_name: string })[] = []
  let approved: (GuestbookEntry & { vault_name: string })[] = []

  if (vaultIds.length > 0) {
    const [vaultsRes, guestbookRes] = await Promise.all([
      supabase
        .from('vaults')
        .select('id, display_name, status, cover_photo_url, birth_date, death_date, tagline')
        .in('id', vaultIds),
      supabase
        .from('guestbook_entries')
        .select('id, vault_id, author_name, author_email, message, relation, status, created_at')
        .in('vault_id', vaultIds)
        .order('created_at', { ascending: false }),
    ])

    const vaultNameMap = Object.fromEntries(
      (vaultsRes.data ?? []).map(v => [v.id, v.display_name])
    )
    memberVaults = (vaultsRes.data as MemberVault[]) ?? []

    const allEntries = (guestbookRes.data ?? []) as GuestbookEntry[]
    pending = allEntries.filter(e => e.status === 'pending').map(e => ({ ...e, vault_name: vaultNameMap[e.vault_id] ?? '' }))
    approved = allEntries.filter(e => e.status === 'approved').map(e => ({ ...e, vault_name: vaultNameMap[e.vault_id] ?? '' }))
  }

  const [{ data: familyPhotos }, { data: familyMemories }, { data: familyGuestbook }, { data: allMyVaults }, { data: platformSettings }, pricing] = await Promise.all([
    supabase.from('family_media').select('id, original_url, caption, taken_at, created_at').eq('family_id', familyId).order('sort_order', { ascending: true }),
    supabase.from('family_memories').select('id, title, content, memory_date, created_at').eq('family_id', familyId).order('created_at', { ascending: false }),
    supabase.from('family_guestbook').select('id, author_name, author_email, message, relation, status, message_type, created_at').eq('family_id', familyId).order('created_at', { ascending: false }),
    supabase.from('vaults').select('id, display_name').eq('owner_id', user.id).eq('product_type', 'memorial_profile').order('created_at', { ascending: false }),
    supabase.from('platform_settings').select('key, value').in('key', ['bank_iban', 'bank_name', 'bank_recipient', 'paypal_link']),
    fetchPricingConfig(),
  ])

  const ps = Object.fromEntries((platformSettings ?? []).map(r => [r.key, r.value as string]))
  const additionalMemberAmount = pricing.campaignActive && pricing.campaignAdditionalMemberGel
    ? Number(pricing.campaignAdditionalMemberGel)
    : Number(pricing.additionalMemberGel)
  const bankInfo = {
    iban: ps.bank_iban ?? 'GE29TB7522145061700002',
    bankName: ps.bank_name ?? 'Bank of Georgia',
    accountHolder: ps.bank_recipient ?? 'The Eternal Memory LLC',
    amount: additionalMemberAmount,
    currency: 'GEL',
  }
  const paypalLink = ps.paypal_link ?? null

  const unlinkedVaults = (allMyVaults ?? []).filter(v => !vaultIds.includes(v.id))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://theeternal.memory'
  const familyPageUrl = `${appUrl}/aile/${family.slug}`
  const qrSvg = await QRCode.toString(familyPageUrl, {
    type: 'svg',
    width: 256,
    margin: 2,
    color: { dark: '#1c2e25', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })

  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10'
  const labelCls = 'mb-1 block text-xs font-semibold text-[#4a5e55]'
  const updateInfo = updateFamilyInfoAction.bind(null, familyId)
  const updateActions = updateEnabledActionsAction.bind(null, familyId)
  const addMember = addFamilyVaultMemberAction.bind(null, familyId)
  const addPhoto = addFamilyPhotoAction.bind(null, familyId)
  const addMemory = addFamilyMemoryAction.bind(null, familyId)

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[#e5dccb] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <Link href="/anma-paneli" className="text-xs font-medium text-[#788177] hover:text-[#174f35] transition-colors">
              {fp.nav.backToProfiles}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcherDashboard />
            {family.slug && (
              <Link href={`/aile/${family.slug}`} target="_blank"
                className="flex items-center gap-1.5 rounded-xl border border-[#e5dccb] px-3 py-1.5 text-xs font-medium text-[#788177] hover:bg-[#f5efdf] transition-colors">
                <Eye className="h-3.5 w-3.5" /> {fp.nav.preview}
              </Link>
            )}
            <Link href="?edit=1"
              className="flex items-center gap-1.5 rounded-xl bg-[#1c2e25] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#132118] transition-colors">
              <Settings className="h-3.5 w-3.5" /> {fp.nav.editPage}
            </Link>
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-[#788177] hover:bg-[#f5efdf] hover:text-[#1f2d27] transition-colors">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 space-y-12">

        {/* ── Sayfa Düzenleme Paneli ── */}
        {editMode && (
          <div className="rounded-3xl border border-[#c7a76f]/40 bg-[#fff9ee] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#1f2d27]">{fp.editPanel.title}</h2>
              <Link href={`/anma-paneli/aile/${familyId}`} className="text-[#788177] hover:text-[#174f35]">
                <X className="h-4 w-4" />
              </Link>
            </div>
            <form action={updateInfo} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{fp.editPanel.nameLabel}</label>
                  <input type="text" name="name" required defaultValue={family.name} placeholder={fp.editPanel.namePlaceholder} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>{fp.editPanel.taglineLabel}</label>
                  <input type="text" name="tagline" defaultValue={family.tagline ?? ''} placeholder={fp.editPanel.taglinePlaceholder} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{fp.editPanel.storyLabel}</label>
                <textarea name="description" rows={3} defaultValue={family.description ?? ''}
                  placeholder={fp.editPanel.storyPlaceholder}
                  className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] resize-none" />
              </div>
              <div>
                <label className={labelCls}>{fp.editPanel.visibilityLabel}</label>
                <select name="is_public" defaultValue={family.is_public ? 'true' : 'false'}
                  className="rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]">
                  <option value="true">{fp.editPanel.visibilityPublic}</option>
                  <option value="false">{fp.editPanel.visibilityPrivate}</option>
                </select>
              </div>
              <div className="flex gap-3">
                <SubmitButton pendingLabel={fp.editPanel.saving}>{fp.editPanel.save}</SubmitButton>
                <Link href={`/anma-paneli/aile/${familyId}`} className="rounded-xl border border-[#e5dccb] px-5 py-2.5 text-sm font-medium text-[#788177] hover:bg-[#f5efdf] transition-colors">{fp.editPanel.cancel}</Link>
              </div>
            </form>
          </div>
        )}

        {/* ── Aile Başlığı ── */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#788177]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#788177]">{fp.header.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-0.5 ${family.is_public ? 'bg-[#174f35]/10 text-[#174f35]' : 'bg-[#f5efdf] text-[#788177]'}`}>
              {family.is_public ? <><Globe className="h-2.5 w-2.5" />{fp.header.open}</> : <><Lock className="h-2.5 w-2.5" />{fp.header.private}</>}
            </span>
          </div>
          <h1 className="font-serif text-4xl text-[#1f2d27]">{family.name}</h1>
          {family.tagline && <p className="mt-1 text-[#788177]">{family.tagline}</p>}
          {family.description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#788177]">{family.description}</p>}
        </div>

        {/* ── Link & QR Kod ── */}
        <section>
          <div className="mb-4">
            <h2 className="font-semibold text-[#1f2d27]">{fp.linkQr.title}</h2>
            <p className="text-xs text-[#788177] mt-0.5">{fp.linkQr.subtitle}</p>
          </div>
          <FamilyLinkQr
            familyId={familyId}
            initialSlug={family.slug}
            slugLocked={family.slug_locked ?? false}
            appUrl={appUrl}
            qrSvg={qrSvg}
          />
        </section>

        {/* ── Profil Ekle Formu ── */}
        {showAddMember && (
          <div className="rounded-2xl border border-[#e5dccb] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[#1f2d27]">{fp.addMember.title}</h3>
              <Link href={`/anma-paneli/aile/${familyId}`} className="text-[#788177] hover:text-[#174f35]"><X className="h-4 w-4" /></Link>
            </div>
            {unlinkedVaults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#e5dccb] py-8 px-5 text-center flex flex-col items-center gap-4">
                <p className="text-3xl">🕊️</p>
                <div>
                  <p className="text-sm font-medium text-[#1f2d27]">{fp.addMember.noVaultsTitle}</p>
                  <p className="text-xs text-[#788177] mt-1 max-w-xs">{fp.addMember.noVaultsDesc}</p>
                </div>
                <QuickPurchaseModal familyId={familyId} bankInfo={bankInfo} paypalLink={paypalLink} />
              </div>
            ) : (
              <form action={addMember} className="flex gap-3">
                <select name="vault_id" required className="flex-1 rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]">
                  <option value="">{fp.addMember.selectPlaceholder}</option>
                  {unlinkedVaults.map(v => <option key={v.id} value={v.id}>{v.display_name}</option>)}
                </select>
                <SubmitButton pendingLabel={fp.addMember.adding}>{fp.addMember.add}</SubmitButton>
              </form>
            )}
          </div>
        )}

        {/* ── Mezar Taşı Grid ── */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-[#1f2d27]">
              {fp.members.title} <span className="ml-1 text-sm font-normal text-[#788177]">({memberVaults.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <Link href="?addMember=1"
                className="flex items-center gap-1.5 rounded-2xl border border-[#e5dccb] bg-white px-3 py-2 text-sm font-medium text-[#4a5e55] hover:border-[#174f35]/30 hover:bg-[#f9f5ee] transition-colors">
                <Users className="h-4 w-4" /> {fp.members.addExisting}
              </Link>
              <QuickPurchaseModal familyId={familyId} bankInfo={bankInfo} paypalLink={paypalLink} />
            </div>
          </div>

          {memberVaults.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#e5dccb] bg-white py-20 text-center">
              <div className="mb-4 text-5xl">🪦</div>
              <h3 className="mb-1 font-serif text-xl text-[#1f2d27]">{fp.members.emptyTitle}</h3>
              <p className="mb-6 max-w-xs text-sm text-[#788177]">{fp.members.emptyDesc}</p>
              <Link href="?addMember=1" className="rounded-2xl bg-[#1c2e25] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#132118] transition-colors">
                <Plus className="mr-1.5 inline h-4 w-4" /> {fp.members.addFirst}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {memberVaults.map((vault) => {
                const sb = getStatusBadge(vault.status, fp.statusBadge)
                const years = getYears(vault.birth_date, vault.death_date)
                const removeAction = removeFamilyVaultMemberAction.bind(null, familyId, vault.id)
                return (
                  <div key={vault.id} className="group relative">
                    <form action={removeAction} className="absolute -right-2 -top-2 z-10 hidden group-hover:block">
                      <button type="submit" title="Aileden çıkar" className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-500 shadow-sm hover:bg-red-200 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </form>
                    <Link href={`/anma-paneli/${vault.id}`}
                      className="block overflow-hidden rounded-t-[60px] rounded-b-2xl border border-[#e5dccb] bg-white shadow-sm transition-all hover:border-[#174f35]/30 hover:shadow-lg">
                      <div className="relative flex flex-col items-center justify-end pb-6 pt-10 rounded-t-[60px]"
                        style={{ background: 'linear-gradient(to bottom, #1c2e25, #0c1f17)', minHeight: '160px' }}>
                        {vault.cover_photo_url && (
                          <div className="absolute inset-0 rounded-t-[60px] overflow-hidden">
                            <Image src={vault.cover_photo_url} alt="" fill className="object-cover opacity-20" unoptimized />
                          </div>
                        )}
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-white/20 rounded-full" />
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-white/10 rounded-full" />
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-white/30 bg-[#2a4535] shadow-lg">
                            {vault.cover_photo_url
                              ? <Image src={vault.cover_photo_url} alt={vault.display_name} width={64} height={64} className="h-full w-full object-cover" unoptimized />
                              : <div className="flex h-full w-full items-center justify-center text-2xl text-white/60">{vault.display_name.charAt(0).toUpperCase()}</div>
                            }
                          </div>
                          <p className="text-center font-serif text-base font-medium leading-tight text-white px-3">{vault.display_name}</p>
                          {years && <p className="mt-1 text-xs text-white/60 tracking-widest">{years}</p>}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${sb.cls}`}>{sb.label}</span>
                          <span className="text-xs font-medium text-[#174f35]">{fp.members.editLink}</span>
                        </div>
                        {vault.tagline && <p className="mt-1 text-[11px] text-[#788177] line-clamp-1">{vault.tagline}</p>}
                      </div>
                    </Link>
                  </div>
                )
              })}
              <QuickPurchaseModal cardMode familyId={familyId} bankInfo={bankInfo} paypalLink={paypalLink} />
            </div>
          )}
        </section>

        {/* ── Aile Fotoğrafları ── */}
        <section>
          <h2 className="mb-5 font-semibold text-[#1f2d27]">
            {fp.photos.title} <span className="ml-1 text-sm font-normal text-[#788177]">({(familyPhotos ?? []).length})</span>
          </h2>

          {/* Yeni foto ekle — R2 */}
          <form action={addPhoto} className="mb-5 space-y-3 rounded-2xl border border-[#e5dccb] bg-white p-4">
            <R2ImageUploadLight name="photo_file" category="family_photo" profileId={familyId} />
            <div className="flex gap-3">
              <input type="text" name="caption" placeholder={fp.photos.captionPlaceholder} className={`flex-1 ${inputCls}`} />
              <SubmitButton pendingLabel={fp.photos.adding}>{fp.photos.addBtn}</SubmitButton>
            </div>
          </form>

          {(familyPhotos ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e5dccb] bg-white/50 py-10 text-center">
              <p className="text-3xl mb-2">🖼️</p>
              <p className="text-sm text-[#788177]">{fp.photos.empty}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(familyPhotos as FamilyPhoto[]).map(photo => {
                const delPhoto = deleteFamilyPhotoAction.bind(null, familyId, photo.id)
                return (
                  <div key={photo.id} className="group relative overflow-hidden rounded-2xl border border-[#e5dccb] bg-white">
                    <div className="aspect-[4/3] relative bg-[#f5efdf]">
                      <Image src={photo.original_url} alt={photo.caption ?? ''} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <p className="text-xs text-[#788177] truncate">{photo.caption || fmtDate(photo.created_at)}</p>
                      <form action={delPhoto}>
                        <button type="submit" className="text-[#e5dccb] hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Anma Türleri ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#1f2d27]">{fp.actions.title}</h2>
              <p className="text-xs text-[#788177] mt-0.5">{fp.actions.subtitle}</p>
            </div>
          </div>
          <form action={updateActions} className="rounded-2xl border border-[#e5dccb] bg-white p-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { key: 'candle',  emoji: '🕯️', label: fp.actions.candle },
                { key: 'flower',  emoji: '🌹', label: fp.actions.flower },
                { key: 'prayer',  emoji: '🤲', label: fp.actions.prayer },
                { key: 'heart',   emoji: '❤️', label: fp.actions.heart },
                { key: 'star',    emoji: '⭐', label: fp.actions.star },
                { key: 'silence', emoji: '🙏', label: fp.actions.silence },
              ] as const).map(({ key, emoji, label }) => {
                const enabled = (family.enabled_actions ?? ['candle', 'flower', 'prayer']).includes(key)
                return (
                  <label key={key} className="cursor-pointer">
                    <input type="checkbox" name={`action_${key}`} defaultChecked={enabled} className="peer sr-only" />
                    <span className="flex items-center gap-2 rounded-xl border border-[#e5dccb] bg-[#faf6ef] px-4 py-2.5 text-sm text-[#788177] font-medium transition-all peer-checked:border-[#174f35] peer-checked:bg-[#174f35]/10 peer-checked:text-[#174f35] select-none">
                      <span className="text-base">{emoji}</span>
                      {label}
                    </span>
                  </label>
                )
              })}
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-[#adb5ab]">{fp.actions.hint}</p>
              <SubmitButton pendingLabel={fp.actions.saving}>{fp.actions.save}</SubmitButton>
            </div>
          </form>
        </section>

        {/* ── Aile Anıları ── */}
        <section>
          <h2 className="mb-5 font-semibold text-[#1f2d27]">
            {fp.memories.title} <span className="ml-1 text-sm font-normal text-[#788177]">({(familyMemories ?? []).length})</span>
          </h2>

          {/* Yeni anı ekle */}
          <form action={addMemory} className="mb-5 space-y-3 rounded-2xl border border-[#e5dccb] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{fp.memories.titleLabel} <span className="font-normal text-[#adb5ab]">({fp.memories.optional})</span></label>
                <input type="text" name="title" placeholder={fp.memories.titlePlaceholder} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{fp.memories.dateLabel} <span className="font-normal text-[#adb5ab]">({fp.memories.optional})</span></label>
                <input type="date" name="memory_date" max={new Date().toISOString().slice(0, 10)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>{fp.memories.contentLabel}</label>
              <textarea name="content" required rows={3} placeholder={fp.memories.contentPlaceholder}
                className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] resize-none" />
            </div>
            <SubmitButton pendingLabel={fp.memories.saving}>{fp.memories.addBtn}</SubmitButton>
          </form>

          {(familyMemories ?? []).length > 0 && (
            <div className="space-y-3">
              {(familyMemories as FamilyMemory[]).map(mem => {
                const delMem = deleteFamilyMemoryAction.bind(null, familyId, mem.id)
                const editMem = editFamilyMemoryAction.bind(null, familyId, mem.id)
                return (
                  <details key={mem.id} className="group rounded-2xl border border-[#e5dccb] bg-white overflow-hidden">
                    <summary className="flex cursor-pointer items-start justify-between gap-2 p-5 list-none">
                      <div className="flex-1">
                        {mem.title && <p className="font-semibold text-[#1f2d27]">{mem.title}</p>}
                        {mem.memory_date && <p className="text-[11px] text-[#adb5ab]">{fmtDate(mem.memory_date)}</p>}
                        <p className="mt-1 text-sm leading-6 text-[#4a5e55] line-clamp-2">{mem.content}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 rounded-lg border border-[#e5dccb] px-2.5 py-1 text-[11px] font-medium text-[#788177] group-open:hidden">
                          <Pencil className="h-3 w-3" /> {fp.memories.editBtn}
                        </span>
                        <form action={delMem}>
                          <button type="submit" className="text-[#e5dccb] hover:text-red-400 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </summary>
                    <form action={editMem} className="border-t border-[#e5dccb] bg-[#faf6ef] p-5 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>{fp.memories.titleLabel}</label>
                          <input type="text" name="title" defaultValue={mem.title ?? ''} placeholder={fp.memories.titlePlaceholder} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>{fp.memories.dateLabel}</label>
                          <input type="date" name="memory_date" defaultValue={mem.memory_date?.slice(0, 10) ?? ''} max={new Date().toISOString().slice(0, 10)} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>{fp.memories.contentLabel}</label>
                        <textarea name="content" required rows={3} defaultValue={mem.content}
                          className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-2.5 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] resize-none" />
                      </div>
                      <div className="flex gap-2">
                        <SubmitButton pendingLabel={fp.memories.saving}>
                          <Check className="h-3.5 w-3.5 mr-1 inline" />{fp.editPanel.save}
                        </SubmitButton>
                      </div>
                    </form>
                  </details>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Ziyaretçi Mesajları (Taziye & Anı) ── */}
        {(() => {
          const allFg = familyGuestbook ?? []
          const fgPendingTaziye = allFg.filter(e => e.status === 'pending' && (e.message_type === 'taziye' || !e.message_type))
          const fgPendingAni = allFg.filter(e => e.status === 'pending' && e.message_type === 'ani')
          const fgApprovedTaziye = allFg.filter(e => e.status === 'approved' && (e.message_type === 'taziye' || !e.message_type))
          const fgApprovedAni = allFg.filter(e => e.status === 'approved' && e.message_type === 'ani')
          const totalPending = pending.length + fgPendingTaziye.length + fgPendingAni.length

          const EntryCard = ({ e, showApprove }: { e: typeof allFg[0]; showApprove: boolean }) => {
            const appr = approveFamilyCondolenceAction.bind(null, e.id, familyId)
            const rej = rejectFamilyCondolenceAction.bind(null, e.id, familyId)
            return (
              <div className={`flex gap-3 rounded-xl border p-4 ${showApprove ? 'border-[#e5dccb] bg-[#f9f5ee]' : 'border-[#e5dccb] bg-white/70'}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#174f35]/10 text-sm font-semibold text-[#174f35]">{e.author_name?.[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-medium text-sm text-[#1f2d27]">{e.author_name}</span>
                    <span className="text-[11px] text-[#adb5ab]">{fmtDate(e.created_at)}</span>
                  </div>
                  {e.relation && <p className="text-[11px] text-[#c7a76f] mb-1">{e.relation}</p>}
                  <p className="text-sm text-[#4a5e55]">{e.message}</p>
                  <div className="mt-2 flex gap-2">
                    {showApprove && <form action={appr}><button type="submit" className="rounded-lg bg-[#174f35] px-3 py-1 text-xs font-semibold text-white hover:bg-[#123f2b] transition-colors">{fp.guestbook.approve}</button></form>}
                    <form action={rej}><button type="submit" className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${showApprove ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-[#e5dccb] text-[#adb5ab] hover:text-red-400'}`}>{showApprove ? fp.guestbook.reject : fp.guestbook.remove}</button></form>
                  </div>
                </div>
              </div>
            )
          }

          return (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-semibold text-[#1f2d27]">{fp.guestbook.title}</h2>
              {totalPending > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{totalPending}</span>
              )}
            </div>

            {/* Taziye mesajları */}
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-base">🕊️</span>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#174f35]">{fp.guestbook.condolences}</p>
                {fgPendingTaziye.length > 0 && <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">{fgPendingTaziye.length} {fp.guestbook.pending}</span>}
              </div>
              {fgPendingTaziye.length > 0 && (
                <div className="space-y-2 mb-3">
                  {fgPendingTaziye.map(e => <EntryCard key={e.id} e={e} showApprove={true} />)}
                </div>
              )}
              {fgApprovedTaziye.length > 0 ? (
                <div className="space-y-2">
                  {fgApprovedTaziye.map(e => <EntryCard key={e.id} e={e} showApprove={false} />)}
                </div>
              ) : fgPendingTaziye.length === 0 && (
                <p className="text-sm text-[#adb5ab] italic">{fp.guestbook.emptyCondolences}</p>
              )}
            </div>

            {/* Aile anıları (ziyaretçi) */}
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-base">📖</span>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#174f35]">{fp.guestbook.visitorMemories}</p>
                {fgPendingAni.length > 0 && <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">{fgPendingAni.length} {fp.guestbook.pending}</span>}
              </div>
              {fgPendingAni.length > 0 && (
                <div className="space-y-2 mb-3">
                  {fgPendingAni.map(e => <EntryCard key={e.id} e={e} showApprove={true} />)}
                </div>
              )}
              {fgApprovedAni.length > 0 ? (
                <div className="space-y-2">
                  {fgApprovedAni.map(e => <EntryCard key={e.id} e={e} showApprove={false} />)}
                </div>
              ) : fgPendingAni.length === 0 && (
                <p className="text-sm text-[#adb5ab] italic">{fp.guestbook.emptyMemories}</p>
              )}
            </div>
          </section>
          )
        })()}

        {/* ── Bireysel Profil Taziye Mesajları ── */}
        {vaultIds.length > 0 && (
          <section>
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-semibold text-[#1f2d27]">{fp.profileGuestbook.title}</h2>
              {pending.length > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {pending.length}
                </span>
              )}
            </div>

            {/* Bekleyen */}
            {pending.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#c7a76f]">{fp.profileGuestbook.pendingLabel} ({pending.length})</p>
                <div className="space-y-3">
                  {pending.map(entry => {
                    const approve = approveFamilyGuestbookAction.bind(null, entry.id, entry.vault_id, familyId)
                    const reject = rejectFamilyGuestbookAction.bind(null, entry.id, entry.vault_id, familyId)
                    return (
                      <div key={entry.id} className="flex gap-4 rounded-2xl border border-[#e5dccb] bg-white p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5efdf] text-sm font-semibold text-[#173d31]">
                          {entry.author_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-medium text-[#1f2d27] text-sm">{entry.author_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#f5efdf] px-2 py-0.5 text-[10px] font-semibold text-[#788177]">🪦 {entry.vault_name}</span>
                              <span className="text-[11px] text-[#adb5ab]">{fmtDate(entry.created_at)}</span>
                            </div>
                          </div>
                          {entry.relation && <p className="mb-1 text-[11px] text-[#c7a76f]">{entry.relation}</p>}
                          <p className="text-sm leading-6 text-[#4a5e55]">{entry.message}</p>
                          <div className="mt-3 flex gap-2">
                            <form action={approve}>
                              <button type="submit" className="rounded-lg bg-[#174f35] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#123f2b] transition-colors">{fp.profileGuestbook.approve}</button>
                            </form>
                            <form action={reject}>
                              <button type="submit" className="rounded-lg border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">{fp.profileGuestbook.reject}</button>
                            </form>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Onaylı */}
            {approved.length > 0 ? (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#788177]">{fp.profileGuestbook.approvedLabel} ({approved.length})</p>
                <div className="space-y-2">
                  {approved.map(entry => {
                    const reject = rejectFamilyGuestbookAction.bind(null, entry.id, entry.vault_id, familyId)
                    return (
                      <div key={entry.id} className="flex gap-4 rounded-2xl border border-[#e5dccb] bg-white/70 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efdf] text-sm font-semibold text-[#173d31]">
                          {entry.author_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-medium text-[#1f2d27] text-sm">{entry.author_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[#f5efdf] px-2 py-0.5 text-[10px] font-semibold text-[#788177]">🪦 {entry.vault_name}</span>
                              <span className="text-[11px] text-[#adb5ab]">{fmtDate(entry.created_at)}</span>
                            </div>
                          </div>
                          <p className="text-sm leading-6 text-[#4a5e55]">{entry.message}</p>
                          <form action={reject} className="mt-1">
                            <button type="submit" className="text-[11px] text-[#adb5ab] hover:text-red-400 transition-colors">{fp.profileGuestbook.remove}</button>
                          </form>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : pending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e5dccb] bg-white/50 py-12 text-center">
                <p className="text-3xl mb-2">✉️</p>
                <p className="text-sm text-[#788177]">{fp.profileGuestbook.emptyMsg}</p>
              </div>
            ) : null}
          </section>
        )}

      </main>
    </div>
  )
}
