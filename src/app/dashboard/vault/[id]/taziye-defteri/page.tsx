import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { approveGuestbookEntryAction, rejectGuestbookEntryAction } from '@/lib/actions/condolences'
import PersonHeader from '../_PersonHeader'

interface Props { params: Promise<{ id: string }> }

export default async function TaziyeDefteri({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, status, product_type, cover_photo_url, birth_date, death_date')
    .eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const [
    { data: pending },
    { data: approved },
    { data: reactions },
  ] = await Promise.all([
    supabase.from('guestbook_entries').select('*').eq('vault_id', id).eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('guestbook_entries').select('*').eq('vault_id', id).eq('status', 'approved').order('created_at', { ascending: false }),
    supabase.from('memorial_reactions').select('reaction_type').eq('vault_id', id),
  ])

  const reactionData = (reactions ?? []) as { reaction_type: string }[]
  const counts = {
    candle: reactionData.filter((r) => r.reaction_type === 'candle').length,
    flower: reactionData.filter((r) => r.reaction_type === 'flower').length,
    prayer: reactionData.filter((r) => r.reaction_type === 'prayer').length,
  }

  const rowCls = 'flex items-start gap-3 rounded-xl border border-[#e5dccb] bg-white p-4'
  const avatarCls = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c7a76f]/30 bg-[#f5efdf] text-sm font-semibold text-[#173d31]'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm mb-5">
          <Link href="/dashboard" className="text-[#788177] hover:text-[#174f35] transition-colors">Anı Alanım</Link>
          <span className="text-[#c8bfb0]">/</span>
          <Link href={`/dashboard/vault/${id}`} className="text-[#788177] hover:text-[#174f35] transition-colors">{vault.display_name}</Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Taziye Defteri</span>
        </div>

        <PersonHeader vault={vault} sectionLabel="Taziye Defteri" sectionIcon="🕊️" />

        {/* Tepki sayaçları */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { emoji: '🕯️', label: 'Mum yakıldı', count: counts.candle },
            { emoji: '🌹', label: 'Çiçek bırakıldı', count: counts.flower },
            { emoji: '🤲', label: 'Dua edildi', count: counts.prayer },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[#e5dccb] bg-white p-5 text-center shadow-sm">
              <div className="text-3xl mb-1">{stat.emoji}</div>
              <div className="font-serif text-2xl text-[#1f2d27]">{stat.count.toLocaleString('tr-TR')}</div>
              <div className="text-xs text-[#788177] mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bekleyen mesajlar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1f2d27] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c7a76f] text-[10px] font-bold text-white">
                {(pending?.length ?? 0) > 99 ? '99+' : (pending?.length ?? 0)}
              </span>
              Bekleyen Mesajlar
            </h2>
          </div>

          {!pending?.length ? (
            <div className="rounded-2xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-10 text-center">
              <p className="text-3xl mb-2">✉️</p>
              <p className="text-sm text-[#788177]">Bekleyen mesaj yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((entry) => {
                const approve = approveGuestbookEntryAction.bind(null, entry.id, id)
                const reject = rejectGuestbookEntryAction.bind(null, entry.id, id)
                return (
                  <div key={entry.id} className={rowCls}>
                    <div className={avatarCls}>{entry.author_name?.[0]?.toUpperCase() ?? '?'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                        <span className="font-medium text-[#1f2d27] text-sm">{entry.author_name}</span>
                        <span className="text-[11px] text-[#adb5ab]">
                          {new Date(entry.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      {entry.relation && (
                        <p className="text-[11px] text-[#c7a76f] mb-1">{entry.relation}</p>
                      )}
                      <p className="text-sm text-[#4a5e55] leading-6">{entry.message}</p>
                      <div className="mt-3 flex gap-2">
                        <form action={approve}>
                          <button type="submit"
                            className="rounded-lg bg-[#174f35] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#123f2b] transition-colors">
                            Onayla
                          </button>
                        </form>
                        <form action={reject}>
                          <button type="submit"
                            className="rounded-lg border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                            Reddet
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Onaylanmış mesajlar */}
        <div>
          <h2 className="font-semibold text-[#1f2d27] mb-4">
            Onaylanmış Mesajlar
            <span className="ml-2 text-sm font-normal text-[#788177]">({approved?.length ?? 0})</span>
          </h2>

          {!approved?.length ? (
            <div className="rounded-2xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-10 text-center">
              <p className="text-3xl mb-2">🕊️</p>
              <p className="text-sm text-[#788177]">Henüz onaylanmış mesaj yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map((entry) => {
                const reject = rejectGuestbookEntryAction.bind(null, entry.id, id)
                return (
                  <div key={entry.id} className={`${rowCls} opacity-90`}>
                    <div className={avatarCls}>{entry.author_name?.[0]?.toUpperCase() ?? '?'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                        <span className="font-medium text-[#1f2d27] text-sm">{entry.author_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#174f35]/10 text-[#174f35] font-semibold">Yayında</span>
                          <span className="text-[11px] text-[#adb5ab]">
                            {new Date(entry.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      {entry.relation && (
                        <p className="text-[11px] text-[#c7a76f] mb-1">{entry.relation}</p>
                      )}
                      <p className="text-sm text-[#4a5e55] leading-6">{entry.message}</p>
                      <form action={reject} className="mt-2">
                        <button type="submit"
                          className="text-[11px] text-[#adb5ab] hover:text-red-400 transition-colors">
                          Kaldır
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
