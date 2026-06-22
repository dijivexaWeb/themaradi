import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslation } from '@/i18n/server'
import Link from 'next/link'
import Image from 'next/image'
import BrandLogo from '@/components/BrandLogo'
import LangSwitcherDashboard from '@/components/LangSwitcherDashboard'
import { LogOut, Plus, Users, Star, Settings, Eye } from 'lucide-react'
import QuickPurchaseModal from '@/components/QuickPurchaseModal'
import { fetchPricingConfig } from '@/lib/pricing'

interface Vault {
  id: string
  display_name: string
  status: string
  slug: string | null
  cover_photo_url: string | null
  birth_date: string | null
  death_date: string | null
  tagline: string | null
  product_type: string
}

interface Family {
  id: string
  name: string
  slug: string
  hero_bg_url: string | null
  is_public: boolean
}

function getStatusBadge(status: string, d: { statusPublic: string; statusPending: string; statusPrivate: string; statusDraft: string }) {
  switch (status) {
    case 'public_memorial':      return { cls: 'bg-[#174f35]/15 text-[#174f35]',    label: d.statusPublic }
    case 'pending_verification': return { cls: 'bg-amber-100 text-amber-700',         label: d.statusPending }
    case 'private_memorial':     return { cls: 'bg-slate-100 text-slate-600',         label: d.statusPrivate }
    default:                     return { cls: 'bg-[#f0ebe0] text-[#788177]',         label: d.statusDraft }
  }
}

function getYearRange(birth: string | null, death: string | null): string {
  const by = birth ? new Date(birth).getFullYear() : null
  const dy = death ? new Date(death).getFullYear() : null
  if (by && dy) return `${by} – ${dy}`
  if (by) return `${by} –`
  return ''
}

export default async function ProfillerimPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { t } = await getTranslation()

  const [{ data: vaults }, { data: families }, { data: credits }, { data: memberRows }, { data: platformSettings }, pricing] = await Promise.all([
    supabase
      .from('vaults')
      .select('id, display_name, status, slug, cover_photo_url, birth_date, death_date, tagline, product_type')
      .eq('owner_id', user.id)
      .eq('product_type', 'memorial_profile')
      .order('created_at', { ascending: false }),
    supabase
      .from('memorial_families')
      .select('id, name, slug, hero_bg_url, is_public')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('vault_credits')
      .select('credits')
      .eq('user_id', user.id),
    supabase
      .from('family_members')
      .select('family_id, vault_id'),
    supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', ['bank_iban', 'bank_name', 'bank_recipient', 'paypal_link']),
    fetchPricingConfig(),
  ])

  const ps = Object.fromEntries((platformSettings ?? []).map(r => [r.key, r.value as string]))
  const bankInfo = {
    iban: ps.bank_iban ?? 'GE29TB7522145061700002',
    bankName: ps.bank_name ?? 'Bank of Georgia',
    accountHolder: ps.bank_recipient ?? 'The Eternal Memory LLC',
    amount: pricing.campaignActive && pricing.campaignMemorial
      ? Number(pricing.campaignMemorial)
      : Number(pricing.memorialPrice),
    currency: 'GEL',
  }
  const paypalLink = ps.paypal_link ?? null

  const d = t.memorial_panel.dashboard

  const totalCredits = credits?.reduce((sum, c) => sum + c.credits, 0) ?? 0
  const profileList = (vaults as Vault[]) ?? []
  const familyList = (families as Family[]) ?? []

  // vault_id → family_id map
  const vaultFamilyMap = new Map<string, string>()
  for (const row of (memberRows ?? [])) {
    if (row.family_id && row.vault_id) vaultFamilyMap.set(row.vault_id, row.family_id)
  }

  // family_id → vault listesi
  const familyVaultMap = new Map<string, Vault[]>()
  for (const vault of profileList) {
    const fid = vaultFamilyMap.get(vault.id)
    if (fid) {
      const arr = familyVaultMap.get(fid) ?? []
      arr.push(vault)
      familyVaultMap.set(fid, arr)
    }
  }

  // Ailesiz bireysel profiller
  const standaloneProfiles = profileList.filter(v => !vaultFamilyMap.has(v.id))
  const hasContent = profileList.length > 0 || familyList.length > 0

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[#e5dccb] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <LangSwitcherDashboard className="flex gap-1 items-center" />
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-[#788177] hover:bg-[#f5efdf] hover:text-[#1f2d27] transition-colors">
                <LogOut className="h-3.5 w-3.5" />
                {t.memorial_panel.sidebar.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">

        {/* Üst: Başlık + kredi */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[#1f2d27]">{d.pageTitle}</h1>
            <p className="mt-1 text-sm text-[#788177]">{d.pageSubtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {totalCredits > 0 && (
              <div className="flex items-center gap-2 rounded-2xl border border-[#dfbd72]/50 bg-[#fff9ee] px-4 py-2">
                <Star className="h-4 w-4 text-[#dfbd72]" />
                <span className="text-sm font-semibold text-[#93620f]">{totalCredits} {d.credits}</span>
              </div>
            )}
            <Link
              href="/satin-al"
              className="flex items-center gap-2 rounded-2xl bg-[#1c2e25] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#132118] transition-colors"
            >
              <Plus className="h-4 w-4" />
              {d.buyPackage}
            </Link>
          </div>
        </div>

        {!hasContent ? (
          /* Boş durum */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1c2e25] text-4xl shadow-lg">🪦</div>
            <h2 className="mb-2 font-serif text-2xl text-[#1f2d27]">{d.emptyTitle}</h2>
            <p className="mb-8 max-w-sm text-sm leading-6 text-[#788177]">{d.emptyDesc}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/satin-al?paket=tekli"
                className="rounded-2xl bg-[#1c2e25] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#132118] transition-colors">
                {d.buySingle}
              </Link>
              <Link href="/satin-al?paket=aile"
                className="rounded-2xl border border-[#dfbd72] bg-[#fff9ee] px-8 py-3 text-sm font-semibold text-[#93620f] hover:bg-[#fff3d5] transition-colors">
                {d.buyFamily}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">

            {/* ── AİLE ANMA SAYFALARI (üstte) ── */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold text-[#1f2d27]">
                  {d.familySection}
                  {familyList.length > 0 && <span className="ml-2 text-sm font-normal text-[#788177]">({familyList.length})</span>}
                </h2>
                <Link href="/satin-al?paket=aile"
                  className="flex items-center gap-1.5 rounded-xl border border-[#e5dccb] px-3 py-1.5 text-xs font-medium text-[#4a5e55] hover:bg-[#f5efdf] transition-colors">
                  <Plus className="h-3.5 w-3.5" /> {d.newFamilyBtn}
                </Link>
              </div>

              <div className="space-y-6">
                {familyList.map((family) => {
                  const members = familyVaultMap.get(family.id) ?? []
                  return (
                    <div key={family.id} className="rounded-3xl border border-[#e5dccb] bg-white shadow-sm overflow-hidden">
                      {/* Aile kartı başlık */}
                      <div className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1c2e25] text-white">
                            <Users className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1f2d27] truncate">{family.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#788177]">{members.length} {d.profiles}</span>
                              {family.is_public && (
                                <span className="rounded-full bg-[#174f35]/10 px-2 py-0.5 text-[10px] font-semibold text-[#174f35]">{d.statusPublic}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {family.slug && family.is_public && (
                            <Link href={`/aile/${family.slug}`} target="_blank"
                              className="flex items-center gap-1 rounded-lg border border-[#e5dccb] px-2.5 py-1.5 text-[11px] font-medium text-[#788177] hover:bg-[#f5efdf] transition-colors">
                              <Eye className="h-3.5 w-3.5" /> {d.preview}
                            </Link>
                          )}
                          <Link href={`/anma-paneli/aile/${family.id}`}
                            className="flex items-center gap-1.5 rounded-lg bg-[#1c2e25] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#132118] transition-colors">
                            <Settings className="h-3.5 w-3.5" /> {d.manage}
                          </Link>
                        </div>
                      </div>

                      {/* Profil mezar taşları */}
                      {members.length > 0 && (
                        <div className="border-t border-[#f0ebe0] bg-[#faf7f2] px-5 py-4">
                          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                            {members.map((vault) => {
                              const badge = getStatusBadge(vault.status, d)
                              const years = getYearRange(vault.birth_date, vault.death_date)
                              return (
                                <Link
                                  key={vault.id}
                                  href={`/anma-paneli/${vault.id}`}
                                  className="group flex shrink-0 flex-col overflow-hidden rounded-t-[36px] rounded-b-xl border border-[#e5dccb] bg-white shadow-sm transition-all hover:border-[#174f35]/30 hover:shadow-md w-[120px]"
                                >
                                  {/* Mezar taşı üst */}
                                  <div className="relative flex flex-col items-center pt-5 pb-3 px-2 rounded-t-[36px]"
                                    style={{ background: 'linear-gradient(to bottom, #1c2e25, #0c1f17)', minHeight: '100px' }}>
                                    {vault.cover_photo_url && (
                                      <div className="absolute inset-0 rounded-t-[36px] overflow-hidden">
                                        <Image src={vault.cover_photo_url} alt="" fill className="object-cover opacity-20" unoptimized />
                                      </div>
                                    )}
                                    {/* Dekoratif çizgiler */}
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white/20 rounded-full" />
                                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-white/10 rounded-full" />
                                    <div className="relative z-10 flex flex-col items-center mt-3">
                                      <div className="mb-2 h-10 w-10 overflow-hidden rounded-full border border-white/30 bg-[#2a4535]">
                                        {vault.cover_photo_url ? (
                                          <Image src={vault.cover_photo_url} alt={vault.display_name} width={40} height={40} className="h-full w-full object-cover" unoptimized />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center text-sm text-white/60 font-medium">
                                            {vault.display_name.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-center text-[11px] font-medium text-white leading-tight px-1 line-clamp-2">{vault.display_name}</p>
                                      {years && <p className="mt-0.5 text-[10px] text-white/50">{years}</p>}
                                    </div>
                                  </div>
                                  {/* Alt */}
                                  <div className="px-2 py-2 flex flex-col items-center gap-1">
                                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${badge.cls}`}>{badge.label}</span>
                                    <span className="text-[10px] text-[#174f35] group-hover:text-[#1c2e25] font-medium">{d.editProfile}</span>
                                  </div>
                                </Link>
                              )
                            })}

                            {/* Aile içi yeni profil — modal */}
                            <div className="flex shrink-0 w-[120px] items-center justify-center" style={{ minHeight: '172px' }}>
                              <QuickPurchaseModal
                                familyId={family.id}
                                bankInfo={bankInfo}
                                paypalLink={paypalLink}
                                cardMode
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Üye yoksa CTA */}
                      {members.length === 0 && (
                        <div className="border-t border-[#f0ebe0] bg-[#faf7f2] px-5 py-5 flex items-center justify-between">
                          <p className="text-sm text-[#adb5ab]">{d.noProfiles}</p>
                          <Link href={`/anma-paneli/aile/${family.id}`}
                            className="text-xs font-semibold text-[#174f35] hover:text-[#1c2e25] transition-colors">
                            {d.addProfileLink}
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Yeni aile sayfası dashed card */}
                {familyList.length === 0 && (
                  <Link href="/satin-al?paket=aile"
                    className="group flex min-h-[120px] items-center justify-center rounded-3xl border-2 border-dashed border-[#e5dccb] bg-white/50 transition-all hover:border-[#174f35]/40 hover:bg-[#f9f5ee]">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-[#e5dccb] text-[#c5bba9] group-hover:border-[#174f35]/40 group-hover:text-[#174f35] transition-colors">
                        <Plus className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-[#788177] group-hover:text-[#1f2d27]">{d.newFamilyCard}</p>
                      <p className="text-[11px] text-[#adb5ab]">{d.newFamilyCardSub}</p>
                    </div>
                  </Link>
                )}
              </div>
            </section>

            {/* ── BİREYSEL PROFİLLER (ailede olmayan) ── */}
            {standaloneProfiles.length > 0 && (
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-semibold text-[#1f2d27]">
                    {d.individualSection}
                    <span className="ml-2 text-sm font-normal text-[#788177]">({standaloneProfiles.length})</span>
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {standaloneProfiles.map((vault) => {
                    const badge = getStatusBadge(vault.status, d)
                    const years = getYearRange(vault.birth_date, vault.death_date)
                    return (
                      <Link key={vault.id} href={`/anma-paneli/${vault.id}`}
                        className="group overflow-hidden rounded-t-[60px] rounded-b-2xl border border-[#e5dccb] bg-white shadow-sm transition-all hover:border-[#174f35]/30 hover:shadow-lg">
                        <div className="relative flex flex-col items-center justify-end pb-5 pt-10 rounded-t-[60px]"
                          style={{ background: 'linear-gradient(to bottom, #1c2e25, #0c1f17)', minHeight: '155px' }}>
                          {vault.cover_photo_url && (
                            <div className="absolute inset-0 rounded-t-[60px] overflow-hidden">
                              <Image src={vault.cover_photo_url} alt="" fill className="object-cover opacity-20" unoptimized />
                            </div>
                          )}
                          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-14 h-0.5 bg-white/20 rounded-full" />
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-9 h-0.5 bg-white/10 rounded-full" />
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-2.5 h-14 w-14 overflow-hidden rounded-full border-2 border-white/30 bg-[#2a4535]">
                              {vault.cover_photo_url ? (
                                <Image src={vault.cover_photo_url} alt={vault.display_name} width={56} height={56} className="h-full w-full object-cover" unoptimized />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xl text-white/60">
                                  {vault.display_name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <p className="text-center font-serif text-sm font-medium text-white px-3 leading-snug">{vault.display_name}</p>
                            {years && <p className="mt-0.5 text-[11px] text-white/50 tracking-widest">{years}</p>}
                          </div>
                        </div>
                        <div className="px-4 py-2.5">
                          <div className="flex items-center justify-between">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badge.cls}`}>{badge.label}</span>
                            <span className="text-xs font-medium text-[#174f35] group-hover:text-[#1c2e25]">{d.editProfile}</span>
                          </div>
                          {vault.tagline && <p className="mt-1 text-[11px] text-[#788177] line-clamp-1">{vault.tagline}</p>}
                        </div>
                      </Link>
                    )
                  })}

                  <Link href="/satin-al"
                    className="group flex flex-col items-center justify-center rounded-t-[60px] rounded-b-2xl border-2 border-dashed border-[#e5dccb] bg-white/50 text-center transition-all hover:border-[#174f35]/40 hover:bg-[#f9f5ee]"
                    style={{ minHeight: '220px' }}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[#e5dccb] text-[#c5bba9] mb-3 group-hover:border-[#174f35]/40 group-hover:text-[#174f35] transition-colors">
                      <Plus className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-[#788177] group-hover:text-[#1f2d27]">{d.addNewProfile}</p>
                    <p className="mt-1 text-[11px] text-[#adb5ab]">
                      {totalCredits > 0 ? `${totalCredits} ${d.hasCredits}` : d.buyOrUseCredits}
                    </p>
                  </Link>
                </div>
              </section>
            )}

            {/* Aile sayfası var ama ailesiz profil yok → cross-sell yok (zaten ailedeler) */}
            {standaloneProfiles.length === 0 && familyList.length > 0 && profileList.length === 0 && (
              <section>
                <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-white/50 px-8 py-10 text-center">
                  <p className="text-sm text-[#788177]">{d.familyManageHint}</p>
                </div>
              </section>
            )}

          </div>
        )}
      </main>
    </div>
  )
}
