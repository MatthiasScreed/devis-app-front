import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-slate-700"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={[
                            'w-full h-9 rounded-lg border bg-white text-sm text-slate-900',
                            'placeholder:text-slate-400',
                            'transition-colors duration-150',
                            'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-0 focus:border-transparent',
                            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
                            error
                                ? 'border-red-400 focus:ring-red-500'
                                : 'border-slate-200 hover:border-slate-300',
                            leftIcon ? 'pl-9' : 'pl-3',
                            rightIcon ? 'pr-9' : 'pr-3',
                            className,
                        ].join(' ')}
                        {...props}
                    />

                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {rightIcon}
            </span>
                    )}
                </div>

                {error && (
                    <p className="text-xs text-red-600">{error}</p>
                )}
                {hint && !error && (
                    <p className="text-xs text-slate-500">{hint}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
export default Input