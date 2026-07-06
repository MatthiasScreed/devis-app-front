import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { useAuthStore } from './store/authStore'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/clients/ClientsPage'
import QuotesPage from './pages/quotes/QuotesPage'
import QuoteNewPage from './pages/quotes/QuoteNewPage'
import QuoteDetailPage from './pages/quotes/QuoteDetailPage'
import InvoicesPage from './pages/invoices/InvoicesPage'
import ProfilePage from './pages/ProfilePage'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 2, // 2 minutes
        },
    },
})

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const token = useAuthStore(s => s.token)
    return token ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const token = useAuthStore(s => s.token)
    return token ? <Navigate to="/app/dashboard" replace /> : <>{children}</>
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* ── Routes publiques ── */}
                    <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                    {/* ── Routes protégées — préfixées par /app ── */}
                    <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="clients" element={<ClientsPage />} />
                        <Route path="quotes" element={<QuotesPage />} />
                        <Route path="quotes/new" element={<QuoteNewPage />} />
                        <Route path="quotes/:id" element={<QuoteDetailPage />} />
                        <Route path="invoices" element={<InvoicesPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>

                    {/* ── Fallback ── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontSize: '14px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                    },
                }}
            />
        </QueryClientProvider>
    )
}