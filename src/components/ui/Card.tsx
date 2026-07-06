import type { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
}

export default function Card({
                                 children,
                                 className = '',
                                 padding = 'md',
                             }: CardProps) {
    return (
        <div
            className={[
                'bg-white rounded-xl border border-slate-200 shadow-sm',
                paddings[padding],
                className,
            ].join(' ')}
        >
            {children}
        </div>
    )
}