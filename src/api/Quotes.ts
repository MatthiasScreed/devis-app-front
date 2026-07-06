import api from './client'
import type { Quote, QuoteLine, PaginatedResponse } from '../types/models'

export interface QuoteLinePayload {
    description: string
    quantity: number
    unit_price: number
    unit?: string
    type?: 'service' | 'product' | 'discount' | 'section_title'
    details?: string
    discount_percent?: number
}

export interface QuotePayload {
    client_id: number
    subject?: string
    description?: string
    issued_at: string
    valid_until?: string
    vat_rate?: number
    footer_notes?: string
    lines: QuoteLinePayload[]
}

export const quotesApi = {
    list: async (params?: {
        status?: string
        client_id?: number
        search?: string
        page?: number
    }): Promise<PaginatedResponse<Quote>> => {
        const res = await api.get<PaginatedResponse<Quote>>('/quotes', { params })
        return res.data
    },

    get: async (id: number): Promise<Quote> => {
        const res = await api.get<Quote>(`/quotes/${id}`)
        return res.data
    },

    create: async (data: QuotePayload): Promise<Quote> => {
        const res = await api.post<Quote>('/quotes', data)
        return res.data
    },

    update: async (id: number, data: Partial<QuotePayload>): Promise<Quote> => {
        const res = await api.put<Quote>(`/quotes/${id}`, data)
        return res.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/quotes/${id}`)
    },

    // ── Actions métier ──────────────────────────────────────────

    send: async (id: number, email?: string): Promise<Quote> => {
        const res = await api.post<Quote>(`/quotes/${id}/send`, { email })
        return res.data
    },

    accept: async (id: number): Promise<Quote> => {
        const res = await api.post<Quote>(`/quotes/${id}/accept`)
        return res.data
    },

    reject: async (id: number): Promise<Quote> => {
        const res = await api.post<Quote>(`/quotes/${id}/reject`)
        return res.data
    },

    duplicate: async (id: number): Promise<Quote> => {
        const res = await api.post<Quote>(`/quotes/${id}/duplicate`)
        return res.data
    },

    toInvoice: async (id: number): Promise<Quote> => {
        const res = await api.post<Quote>(`/quotes/${id}/to-invoice`)
        return res.data
    },

    getPdf: async (id: number): Promise<Blob> => {
        const res = await api.get(`/quotes/${id}/pdf`, {
            responseType: 'blob',
        })
        return res.data
    },

    // ── Lignes ──────────────────────────────────────────────────

    addLine: async (quoteId: number, data: QuoteLinePayload): Promise<QuoteLine> => {
        const res = await api.post<QuoteLine>(`/quotes/${quoteId}/lines`, data)
        return res.data
    },

    updateLine: async (
        quoteId: number,
        lineId: number,
        data: Partial<QuoteLinePayload>
    ): Promise<QuoteLine> => {
        const res = await api.put<QuoteLine>(`/quotes/${quoteId}/lines/${lineId}`, data)
        return res.data
    },

    deleteLine: async (quoteId: number, lineId: number): Promise<void> => {
        await api.delete(`/quotes/${quoteId}/lines/${lineId}`)
    },

    reorderLines: async (quoteId: number, ids: number[]): Promise<Quote> => {
        const res = await api.put<Quote>(`/quotes/${quoteId}/lines/reorder`, { ids })
        return res.data
    },
}