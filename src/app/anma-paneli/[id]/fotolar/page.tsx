import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { addMemorialPhotoAction } from '../actions'
import { updateMediaAction, deleteMediaAction } from '@/lib/actions/media'
import SubmitButton from '@/components/SubmitButton'
import PhotoUploadForm from './PhotoUploadForm'
import SectionHeader from '../_SectionHeader'
import { getTranslation } from '@/i18n/server'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

const PHOTO_LIMIT = 50

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0') +
    'T' +
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0')
  )
}

export default async function MemorialFotolarPage({ params, searchParams }: Props) {
  const { id } = await params
  const { edit: editId } = await searchParams
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

  const { data: photos } = await supabase
    .from('media')
    .select('*')
    .eq('vault_id', id)
    .eq('media_type', 'image')
    .order('sort_order', { ascending: true })

  const isLocked = vault.status === 'pending_verification'
  const atLimit = (photos?.length ?? 0) >= PHOTO_LIMIT
  const addPhoto = addMemorialPhotoAction.bind(null, id)
  const editingPhoto = editId ? photos?.find(p => p.id === editId) : null
  const todayMax = new Date().toISOString().slice(0, 16)
  const returnPath = `/anma-paneli/${id}/fotolar`

  const inputCls =
    'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeader title={t.memorial_panel.pages.photos.title} icon="📷" subtitle={`${photos?.length ?? 0} / ${PHOTO_LIMIT} ${t.memorial_panel.sidebar.photos.toLowerCase()}`} />

        {isLocked && (
          <div className="mb-5 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            {t.memorial_panel.pages.common.lockedMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">

        {/* SOL: Galeri + edit formu */}
        <div className="flex-1 min-w-0">

        {/* Düzenleme formu */}
        {editingPhoto && !isLocked && (
          <div className="mb-8 rounded-3xl border border-[#c7a76f]/40 bg-[#fff9ee] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-[#1f2d27]">
                <span>✏️</span> {t.memorial_panel.pages.photos.editTitle}
              </h2>
              <Link href={returnPath} className="text-xs text-[#788177] hover:text-[#174f35]">
                {t.memorial_panel.pages.common.cancel}
              </Link>
            </div>
            <div className="mb-5 flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#e5dccb] bg-[#f5efdf]">
                <Image
                  src={editingPhoto.thumb_url ?? editingPhoto.original_url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="mt-1 text-xs leading-5 text-[#788177]">
                {t.memorial_panel.pages.photos.editNote}
              </p>
            </div>
            <form
              action={updateMediaAction.bind(null, editingPhoto.id, id, returnPath)}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{t.memorial_panel.pages.photos.fieldName}</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingPhoto.original_filename ?? ''}
                    placeholder="Piknik, 1985"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t.memorial_panel.pages.photos.fieldDate}</label>
                  <input
                    type="datetime-local"
                    name="taken_at"
                    max={todayMax}
                    defaultValue={toDatetimeLocal(editingPhoto.taken_at)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{t.memorial_panel.pages.photos.fieldVisibility}</label>
                  <select
                    name="visibility"
                    defaultValue={editingPhoto.is_public ? 'public' : 'private'}
                    className="w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] outline-none focus:border-[#174f35]"
                  >
                    <option value="private">{t.memorial_panel.pages.common.private}</option>
                    <option value="public">{t.memorial_panel.pages.common.public}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t.memorial_panel.pages.photos.fieldCaption}</label>
                  <input
                    type="text"
                    name="caption"
                    defaultValue={(editingPhoto as Record<string, unknown>).caption as string ?? ''}
                    className={inputCls}
                  />
                </div>
              </div>
              <SubmitButton pendingLabel={t.memorial_panel.pages.common.saving}>{t.memorial_panel.pages.common.save}</SubmitButton>
            </form>
          </div>
        )}

        {/* Galeri */}
        {!photos?.length ? (
          <div className="rounded-3xl border border-dashed border-[#e5dccb] bg-[#fffdf8] py-20 text-center">
            <p className="mb-4 text-6xl">📷</p>
            <p className="mb-1 font-serif text-xl text-[#1f2d27]">{t.memorial_panel.pages.photos.emptyTitle}</p>
            <p className="mx-auto max-w-xs text-sm text-[#788177]">
              {t.memorial_panel.pages.photos.emptyText}
            </p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {photos.map(photo => {
              const del = deleteMediaAction.bind(null, id, photo.id)
              const isEditing = photo.id === editId
              return (
                <div
                  key={photo.id}
                  className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border bg-white transition-all ${
                    isEditing
                      ? 'border-[#c7a76f]'
                      : 'border-[#e5dccb] hover:border-[#174f35]/20 hover:shadow-md'
                  }`}
                >
                  <Image
                    src={photo.thumb_url ?? photo.original_url}
                    alt={photo.original_filename ?? 'Fotoğraf'}
                    width={0}
                    height={0}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ width: '100%', height: 'auto' }}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute left-2 top-2">
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        photo.is_public ? 'bg-[#174f35] text-white' : 'bg-black/50 text-white'
                      }`}
                    >
                      {photo.is_public ? t.memorial_panel.pages.common.public : t.memorial_panel.pages.common.private}
                    </span>
                  </div>
                  {!isLocked && (
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`${returnPath}?edit=${photo.id}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e5dccb] bg-white/90 text-xs text-[#174f35] shadow-sm hover:bg-[#f5efdf]"
                        title="Düzenle"
                      >
                        ✏️
                      </Link>
                      <form action={del}>
                        <button
                          type="submit"
                          className="h-6 w-6 rounded-full border border-red-200 bg-white/90 text-xs font-bold text-red-500 shadow-sm hover:bg-red-50"
                          title="Sil"
                        >
                          ×
                        </button>
                      </form>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                    {photo.taken_at && (
                      <p className="mb-0.5 text-[10px] text-white/80">
                        {new Date(photo.taken_at).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                    {(photo as Record<string, unknown>).caption && (
                      <p className="line-clamp-2 text-xs leading-4 text-white">
                        {(photo as Record<string, unknown>).caption as string}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </div>{/* /SOL */}

        {/* SAĞ: Upload + sayaç sticky */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border border-[#e5dccb] bg-white px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#4a5e55]">{t.memorial_panel.pages.photos.counter}</span>
                <span className="text-sm font-bold text-[#174f35]">{photos?.length ?? 0} / {PHOTO_LIMIT}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#f0ebe0] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#174f35] transition-all"
                  style={{ width: `${Math.min(100, ((photos?.length ?? 0) / PHOTO_LIMIT) * 100)}%` }}
                />
              </div>
            </div>

            {!isLocked && !atLimit && !editingPhoto && (
              <PhotoUploadForm vaultId={id} todayMax={todayMax} />
            )}
            {atLimit && !isLocked && (
              <div className="rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-4 py-3 text-xs text-[#725212]">
                {t.memorial_panel.pages.photos.limitReached} ({PHOTO_LIMIT}/{PHOTO_LIMIT})
              </div>
            )}
          </div>
        </div>

        </div>{/* /2col */}
      </div>
    </div>
  )
}
