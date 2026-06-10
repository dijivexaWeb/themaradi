'use client'

import { useEffect } from 'react'

export default function ViewTracker({ vaultId }: { vaultId: string }) {
  useEffect(() => {
    fetch('/api/vaults/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vaultId }),
    }).catch(() => {})
  }, [vaultId])

  return null
}
