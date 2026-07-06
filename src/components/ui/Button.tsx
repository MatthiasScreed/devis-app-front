import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: Size
    loading?: boolean
    icon?: React.ReactNode
}

const variants: Record<Variant, string> = {
    primary:
        'bg-slate-900 text-white hover:bg-slate-700 focus-visible:ring-slate-900',
    secondary:
        'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400',
    ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400',
    danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
}

const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-sm gap-2',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            children,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                className={[
                    'inline-flex items-center justify-center font-medium rounded-lg',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className,
                ].join(' ')}
                {...props}
            >
                {loading ? (
                    <Loader2 className="animate-spin shrink-0" size={14} />
                ) : (
                    icon && <span className="shrink-0">{icon}</span>
                )}
                {children && <span>{children}</span>}
            </button>
        )
    }
)

Button.displayName = 'Button'
export default Button