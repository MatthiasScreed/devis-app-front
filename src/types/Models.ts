import api from './client'
import type { Invoice, PaginatedResponse } from '../types/models'

export interface InvoicePayload {
    client_id: number
    subject?: string
    issued_at: string
    due_at?: string
    footer_notes?: string
}

export const invoicesApi = {
    list: async (params?: {
        status?: string
        client_id?: number
        search?: string
        page?: number
    }): Promise<PaginatedResponse<Invoice>> => {
        const res = await api.get<PaginatedResponse<Invoice>>('/invoices', { params })
        return res.data
    },

    get: async (id: number): Promise<Invoice> => {
        const res = await api.get<Invoice>(`/invoices/${id}`)
        return res.data
    },

    create: async (data: InvoicePayload): Promise<Invoice> => {
        const res = await api.post<Invoice>('/invoices', data)
        return res.data
    },

    update: async (id: number, data: Partial<InvoicePayload>): Promise<Invoice> => {
        const res = await api.put<Invoice>(`/invoices/${id}`, data)
        return res.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/invoices/${id}`)
    },

    send: async (id: number, email?: string): Promise<Invoice> => {
        const res = await api.post<Invoice>(`/invoices/${id}/send`, { email })
        return res.data
    },

    markAsPaid: async (id: number, paid_at?: string): Promise<Invoice> => {
        const res = await api.post<Invoice>(`/invoices/${id}/pay`, { paid_at })
        return res.data
    },

    pdfUrl: (id: number): string => {
        return `${import.meta.env.VITE_API_URL}/invoices/${id}/pdf`
    },
}