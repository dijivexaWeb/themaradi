// Kabul edilen ödeme yöntemi rozetleri — sade, marka renklerine sadık, self-hosted SVG.
// Harici logo dosyalarına bağlanmak yerine inline çizildi (bağımlılık/telif riski yok).

export function VisaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 16" className={className} aria-label="Visa" role="img">
      <rect width="48" height="16" rx="3" fill="#fff" stroke="#e2d7c3" />
      <text x="24" y="12" textAnchor="middle" fontFamily="Arial, sans-serif" fontStyle="italic" fontWeight="700" fontSize="10" fill="#1A1F71">
        VISA
      </text>
    </svg>
  )
}

export function MastercardMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 16" className={className} aria-label="Mastercard" role="img">
      <rect width="48" height="16" rx="3" fill="#fff" stroke="#e2d7c3" />
      <circle cx="21" cy="8" r="5.5" fill="#EB001B" />
      <circle cx="27" cy="8" r="5.5" fill="#F79E1B" fillOpacity="0.92" />
    </svg>
  )
}

export function GooglePayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 66 16" className={className} aria-label="Google Pay" role="img">
      <rect width="66" height="16" rx="3" fill="#fff" stroke="#e2d7c3" />
      <text x="5" y="12" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="9.5">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
      <text x="38" y="12" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="9.5" fill="#5f6368">
        Pay
      </text>
    </svg>
  )
}

export function AmexMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 16" className={className} aria-label="American Express" role="img">
      <rect width="48" height="16" rx="3" fill="#006FCF" />
      <text x="24" y="11.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7.5" fill="#fff">
        AMEX
      </text>
    </svg>
  )
}

// size: 'sm' -> hero gibi dar/dikkat çekmemesi gereken alanlar için daha küçük ve soluk.
export default function PaymentBrandRow({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-4' : 'h-5'
  return (
    <div className={`flex items-center gap-1.5 ${size === 'sm' ? 'opacity-80' : ''} ${className ?? ''}`}>
      <VisaMark className={`${h} w-auto`} />
      <MastercardMark className={`${h} w-auto`} />
      <AmexMark className={`${h} w-auto`} />
    </div>
  )
}
