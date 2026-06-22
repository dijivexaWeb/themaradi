import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  approveGuestbookEntryAction,
  rejectGuestbookEntryAction,
} from '@/lib/actions/condolences'
import { ACTION_ICON_MAP } from '@/lib/memorial-style-templates'
import SectionHeader from '../_SectionHeader'
import { getTranslation } from '@/i18n/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MemorialTaziyePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { t } = await getTranslation()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, status')
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()
  if (!vault) notFound()

  const [
    { data: pending },
    { data: approved },
    { data: actions },
  ] = await Promise.all([
    supabase
      .from('guestbook_entries')
      .select('*')
      .eq('vault_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('guestbook_entries')
      .select('*')
      .eq('vault_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
    supabase
      .from('memorial_actions')
      .select('id, label, icon, count')
      .eq('memorial_id', id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  const rowCls =
    'flex items-start gap-3 rounded-xl border border-[#e5dccb] bg-white p-4'
  const avatarCls =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c7a76f]/30 bg-[#f5efdf] text-sm font-semibold text-[#173d31]'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        

        <SectionHeader title={t.memorial_panel.pages.guestbook.title} icon="📖" />

        {/* Anma aksiyonları */}
        {(actions?.length ?? 0) > 0 && (
          <div className={`mb-8 grid gap-4 ${(actions!.length <= 3) ? `grid-cols-${actions!.length}` : 'grid-cols-2 sm:grid-cols-4'}`}>
            {actions!.map(action => (
              <div
                key={action.id}
                className="rounded-2xl border border-[#e5dccb] bg-white p-5 text-center shadow-sm"
              >
                <div className="mb-1 text-3xl">{ACTION_ICON_MAP[action.icon as keyof typeof ACTION_ICON_MAP] ?? action.icon}</div>
                <div className="font-serif text-2xl text-[#1f2d27]">
                  {(action.count ?? 0).toLocaleString('tr-TR')}
                </div>
                <div className="mt-0.5 text-xs text-[#788177]">{action.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bekleyen mesajlar */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-[#1f2d27]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c7a76f] text-[10px] font-bold text-white">
                {(pending?.length ?? 0) > 99 ? '99+' : (pending?.length ?? 0)}
              </span>
              Bekleyen Mesajlar
            </h2>
          </div>

          {!pending?.length ? (
            <div className="rounded-2xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-10 text-center">
              <p className="mb-2 text-3xl">✉️</p>
              <p className="text-sm text-[#788177]">Bekleyen mesaj yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(entry => {
                const approve = approveGuestbookEntryAction.bind(null, entry.id, id)
                const reject = rejectGuestbookEntryAction.bind(null, entry.id, id)
                return (
                  <div key={entry.id} className={rowCls}>
                    <div className={avatarCls}>
                      {entry.author_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-[#1f2d27]">
                          {entry.author_name}
                        </span>
                        <span className="text-[11px] text-[#adb5ab]">
                          {new Date(entry.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {entry.relation && (
                        <p className="mb-1 text-[11px] text-[#c7a76f]">{entry.relation}</p>
                      )}
                      <p className="text-sm leading-6 text-[#4a5e55]">{entry.message}</p>
                      <div className="mt-3 flex gap-2">
                        <form action={approve}>
                          <button
                            type="submit"
                            className="rounded-lg bg-[#174f35] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#123f2b]"
                          >
                            {t.memorial_panel.pages.guestbook.approve}
                          </button>
                        </form>
                        <form action={reject}>
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                          >
                            {t.memorial_panel.pages.guestbook.reject}
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
          <h2 className="mb-4 font-semibold text-[#1f2d27]">
            {t.memorial_panel.pages.guestbook.tabApproved}
            <span className="ml-2 text-sm font-normal text-[#788177]">
              ({approved?.length ?? 0})
            </span>
          </h2>

          {!approved?.length ? (
            <div className="rounded-2xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-10 text-center">
              <p className="mb-2 text-3xl">🕊️</p>
              <p className="text-sm text-[#788177]">{t.memorial_panel.pages.guestbook.emptyTitle}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map(entry => {
                const reject = rejectGuestbookEntryAction.bind(null, entry.id, id)
                return (
                  <div key={entry.id} className={`${rowCls} opacity-90`}>
                    <div className={avatarCls}>
                      {entry.author_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-[#1f2d27]">
                          {entry.author_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#174f35]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#174f35]">
                            Yayında
                          </span>
                          <span className="text-[11px] text-[#adb5ab]">
                            {new Date(entry.created_at).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      {entry.relation && (
                        <p className="mb-1 text-[11px] text-[#c7a76f]">{entry.relation}</p>
                      )}
                      <p className="text-sm leading-6 text-[#4a5e55]">{entry.message}</p>
                      <form action={reject} className="mt-2">
                        <button
                          type="submit"
                          className="text-[11px] text-[#adb5ab] transition-colors hover:text-red-400"
                        >
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
