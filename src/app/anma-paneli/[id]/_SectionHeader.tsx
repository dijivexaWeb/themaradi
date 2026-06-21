interface Props {
  title: string
  icon: string
  subtitle?: string
}

export default function SectionHeader({ title, icon, subtitle }: Props) {
  return (
    <div className="mb-7 border-b border-[#e5dccb] pb-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c2e25] text-xl shadow-sm">
          {icon}
        </div>
        <div>
          <h1 className="font-serif text-2xl text-[#1f2d27]">{title}</h1>
          {subtitle && <p className="text-xs text-[#788177] mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
