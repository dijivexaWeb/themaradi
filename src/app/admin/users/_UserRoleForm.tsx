'use client'

import { updateUserRole } from '../actions'
import { useState } from 'react'

export default function UserRoleForm({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as 'user' | 'admin' | 'moderator'
    if (!window.confirm(`Rolü "${newRole}" olarak değiştir?`)) return
    setLoading(true)
    const result = await updateUserRole(userId, newRole)
    setLoading(false)
    if (result.success) setRole(newRole)
    else alert(result.error)
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={loading}
      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none focus:border-emerald-400 disabled:opacity-50"
    >
      <option value="user">user</option>
      <option value="moderator">moderator</option>
      <option value="admin">admin</option>
    </select>
  )
}
