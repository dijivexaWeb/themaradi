import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { HardDrive, Database, Cloud, User, FileVideo, Image, Music, FileText, Zap, Activity } from 'lucide-react'
import { CleanOrphansButton, CleanDeletedVaultsButton } from './_CleanupActions'

export const revalidate = 300 // 5 min cache

const R2_FREE_STORAGE_GB = 10

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(3)} GB`
}

function extractVaultId(key: string): string | null {
  const m = key.match(/^(?:profiles|photos)\/([^/]+)\//)
  return m ? m[1] : null
}

function fileCategory(key: string): string {
  if (/\/cover-video\//.test(key)) return 'video'
  if (/\/videos\//.test(key)) return 'video'
  if (/\/gallery\//.test(key)) return 'image'
  if (/\/assets\//.test(key)) return 'image'
  if (/\/audio\//.test(key)) return 'audio'
  if (/\/verification\//.test(key)) return 'doc'
  if (/payment-proofs/.test(key)) return 'doc'
  if (/\/photos\//.test(key) || key.match(/\.(jpe?g|png|webp|gif)$/i)) return 'image'
  return 'other'
}

async function listAllObjects(client: S3Client, bucket: string) {
  const objects: { key: string; size: number }[] = []
  let token: string | undefined

  do {
    const res = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1000,
      ContinuationToken: token,
    }))
    for (const obj of res.Contents ?? []) {
      if (obj.Key && obj.Size !== undefined) {
        objects.push({ key: obj.Key, size: obj.Size })
      }
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)

  return objects
}


export default async function StoragePage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const r2Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })

  const publicBucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
  const privateBucket = process.env.R2_PRIVATE_BUCKET || 'tem-private-documents'
  const vercelToken = process.env.V_TOKEN
  const vercelTeamId = process.env.V_TEAM_ID

  // Parallel: R2 objects + Supabase + Vercel usage
  const [publicObjs, privateObjs, { data: vaults }, { count: totalVaultCount }, vercelUsage] = await Promise.all([
    listAllObjects(r2Client, publicBucket),
    listAllObjects(r2Client, privateBucket).catch(() => [] as { key: string; size: number }[]),
    supabase.from('vaults').select('id, display_name, slug, owner_id, status'),
    supabase.from('vaults').select('id', { count: 'exact', head: true }),
    vercelToken
      ? Promise.all([
          fetch(
            `https://api.vercel.com/v9/projects${vercelTeamId ? `?teamId=${vercelTeamId}` : ''}&limit=10`,
            { headers: { Authorization: `Bearer ${vercelToken}` }, next: { revalidate: 3600 } }
          ).then(r => r.json()).catch(() => null),
          fetch(
            `https://api.vercel.com/v6/deployments${vercelTeamId ? `?teamId=${vercelTeamId}` : ''}&limit=5`,
            { headers: { Authorization: `Bearer ${vercelToken}` }, next: { revalidate: 3600 } }
          ).then(r => r.json()).catch(() => null),
        ])
      : Promise.resolve(null),
  ])

  // Vault id → name map
  const vaultMap = new Map<string, { display_name: string; slug: string; owner_id: string | null }>(
    (vaults ?? []).map((v) => [v.id, { display_name: v.display_name, slug: v.slug, owner_id: v.owner_id }])
  )

  // Group objects by vaultId
  type VaultStats = {
    vaultId: string
    display_name: string
    slug: string
    totalBytes: number
    counts: { image: number; video: number; audio: number; doc: number; other: number }
  }

  const vaultStats = new Map<string, VaultStats>()
  let totalPublicBytes = 0
  let totalPrivateBytes = 0
  let orphanBytes = 0
  const orphanFiles: { key: string; size: number }[] = []

  for (const obj of publicObjs) {
    totalPublicBytes += obj.size
    const vId = extractVaultId(obj.key)
    if (!vId) {
      orphanBytes += obj.size
      orphanFiles.push(obj)
      continue
    }
    const meta = vaultMap.get(vId)
    if (!vaultStats.has(vId)) {
      vaultStats.set(vId, {
        vaultId: vId,
        display_name: meta?.display_name ?? `[${vId.slice(0, 8)}…]`,
        slug: meta?.slug ?? '',
        totalBytes: 0,
        counts: { image: 0, video: 0, audio: 0, doc: 0, other: 0 },
      })
    }
    const st = vaultStats.get(vId)!
    st.totalBytes += obj.size
    const cat = fileCategory(obj.key) as keyof typeof st.counts
    st.counts[cat] = (st.counts[cat] ?? 0) + 1
  }

  for (const obj of privateObjs) {
    totalPrivateBytes += obj.size
    const vId = extractVaultId(obj.key)
    if (!vId) continue
    if (!vaultStats.has(vId)) {
      const meta = vaultMap.get(vId)
      vaultStats.set(vId, {
        vaultId: vId,
        display_name: meta?.display_name ?? `[${vId.slice(0, 8)}…]`,
        slug: meta?.slug ?? '',
        totalBytes: 0,
        counts: { image: 0, video: 0, audio: 0, doc: 0, other: 0 },
      })
    }
    const st = vaultStats.get(vId)!
    st.totalBytes += obj.size
    st.counts.doc += 1
  }

  const sortedVaults = Array.from(vaultStats.values()).sort((a, b) => b.totalBytes - a.totalBytes)
  const totalBucketBytes = totalPublicBytes + totalPrivateBytes
  const r2FreeLimitBytes = R2_FREE_STORAGE_GB * 1024 * 1024 * 1024
  const r2UsagePercent = Math.min(100, (totalBucketBytes / r2FreeLimitBytes) * 100)

  // Supabase free tier: 500 MB DB
  const supabaseFreeLimitBytes = 500 * 1024 * 1024

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Depolama & Kullanım</h1>
        <p className="mt-1 text-sm text-slate-500">R2, Supabase ve trafik kullanım özeti</p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* R2 Public */}
        <UsageCard
          icon={<HardDrive className="h-5 w-5 text-orange-600" />}
          title="R2 Public Bucket"
          subtitle={publicBucket}
          used={totalPublicBytes}
          total={r2FreeLimitBytes}
          usedLabel={formatBytes(totalPublicBytes)}
          limitLabel={`${R2_FREE_STORAGE_GB} GB ücretsiz`}
          color="orange"
          detail={`${publicObjs.length} dosya`}
        />
        {/* R2 Private */}
        <UsageCard
          icon={<HardDrive className="h-5 w-5 text-rose-600" />}
          title="R2 Private Bucket"
          subtitle={privateBucket}
          used={totalPrivateBytes}
          total={r2FreeLimitBytes}
          usedLabel={formatBytes(totalPrivateBytes)}
          limitLabel={`${R2_FREE_STORAGE_GB} GB ücretsiz`}
          color="rose"
          detail={`${privateObjs.length} dosya`}
        />
        {/* Supabase DB */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Supabase DB</p>
              <p className="text-xs text-slate-400">PostgreSQL — Free tier</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Toplam vault</span>
              <span className="font-semibold text-slate-700">{totalVaultCount ?? 0}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Public memorial</span>
              <span className="font-semibold text-slate-700">{vaults?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>DB limiti</span>
              <span className="font-semibold text-slate-700">500 MB</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Gerçek DB boyutu için Supabase Dashboard → Settings → Usage
            </p>
          </div>
        </div>
      </div>

      {/* R2 COMBINED TOTAL BAR */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            <p className="text-sm font-semibold text-slate-800">R2 Toplam Kullanım</p>
          </div>
          <span className="text-sm font-bold text-slate-700">
            {formatBytes(totalBucketBytes)} / {R2_FREE_STORAGE_GB} GB
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${r2UsagePercent.toFixed(2)}%`,
              background: r2UsagePercent > 80 ? '#ef4444' : r2UsagePercent > 60 ? '#f97316' : '#3b82f6',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>%{r2UsagePercent.toFixed(2)} kullanımda</span>
          <span>{formatBytes(r2FreeLimitBytes - totalBucketBytes)} kaldı</span>
        </div>
        {orphanFiles.length > 0 && (
          <p className="mt-2 text-xs text-amber-600">
            ⚠ Sahipsiz dosyalar: {formatBytes(orphanBytes)} ({orphanFiles.length} dosya) — aşağıda listelendi
          </p>
        )}
      </div>

      {/* VERCEL INFO */}
      {(() => {
        if (!vercelToken) {
          return (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-500">Vercel Trafik & Kullanım</p>
              </div>
              <p className="text-xs text-slate-400">
                <code className="bg-slate-200 px-1 rounded">VERCEL_TOKEN</code> ve{' '}
                <code className="bg-slate-200 px-1 rounded">VERCEL_TEAM_ID</code> env değişkenlerini ekleyin.
              </p>
            </div>
          )
        }

        const [projectsData, deploymentsData] = (vercelUsage as [any, any] | null) ?? [null, null]
        const projects: any[] = projectsData?.projects ?? []
        const deployments: any[] = deploymentsData?.deployments ?? []
        const mainProject = projects.find((p: any) => p.name === 'themaradi') ?? projects[0]
        const latestDeploy = deployments[0]

        return (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-black" />
                <p className="text-sm font-semibold text-slate-800">Vercel Deployment</p>
              </div>
              <a
                href="https://vercel.com/dashboard/usage"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
              >
                Kullanım detayı ↗
              </a>
            </div>

            {mainProject ? (
              <div className="space-y-3">
                {/* Project info */}
                <div className="flex flex-wrap gap-3">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex-1 min-w-[140px]">
                    <p className="text-[10px] text-slate-400 mb-1">Proje</p>
                    <p className="text-xs font-semibold text-slate-800">{mainProject.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{mainProject.framework ?? 'nextjs'}</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex-1 min-w-[140px]">
                    <p className="text-[10px] text-slate-400 mb-1">Domain</p>
                    <p className="text-xs font-semibold text-slate-800">
                      {mainProject.alias?.[0]?.domain ?? 'theeternalmemory.com'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 flex-1 min-w-[140px]">
                    <p className="text-[10px] text-slate-400 mb-1">Toplam Proje</p>
                    <p className="text-sm font-bold text-slate-800">{projects.length}</p>
                  </div>
                </div>

                {/* Recent deployments */}
                {deployments.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Son Deployment&apos;lar</p>
                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden">
                      {deployments.slice(0, 5).map((d: any) => {
                        const date = new Date(d.created).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                        const isReady = d.state === 'READY' || d.readyState === 'READY'
                        const isError = d.state === 'ERROR' || d.readyState === 'ERROR'
                        return (
                          <div key={d.uid} className="flex items-center justify-between px-3 py-2 bg-white">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`h-2 w-2 rounded-full shrink-0 ${isReady ? 'bg-green-400' : isError ? 'bg-red-400' : 'bg-yellow-400'}`} />
                              <span className="text-[10px] text-slate-600 font-mono truncate max-w-[180px]">{d.url}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">{date}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Free tier limits reminder */}
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <p className="text-[10px] font-semibold text-blue-700 mb-1.5">Hobby Plan Limitleri (aylık)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {[
                      ['Function Invocations', '1M'],
                      ['Fast Data Transfer', '100 GB'],
                      ['Edge Requests', '1M'],
                      ['Build Dakikası', '6.000 dk'],
                      ['Image Optimization', '5K'],
                      ['Fluid CPU', '4 saat'],
                    ].map(([label, limit]) => (
                      <div key={label} className="flex justify-between text-[10px]">
                        <span className="text-blue-600">{label}</span>
                        <span className="text-blue-800 font-medium">{limit}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-blue-500 mt-2">
                    Gerçek kullanım rakamları için{' '}
                    <a href="https://vercel.com/dashboard/usage" target="_blank" rel="noreferrer" className="underline">
                      vercel.com/dashboard/usage
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Proje bilgisi alınamadı. Token veya Team ID&apos;yi kontrol edin.</p>
            )}
          </div>
        )
      })()}

      {/* PER-VAULT TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <p className="text-sm font-semibold text-slate-800">Vault Başına Depolama</p>
          </div>
          <span className="text-xs text-slate-400">{sortedVaults.length} vault</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-500 font-medium">
                <th className="px-4 py-2.5">Profil</th>
                <th className="px-4 py-2.5 text-right">Toplam</th>
                <th className="px-4 py-2.5 text-center">
                  <Image className="h-3.5 w-3.5 inline" />
                </th>
                <th className="px-4 py-2.5 text-center">
                  <FileVideo className="h-3.5 w-3.5 inline" />
                </th>
                <th className="px-4 py-2.5 text-center">
                  <Music className="h-3.5 w-3.5 inline" />
                </th>
                <th className="px-4 py-2.5 text-center">
                  <FileText className="h-3.5 w-3.5 inline" />
                </th>
                <th className="px-4 py-2.5 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedVaults.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Henüz dosya bulunamadı
                  </td>
                </tr>
              )}
              {sortedVaults.map((v) => {
                const pct = totalBucketBytes > 0 ? (v.totalBytes / totalBucketBytes) * 100 : 0
                return (
                  <tr key={v.vaultId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-800 text-xs">{v.display_name}</p>
                        {v.slug && (
                          <a
                            href={`/memorial/${v.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-500 hover:underline"
                          >
                            /memorial/{v.slug}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-700">
                      {formatBytes(v.totalBytes)}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{v.counts.image || '—'}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{v.counts.video || '—'}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{v.counts.audio || '—'}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">{v.counts.doc || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-400"
                            style={{ width: `${pct.toFixed(1)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 w-8 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORPHAN FILES */}
      {orphanFiles.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm font-semibold text-amber-800">
                ⚠ Sahipsiz Dosyalar ({orphanFiles.length} adet — {formatBytes(orphanBytes)})
              </p>
              <CleanOrphansButton fileCount={orphanFiles.length} bytes={formatBytes(orphanBytes)} />
            </div>
            <p className="text-xs text-amber-600 mt-1">Vault prefix&apos;i olmayan dosyalar</p>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-amber-50">
                <tr className="text-left text-amber-700 font-medium">
                  <th className="px-4 py-2">Dosya Path</th>
                  <th className="px-4 py-2 text-right">Boyut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {orphanFiles.map((f) => (
                  <tr key={f.key} className="hover:bg-amber-100">
                    <td className="px-4 py-1.5 font-mono text-[10px] text-amber-900 break-all">{f.key}</td>
                    <td className="px-4 py-1.5 text-right text-amber-700 whitespace-nowrap">{formatBytes(f.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELETED VAULT FOLDERS */}
      {(() => {
        const deletedVaults = sortedVaults.filter(v => !vaultMap.has(v.vaultId))
        if (!deletedVaults.length) return null
        const deletedTotalBytes = deletedVaults.reduce((s, v) => s + v.totalBytes, 0)
        return (
          <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-red-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm font-semibold text-red-800">
                  🗑 Silinmiş Vault Klasörleri ({deletedVaults.length} adet — {formatBytes(deletedTotalBytes)})
                </p>
                <CleanDeletedVaultsButton
                  vaultIds={deletedVaults.map(v => v.vaultId)}
                  totalBytes={formatBytes(deletedTotalBytes)}
                />
              </div>
              <p className="text-xs text-red-600 mt-1">
                DB&apos;de kaydı olmayan vault ID&apos;leri — R2&apos;de dosyaları hâlâ duruyor
              </p>
            </div>
            <div className="divide-y divide-red-100">
              {deletedVaults.map(v => (
                <div key={v.vaultId} className="px-4 py-2 flex items-center justify-between">
                  <code className="text-[10px] text-red-800 font-mono">{v.vaultId}</code>
                  <span className="text-xs text-red-700 font-semibold">{formatBytes(v.totalBytes)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function UsageCard({
  icon, title, subtitle, used, total, usedLabel, limitLabel, color, detail,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  used: number
  total: number
  usedLabel: string
  limitLabel: string
  color: 'orange' | 'rose' | 'blue'
  detail: string
}) {
  const pct = Math.min(100, (used / total) * 100)
  const barColor = {
    orange: pct > 80 ? '#ef4444' : '#f97316',
    rose: pct > 80 ? '#ef4444' : '#f43f5e',
    blue: pct > 80 ? '#ef4444' : '#3b82f6',
  }[color]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400 truncate max-w-[160px]">{subtitle}</p>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct.toFixed(2)}%`, background: barColor }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{usedLabel}</span>
        <span>{limitLabel}</span>
      </div>
      <p className="mt-1.5 text-xs text-slate-400">{detail}</p>
    </div>
  )
}
