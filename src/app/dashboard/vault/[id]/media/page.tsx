import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Props { params: Promise<{ id: string }> }

export default async function MediaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase.from('vaults').select('id, display_name').eq('id', id).eq('owner_id', user.id).single()
  if (!vault) notFound()

  const { data: mediaItems } = await supabase
    .from('media')
    .select('*')
    .eq('vault_id', id)
    .order('sort_order', { ascending: true })

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-300">Kasalar</Link>
          <span>/</span>
          <Link href={`/dashboard/vault/${id}`} className="hover:text-slate-300">{vault.display_name}</Link>
          <span>/</span>
          <span className="text-slate-300">Medya</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Medya</h1>
            <p className="text-sm text-slate-500 mt-1">{mediaItems?.length ?? 0} dosya</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-4 py-2 rounded-xl">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            R2 yukleme yakinda
          </div>
        </div>

        {!mediaItems?.length ? (
          <div className="glass border border-slate-800/60 border-dashed rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-300 mb-2">Henuz medya yok</h2>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Fotograf, video, ses kaydi ve belgelerinizi buraya yukleyeceksiniz.
              Cloudflare R2 entegrasyonu yakin zamanda aktif olacak.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <div key={item.id} className="glass border border-slate-800/60 rounded-xl overflow-hidden group hover:border-amber-500/30 transition-all">
                {item.media_type === 'image' && item.thumb_url ? (
                  <div className="aspect-square relative bg-slate-800">
                    <Image src={item.thumb_url} alt={item.original_filename ?? ''} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square bg-slate-800/60 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <div className="text-xs text-slate-300 truncate">{item.original_filename ?? 'Dosya'}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {item.file_size_bytes ? `${(item.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
