import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
    value: string | number
    label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    hint?: string
    options: SelectOption[]
    placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, options, placeholder, className = '', id, ...props }, ref) => {
        const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="text-sm font-medium text-slate-700"
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                )}

                <select
                    ref={ref}
                    id={selectId}
                    className={[
                        'w-full h-9 rounded-lg border bg-white text-sm text-slate-900',
                        'px-3 pr-8 appearance-none',
                        'transition-colors duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-0 focus:border-transparent',
                        'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
                        error
                            ? 'border-red-400 focus:ring-red-500'
                            : 'border-slate-200 hover:border-slate-300',
                        className,
                    ].join(' ')}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 10px center',
                    }}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {error && <p className="text-xs text-red-600">{error}</p>}
                {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
        )
    }
)

Select.displayName = 'Select'
export default Select