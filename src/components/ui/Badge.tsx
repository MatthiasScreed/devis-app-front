import type { QuoteStatus, InvoiceStatus } from '../../types/models'
import {
    QUOTE_STATUS_LABELS,
    QUOTE_STATUS_COLORS,
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS,
} from '../../utils/Formatters'

interface BadgeProps {
    status: QuoteStatus | InvoiceStatus
    type: 'quote' | 'invoice'
    size?: 'sm' | 'md'
}

export default function Badge({ status, type, size = 'md' }: BadgeProps) {
    const label =
        type === 'quote'
            ? QUOTE_STATUS_LABELS[status as QuoteStatus]
            : INVOICE_STATUS_LABELS[status as InvoiceStatus]

    const color =
        type === 'quote'
            ? QUOTE_STATUS_COLORS[status as QuoteStatus]
            : INVOICE_STATUS_COLORS[status as InvoiceStatus]

    return (
        <span
            className={[
                'inline-flex items-center font-medium rounded-full',
                size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
                color,
            ].join(' ')}
        >
      {label}
    </span>
    )
}