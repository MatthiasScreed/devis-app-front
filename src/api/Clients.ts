import api from './Client'
import type { Client, PaginatedResponse } from '../types/models'

export interface ClientPayload {
    type?: 'individual' | 'company'
    first_name?: string
    last_name?: string
    company_name?: string
    siret?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    postal_code?: string
    notes?: string
}

export const clientsApi = {
    list: async (params?: {
        search?: string
        page?: number
    }): Promise<PaginatedResponse<Client>> => {
        const res = await api.get<PaginatedResponse<Client>>('/clients', { params })
        return res.data
    },

    get: async (id: number): Promise<Client> => {
        const res = await api.get<Client>(`/clients/${id}`)
        return res.data
    },

    create: async (data: ClientPayload): Promise<Client> => {
        const res = await api.post<Client>('/clients', data)
        return res.data
    },

    update: async (id: number, data: ClientPayload): Promise<Client> => {
        const res = await api.put<Client>(`/clients/${id}`, data)
        return res.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/clients/${id}`)
    },
}