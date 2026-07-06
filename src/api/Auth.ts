import api from './client'
import type { User } from '../types/models'

export interface RegisterPayload {
    name: string
    email: string
    password: string
    password_confirmation: string
    company_name?: string
}

export interface LoginPayload {
    email: string
    password: string
}

export interface AuthResponse {
    user: User
    token: string
}

export const authApi = {
    register: async (data: RegisterPayload): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>('/register', data)
        return res.data
    },

    login: async (data: LoginPayload): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>('/login', data)
        return res.data
    },

    logout: async (): Promise<void> => {
        await api.post('/logout')
    },

    me: async (): Promise<User> => {
        const res = await api.get<User>('/me')
        return res.data
    },
}