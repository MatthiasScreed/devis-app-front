import type { ReactNode } from 'react'
import Button from './Button'

interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
}

export default function EmptyState({
                                       icon,
                                       title,
                                       description,
                                       action,
                                   }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && (
                <div className="mb-4 text-slate-300">{icon}</div>
            )}
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
            )}
            {action && (
                <Button onClick={action.onClick} size="sm">
                    {action.label}
                </Button>
            )}
        </div>
    )
}