import { Loader2 } from 'lucide-react'

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizes = {
    sm: 14,
    md: 20,
    lg: 32,
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    return (
        <Loader2
            size={sizes[size]}
            className={`animate-spin text-slate-400 ${className}`}
        />
    )
}

// Centré dans un conteneur pleine hauteur
export function PageSpinner() {
    return (
        <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
        </div>
    )
}