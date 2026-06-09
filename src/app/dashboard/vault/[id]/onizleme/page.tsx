import { createClient } from '@/lib/supabase/server'
import { createPreviewToken } from '@/lib/preview-token'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import RealMemorialPage from '@/app/memorial/[slug]/RealMemorialPage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OnizlemePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!vault) notFound()

  const requestHeaders = await headers()
  const host = requestHeaders.get('host') ?? 'localhost:3000'
  const proto = requestHeaders.get('x-forwarded-proto') ?? 'http'
  const previewToken = createPreviewToken(id)
  const shareUrl = `${proto}://${host}/preview/${id}?token=${previewToken}`

  return (
    <div className="[&>div]:!pt-0">
      <div className="sticky top-0 z-50 border-b border-[#d8bd78] bg-[#fff8e6] px-4 py-3 text-[#3d2f12] shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Paylaşılabilir önizleme linki</p>
            <p className="text-[#725212]">Bu linki bilen kişi giriş yapmadan bu önizlemeyi görebilir.</p>
          </div>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all rounded-lg border border-[#d8bd78] bg-white/70 px-3 py-2 font-mono text-[11px] text-[#174f35] hover:bg-white"
          >
            {shareUrl}
          </a>
        </div>
      </div>
      <RealMemorialPage vault={vault} isPreview />
    </div>
  )
}
