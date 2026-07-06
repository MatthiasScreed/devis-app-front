import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
})

// Injecte le token Bearer automatiquement
api.interceptors.request.use(config => {
    const raw = localStorage.getItem('devisapp-auth')
    if (raw) {
        try {
            const { state } = JSON.parse(raw)
            if (state?.token) {
                config.headers.Authorization = `Bearer ${state.token}`
            }
        } catch {
            // ignore JSON parse errors
        }
    }
    return config
})

// Redirige vers /login si token expiré
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('devisapp-auth')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api