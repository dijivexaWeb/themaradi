'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface Props {
  children?: React.ReactNode
  className?: string
  pendingLabel?: string
  pendingClassName?: string
}

export default function SubmitButton({
  children = 'Kaydet',
  className = 'rounded-xl bg-[#174f35] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(23,79,53,0.18)] transition-colors hover:bg-[#123f2b] disabled:cursor-not-allowed disabled:opacity-60',
  pendingLabel,
  pendingClassName,
}: Props) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={pendingClassName && pending ? pendingClassName : className}
    >
      <span className="flex items-center gap-2">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending && pendingLabel ? pendingLabel : children}
      </span>
    </button>
  )
}
