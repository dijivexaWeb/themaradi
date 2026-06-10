import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function WitnessConfirmPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorPage message="Geçersiz bağlantı. Lütfen email'inizdeki linki kullanın." />
  }

  const supabase = await createServiceClient()

  const { data: witness } = await supabase
    .from('memorial_witnesses')
    .select('id, full_name, status, vault_id, vaults(display_name)')
    .eq('token', token)
    .single()

  if (!witness) {
    return <ErrorPage message="Bu doğrulama linki geçersiz veya süresi dolmuş." />
  }

  if (witness.status === 'confirmed') {
    const name = (witness.vaults as { display_name?: string } | null)?.display_name ?? ''
    return (
      <ResultPage
        icon="✓"
        iconCls="bg-[#174f35]"
        title="Zaten Onaylandı"
        desc={`${witness.full_name}, ${name} için şahitliğiniz daha önce onaylanmıştır. Teşekkür ederiz.`}
      />
    )
  }

  // Onay işlemi
  const { error } = await supabase
    .from('memorial_witnesses')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', witness.id)

  if (error) {
    return <ErrorPage message="Onay sırasında bir hata oluştu. Lütfen tekrar deneyin." />
  }

  const vaultName = (witness.vaults as { display_name?: string } | null)?.display_name ?? ''

  return (
    <ResultPage
      icon="✓"
      iconCls="bg-[#174f35]"
      title="Şahitliğiniz Onaylandı"
      desc={`${witness.full_name}, ${vaultName} adına hazırlanan anma sayfası için şahitliğinizi başarıyla onayladınız. Duyarlılığınız için teşekkür ederiz.`}
    />
  )
}

function ErrorPage({ message }: { message: string }) {
  return (
    <ResultPage
      icon="✗"
      iconCls="bg-red-600"
      title="Hata"
      desc={message}
    />
  )
}

function ResultPage({ icon, iconCls, title, desc }: { icon: string; iconCls: string; title: string; desc: string }) {
  return (
    <div className="min-h-screen bg-[#fbf8f1] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl border border-[#e5dccb] bg-white p-10 text-center shadow-[0_8px_40px_rgba(64,48,24,0.08)]">
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white ${iconCls}`}>
          {icon}
        </div>
        <h1 className="mb-3 font-serif text-2xl text-[#1f2d27]">{title}</h1>
        <p className="mb-8 text-sm leading-7 text-[#788177]">{desc}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#e5dccb] px-5 py-2.5 text-sm font-medium text-[#788177] transition hover:bg-[#f5efdf]"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
