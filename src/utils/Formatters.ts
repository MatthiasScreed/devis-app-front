import type { QuoteStatus, InvoiceStatus } from '../types/models'

// ── Prix ────────────────────────────────────────────────────────────────────

export const formatPrice = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(num)
}

export const formatPriceHT = (amount: number | string): string => {
    return `${formatPrice(amount)} HT`
}

// ── Dates ────────────────────────────────────────────────────────────────────

export const formatDate = (date: string | null | undefined): string => {
    if (!date) return '—'
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

export const formatDateLong = (date: string | null | undefined): string => {
    if (!date) return '—'
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date))
}

export const today = (): string => {
    return new Date().toISOString().split('T')[0]
}

export const addDays = (days: number): string => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
}

// ── Statuts devis ────────────────────────────────────────────────────────────

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
    draft:    'Brouillon',
    sent:     'Envoyé',
    accepted: 'Accepté',
    rejected: 'Refusé',
    expired:  'Expiré',
    invoiced: 'Facturé',
}

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
    draft:    'bg-gray-100 text-gray-600',
    sent:     'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired:  'bg-orange-100 text-orange-700',
    invoiced: 'bg-purple-100 text-purple-700',
}

// ── Statuts factures ─────────────────────────────────────────────────────────

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft:     'Brouillon',
    sent:      'Envoyée',
    paid:      'Payée',
    overdue:   'En retard',
    cancelled: 'Annulée',
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
    draft:     'bg-gray-100 text-gray-600',
    sent:      'bg-blue-100 text-blue-700',
    paid:      'bg-emerald-100 text-emerald-700',
    overdue:   'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-400',
}

// ── Unités courantes pour les lignes de devis ────────────────────────────────

export const UNITS = [
    { value: 'h',       label: 'Heure (h)' },
    { value: 'j',       label: 'Jour (j)' },
    { value: 'forfait', label: 'Forfait' },
    { value: 'u',       label: 'Unité (u)' },
    { value: 'm²',      label: 'Mètre carré (m²)' },
    { value: 'm',       label: 'Mètre linéaire (m)' },
    { value: 'kg',      label: 'Kilogramme (kg)' },
] as const

// ── Taux de TVA courants en France ───────────────────────────────────────────

export const VAT_RATES = [
    { value: 0,   label: '0 % (exonéré)' },
    { value: 5.5, label: '5,5 % (réduit)' },
    { value: 10,  label: '10 % (intermédiaire)' },
    { value: 20,  label: '20 % (normal)' },
] as const

// ── Calculs ──────────────────────────────────────────────────────────────────

export const calcLineTotal = (
    quantity: number,
    unitPrice: number,
    discountPercent: number = 0
): number => {
    return Math.round(quantity * unitPrice * (1 - discountPercent / 100) * 100) / 100
}

export const calcTotals = (
    lines: Array<{ line_total_ht: number }>,
    vatRate: number
) => {
    const subtotalHT = lines.reduce((sum, l) => sum + l.line_total_ht, 0)
    const vatAmount = Math.round(subtotalHT * (vatRate / 100) * 100) / 100
    const totalTTC = Math.round((subtotalHT + vatAmount) * 100) / 100
    return { subtotalHT, vatAmount, totalTTC }
}