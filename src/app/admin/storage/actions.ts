'use server'

import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { revalidatePath } from 'next/cache'

function makeR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
}

function extractVaultId(key: string): string | null {
  const m = key.match(/^(?:profiles|photos)\/([^/]+)\//)
  return m ? m[1] : null
}

async function batchDelete(client: S3Client, bucket: string, keys: string[]) {
  let deleted = 0
  for (let i = 0; i < keys.length; i += 1000) {
    const chunk = keys.slice(i, i + 1000)
    await client.send(new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: chunk.map(k => ({ Key: k })), Quiet: true },
    }))
    deleted += chunk.length
  }
  return deleted
}

async function listAllKeys(client: S3Client, bucket: string, prefix?: string) {
  const keys: string[] = []
  let token: string | undefined
  do {
    const res = await client.send(new ListObjectsV2Command({
      Bucket: bucket, MaxKeys: 1000, ContinuationToken: token, Prefix: prefix,
    }))
    for (const obj of res.Contents ?? []) { if (obj.Key) keys.push(obj.Key) }
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)
  return keys
}

// Delete files with no vault prefix (orphan files)
export async function cleanOrphanFilesAction(): Promise<{ deleted: number; error?: string }> {
  try {
    await requireAdmin()
    const client = makeR2Client()
    const bucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'

    const allKeys = await listAllKeys(client, bucket)
    const orphanKeys = allKeys.filter(k => !extractVaultId(k))

    if (!orphanKeys.length) return { deleted: 0 }
    const deleted = await batchDelete(client, bucket, orphanKeys)
    revalidatePath('/admin/storage')
    return { deleted }
  } catch (e: any) {
    return { deleted: 0, error: e.message }
  }
}

// Delete all R2 objects for vault IDs that no longer exist in DB
export async function cleanDeletedVaultFoldersAction(
  vaultIds: string[]
): Promise<{ deleted: number; error?: string }> {
  try {
    await requireAdmin()
    if (!vaultIds.length) return { deleted: 0 }

    // Double-check: confirm these IDs truly don't exist in DB
    const supabase = await createServiceClient()
    const { data: existing } = await supabase
      .from('vaults')
      .select('id')
      .in('id', vaultIds)
    const existingIds = new Set((existing ?? []).map(v => v.id))
    const safeToDelete = vaultIds.filter(id => !existingIds.has(id))

    if (!safeToDelete.length) return { deleted: 0 }

    const client = makeR2Client()
    const publicBucket = process.env.R2_PUBLIC_BUCKET || 'tem-public-media'
    const privateBucket = process.env.R2_PRIVATE_BUCKET || 'tem-private-documents'

    let totalDeleted = 0
    for (const vaultId of safeToDelete) {
      const [pubKeys, privKeys] = await Promise.all([
        listAllKeys(client, publicBucket, `profiles/${vaultId}/`),
        listAllKeys(client, privateBucket, `profiles/${vaultId}/`).catch(() => [] as string[]),
      ])
      if (pubKeys.length) totalDeleted += await batchDelete(client, publicBucket, pubKeys)
      if (privKeys.length) totalDeleted += await batchDelete(client, privateBucket, privKeys)
    }

    revalidatePath('/admin/storage')
    return { deleted: totalDeleted }
  } catch (e: any) {
    return { deleted: 0, error: e.message }
  }
}
