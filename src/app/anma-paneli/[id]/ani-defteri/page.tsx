import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { approveMemoryAction, rejectMemoryAction } from '@/lib/actions/memory'
import AddOwnerMemoryForm from './_AddOwnerMemoryForm'

interface Props {
  params: Promise<{ id: string }>
}

interface MemoryEntry {
  id: string
  author_name: string
  relation: string | null
  memory_text: string
  photo_url: string | null
  author_email: string | null
  created_at: string
  status: string
}

export default async function AniDefteri({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
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

  const [{ data: pendingRaw }, { data: approvedRaw }] = await Promise.all([
    supabase
      .from('memory_book_entries')
      .select('id, author_name, relation, memory_text, photo_url, author_email, created_at, status')
      .eq('vault_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('memory_book_entries')
      .select('id, author_name, relation, memory_text, photo_url, author_email, created_at, status')
      .eq('vault_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false }),
  ])

  const pending = (pendingRaw ?? []) as MemoryEntry[]
  const approved = (approvedRaw ?? []) as MemoryEntry[]

  const rowCls = 'flex items-start gap-3 rounded-xl border border-[#e5dccb] bg-white p-4'
  const avatarCls = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c7a76f]/30 bg-[#f5efdf] text-sm font-semibold text-[#173d31]'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-2 text-sm">
          <Link href={`/anma-paneli/${id}`} className="text-[#788177] transition-colors hover:text-[#174f35]">
            {vault.display_name}
          </Link>
          <span className="text-[#c8bfb0]">/</span>
          <span className="font-semibold text-[#22362e]">Anı Defteri</span>
        </div>

        <div className="mb-7">
          <h1 className="font-serif text-3xl text-[#1f2d27]">Anı Defteri</h1>
          <p className="mt-1 text-sm text-[#788177]">
            Anı ekleyin, ziyaretçi anılarını onaylayın veya kaldırın.
          </p>
        </div>

        {/* Owner add form */}
        <AddOwnerMemoryForm vaultId={id} vaultName={vault.display_name} />

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#e5dccb] bg-white p-5 text-center shadow-sm">
            <div className="font-serif text-3xl text-[#1f2d27]">{pending.length}</div>
            <div className="mt-0.5 text-xs text-[#788177]">Bekleyen</div>
          </div>
          <div className="rounded-2xl border border-[#e5dccb] bg-white p-5 text-center shadow-sm">
            <div className="font-serif text-3xl text-[#1f2d27]">{approved.length}</div>
            <div className="mt-0.5 text-xs text-[#788177]">Yayında</div>
          </div>
        </div>

        {/* Pending */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 font-semibold text-[#1f2d27]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c7a76f] text-[10px] font-bold text-white">
                {pending.length > 99 ? '99+' : pending.length}
              </span>
              Bekleyen Anılar
            </h2>
          </div>

          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-10 text-center">
              <p className="mb-2 text-3xl">📖</p>
              <p className="text-sm text-[#788177]">Bekleyen anı yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(entry => {
                const approve = approveMemoryAction.bind(null, entry.id, id)
                const reject = rejectMemoryAction.bind(null, entry.id, id)
                return (
                  <div key={entry.id} className={rowCls}>
                    {entry.photo_url ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f5efdf]">
                        <Image src={entry.photo_url} alt="" fill sizes="64px" className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className={avatarCls}>{entry.author_name[0]?.toUpperCase() ?? '?'}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1f2d27]">{entry.author_name}</span>
                          {entry.relation && (
                            <span className="rounded-full border border-[#c7a76f]/30 bg-[#fdf7ed] px-2 py-0.5 text-[11px] text-[#b08340]">
                              {entry.relation}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#adb5ab]">
                          {new Date(entry.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-[#4a5e55] line-clamp-3">{entry.memory_text}</p>
                      {entry.author_email && (
                        <p className="mt-1 text-[11px] text-[#adb5ab]">{entry.author_email}</p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <form action={approve}>
                          <button type="submit" className="rounded-lg bg-[#174f35] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#123f2b]">
                            Onayla
                          </button>
                        </form>
                        <form action={reject}>
                          <button type="submit" className="rounded-lg border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50">
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

        {/* Approved */}
        <div>
          <h2 className="mb-4 font-semibold text-[#1f2d27]">
            Yayında
            <span className="ml-2 text-sm font-normal text-[#788177]">({approved.length})</span>
          </h2>

          {approved.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-10 text-center">
              <p className="mb-2 text-3xl">🕊️</p>
              <p className="text-sm text-[#788177]">Henüz yayında anı yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map(entry => {
                const reject = rejectMemoryAction.bind(null, entry.id, id)
                return (
                  <div key={entry.id} className={`${rowCls} opacity-90`}>
                    {entry.photo_url ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f5efdf]">
                        <Image src={entry.photo_url} alt="" fill sizes="64px" className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className={avatarCls}>{entry.author_name[0]?.toUpperCase() ?? '?'}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1f2d27]">{entry.author_name}</span>
                          {entry.relation && (
                            <span className="rounded-full border border-[#c7a76f]/30 bg-[#fdf7ed] px-2 py-0.5 text-[11px] text-[#b08340]">
                              {entry.relation}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-[#174f35]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#174f35]">Yayında</span>
                          <span className="text-[11px] text-[#adb5ab]">
                            {new Date(entry.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-6 text-[#4a5e55] line-clamp-3">{entry.memory_text}</p>
                      <form action={reject} className="mt-2">
                        <button type="submit" className="text-[11px] text-[#adb5ab] transition-colors hover:text-red-400">
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
