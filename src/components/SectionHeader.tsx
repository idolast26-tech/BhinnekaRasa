import { ChevronRight } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  onSeeAll?: () => void
}

export default function SectionHeader({ title, subtitle, onSeeAll }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-5 gap-4">
      <div className="min-w-0">
        <h3 className="text-2xl font-bold font-display text-[#1E2A44] tracking-tight truncate">{title}</h3>
        {subtitle && <p className="text-sm text-[#7A6F5C] mt-0.5">{subtitle}</p>}
      </div>

      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="group flex items-center gap-1 shrink-0 text-sm font-semibold text-[#8A5A1E] hover:text-[#1E2A44] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C] focus-visible:ring-offset-2 rounded-md px-1"
        >
          Lihat Semua
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  )
}