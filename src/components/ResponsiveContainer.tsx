import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
}

export default function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`
      w-full
      max-w-sm mx-auto px-4 py-4
      sm:max-w-md sm:px-6
      md:max-w-3xl md:px-8 md:py-6
      lg:max-w-5xl lg:px-12
      xl:max-w-7xl
      ${className}
    `}>
      {children}
    </div>
  )
}