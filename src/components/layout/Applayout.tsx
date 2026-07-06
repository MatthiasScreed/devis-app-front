import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Sidebar from './Sidebar'

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">

            {/* ── Sidebar desktop ─────────────────────────────── */}
            <div className="hidden md:flex">
                <Sidebar />
            </div>

            {/* ── Sidebar mobile (overlay) ─────────────────────── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileOpen(false)}
                    />
                    {/* Drawer */}
                    <div className="absolute inset-y-0 left-0 z-50">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* ── Contenu principal ────────────────────────────── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

                {/* Topbar mobile */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <span className="font-semibold text-sm text-slate-900">DevisApp</span>
                </div>

                {/* Zone de contenu scrollable */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}