import { ArrowRight } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import { saveOnboardingStory } from './actions'

interface Props {
  vaultId: string
  biography: string | null
  profession: string | null
}

export default function StoryForm({ vaultId, biography, profession }: Props) {
  const inputCls = 'w-full rounded-xl border border-[#e5dccb] bg-white px-4 py-3 text-sm text-[#1f2d27] placeholder-[#adb5ab] outline-none focus:border-[#174f35] focus:ring-2 focus:ring-[#174f35]/10'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-[#4a5e55]'

  const action = saveOnboardingStory.bind(null, vaultId)

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className={labelCls}>Meslek</label>
        <input type="text" name="profession" defaultValue={profession ?? ''} placeholder="Öğretmen" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Hayat Hikayesi</label>
        <textarea
          name="biography"
          defaultValue={biography ?? ''}
          rows={8}
          placeholder="Sevdiğiniz kişinin hayatını, anılarını ve önemli anlarını anlatın..."
          className={`${inputCls} resize-none`}
        />
        <p className="mt-1 text-xs text-[#a39a86]">Bu alanı istediğiniz zaman panelden düzenleyebilirsiniz.</p>
      </div>

      <SubmitButton
        pendingLabel="Kaydediliyor..."
        className="inline-flex items-center gap-2 rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b] disabled:opacity-50"
      >
        İleri: Video / Ses
        <ArrowRight className="h-4 w-4 inline ml-1" />
      </SubmitButton>
    </form>
  )
}
