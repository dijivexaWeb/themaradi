import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import StepperNav from './_StepperNav'
import BasicsForm from './_BasicsForm'
import StoryForm from './_StoryForm'
import PhotoUploadForm from '../fotolar/PhotoUploadForm'
import VideoUploadForm from '../videolar/VideoUploadForm'
import AudioUploadForm from '../ses-kayitlari/AudioUploadForm'
import { advanceOnboardingStep, completeOnboarding } from './actions'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}

export default async function OnboardingPage({ params, searchParams }: Props) {
  const { id } = await params
  const { step: stepParam } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vault } = await supabase
    .from('vaults')
    .select('id, display_name, biography, profession, birth_date, birth_date_precision, death_date, death_date_precision, birth_place, tagline, cover_photo_url, onboarding_step, onboarding_completed_at')
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('product_type', 'memorial_profile')
    .single()

  if (!vault) notFound()

  if (vault.onboarding_completed_at) {
    redirect(`/anma-paneli/${id}`)
  }

  const currentStep = Math.min(5, Math.max(1, Number(stepParam) || vault.onboarding_step || 1))
  const todayMax = new Date().toISOString().slice(0, 16)

  let photoCount = 0
  let videoCount = 0
  let audioCount = 0

  if (currentStep === 2) {
    const { count } = await supabase.from('media').select('id', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'image')
    photoCount = count ?? 0
  }
  if (currentStep === 4) {
    const [{ count: vCount }, { count: aCount }] = await Promise.all([
      supabase.from('media').select('id', { count: 'exact', head: true }).eq('vault_id', id).eq('media_type', 'video'),
      supabase.from('vault_audio_recordings').select('id', { count: 'exact', head: true }).eq('vault_id', id),
    ])
    videoCount = vCount ?? 0
    audioCount = aCount ?? 0
  }

  const advanceTo3 = advanceOnboardingStep.bind(null, id, 3)
  const advanceTo5 = advanceOnboardingStep.bind(null, id, 5)
  const complete = completeOnboarding.bind(null, id)

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl text-[#1f2d27]">Anma Profilinizi Tamamlayın</h1>
          <p className="mt-1 text-sm text-[#788177]">Her adımı istediğiniz zaman panelden tekrar düzenleyebilirsiniz.</p>
        </div>

        <StepperNav currentStep={currentStep} />

        <div className="rounded-3xl border border-[#e5dccb] bg-[#fffdf8] p-6 shadow-[0_4px_24px_rgba(64,48,24,0.06)] sm:p-8">
          {currentStep === 1 && (
            <BasicsForm
              vaultId={id}
              displayName={vault.display_name}
              birthDate={vault.birth_date}
              birthDatePrecision={vault.birth_date_precision}
              deathDate={vault.death_date}
              deathDatePrecision={vault.death_date_precision}
              birthPlace={vault.birth_place}
              tagline={vault.tagline}
              coverPhotoUrl={vault.cover_photo_url}
            />
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-[#4a5e55]">
                {photoCount > 0 ? `${photoCount} fotoğraf eklediniz.` : 'İsterseniz birkaç fotoğraf ekleyin — daha sonra da ekleyebilirsiniz.'}
              </p>
              <PhotoUploadForm vaultId={id} todayMax={todayMax} />
              <form action={advanceTo3}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b]"
                >
                  İleri: Hayat Hikayesi
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {currentStep === 3 && (
            <StoryForm vaultId={id} biography={vault.biography} profession={vault.profession} />
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-[#4a5e55]">
                  🎬 Video {videoCount > 0 ? `(${videoCount} eklendi)` : '(opsiyonel)'}
                </p>
                <VideoUploadForm vaultId={id} todayMax={todayMax} />
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-[#4a5e55]">
                  🎵 Ses Kaydı {audioCount > 0 ? `(${audioCount} eklendi)` : '(opsiyonel)'}
                </p>
                <AudioUploadForm vaultId={id} isLocked={false} />
              </div>
              <form action={advanceTo5}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b]"
                >
                  İleri: Yayın Onayı
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f9f4] text-emerald-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <p className="font-serif text-xl text-[#1f2d27]">Kurulum tamamlandı</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#788177]">
                  Profiliniz yayına alınmadan önce bir doğrulama süreci gerekiyor (belge yükleme + tanık onayı).
                  Bu süreci şimdi başlatabilir ya da panelden istediğiniz zaman tamamlayabilirsiniz.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 pt-2">
                <Link
                  href={`/anma-paneli/${id}/dogrulama`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b]"
                >
                  Doğrulama Sürecini Başlat
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <form action={complete}>
                  <button type="submit" className="text-sm text-[#788177] underline underline-offset-2 hover:text-[#174f35]">
                    Daha sonra yaparım, panele git
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
