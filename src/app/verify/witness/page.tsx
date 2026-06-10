import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import Link from 'next/link'

function verificationApprovedEmailHtml(ownerName: string, vaultName: string, dashboardUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Georgia,serif;background:#fbf8f1;margin:0;padding:0;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border:1px solid #e6dccb;border-radius:16px;overflow:hidden;">
    <div style="background:#174f35;padding:28px 32px;text-align:center;">
      <p style="margin:0;color:#c7a76f;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;">The Eternal Memory</p>
    </div>
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 16px;font-size:20px;color:#1f2d27;">Anma Sayfanız Doğrulandı</h2>
      <p style="color:#4a5e55;line-height:1.8;margin:0 0 16px;">Sayın ${ownerName},</p>
      <p style="color:#4a5e55;line-height:1.8;margin:0 0 16px;">
        <strong>${vaultName}</strong> için hazırlanan anma sayfası, gerekli belgeler ve şahit onayları incelenerek doğrulanmıştır.
      </p>
      <p style="color:#4a5e55;line-height:1.8;margin:0 0 24px;">
        Bu zorlu süreçte gösterdiğiniz sabır ve anlayış için teşekkür ederiz. Sevdiklerinizin anısını yaşatma çabanıza saygıyla eşlik etmekten onur duyuyoruz.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#174f35;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:600;">
          Anma Sayfasını Yayına Al →
        </a>
      </div>
      <p style="color:#8a7a64;font-size:12px;line-height:1.8;margin:24px 0 0;">
        Saygılarımızla,<br>
        The Eternal Memory ekibi
      </p>
    </div>
  </div>
</body></html>`
}

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

  // 2+ şahit + belge onaylıysa vault'u private_memorial yap ve owner'a email gönder
  const vaultId = witness.vault_id
  const [{ count: confirmedCount }, { data: approvedDoc }] = await Promise.all([
    supabase.from('memorial_witnesses')
      .select('id', { count: 'exact', head: true })
      .eq('vault_id', vaultId).eq('status', 'confirmed'),
    supabase.from('memorial_verification_docs')
      .select('id').eq('vault_id', vaultId).eq('status', 'approved').limit(1).maybeSingle(),
  ])

  if ((confirmedCount ?? 0) >= 2 && approvedDoc) {
    const { data: vault } = await supabase
      .from('vaults')
      .select('status, display_name, profiles!vaults_owner_id_fkey(full_name, email)')
      .eq('id', vaultId)
      .single()

    if (vault && vault.status !== 'private_memorial' && vault.status !== 'public_memorial') {
      await supabase.from('vaults').update({ status: 'private_memorial' }).eq('id', vaultId)

      const owner = vault ? (Array.isArray((vault as Record<string, unknown>).profiles) ? ((vault as Record<string, unknown>).profiles as Record<string, unknown>[])[0] : (vault as Record<string, unknown>).profiles) as Record<string, unknown> | null : null
      const ownerEmail = owner?.email as string | null
      const ownerName = (owner?.full_name as string | null) ?? 'Değerli Kullanıcı'
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theeternalmemory.com'

      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `${vault.display_name} — Anma sayfanız doğrulandı`,
          html: verificationApprovedEmailHtml(ownerName, vault.display_name as string ?? '', `${baseUrl}/anma-paneli/${vaultId}/dogrulama`),
        })
      }
    }
  }

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
