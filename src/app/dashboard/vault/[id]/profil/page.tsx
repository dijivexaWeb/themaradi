import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { saveVaultProfileAction } from '@/lib/actions/vault'
import PersonHeader from '../_PersonHeader'
import ProfileWizardForm from '@/components/ProfileWizardForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; error?: string; step?: string }>
}

export default async function ProfilPage({ params, searchParams }: Props) {
  const { id } = await params
  const { saved, error } = await searchParams
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

  const isLocked = vault.status === 'pending_verification'
  const saveProfile = saveVaultProfileAction.bind(null, id)

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <PersonHeader vault={vault} sectionLabel="Kişisel Bilgiler" sectionIcon="🧍" />

        {saved === '1' && (
          <div className="mb-6 rounded-2xl border border-[#b9dfc2] bg-[#edf8ef] px-5 py-4 text-sm font-medium text-[#176b3f] animate-fade-in">
            Kişisel bilgiler kaydedildi.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        {isLocked && (
          <div className="mb-6 rounded-2xl border border-[#dfbd72]/50 bg-[#fff7e6] px-5 py-4 text-sm text-[#725212]">
            Ödeme doğrulandıktan sonra kayıt yapabilirsiniz. Şimdilik bakabilirsiniz.
          </div>
        )}

        {/* Wizard Form */}
        <ProfileWizardForm vault={vault} saveProfileAction={saveProfile} isLocked={isLocked} />
      </div>
    </div>
  )
}
