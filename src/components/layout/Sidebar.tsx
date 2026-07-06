import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    FileText,
    Receipt,
    Settings,
    LogOut,
    ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/AuthStore'
import { authApi } from '../../api/Auth'
import toast from 'react-hot-toast'

const navItems = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/app/quotes',    icon: FileText,        label: 'Devis' },
    { to: '/app/invoices',  icon: Receipt,         label: 'Factures' },
    { to: '/app/clients',   icon: Users,           label: 'Clients' },
]

export default function Sidebar() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await authApi.logout()
        } catch {
            // ignore — on déconnecte quand même
        } finally {
            logout()
            navigate('/login')
        }
    }

    return (
        <aside className="flex flex-col w-60 shrink-0 h-screen bg-slate-900 text-slate-300">

            {/* Logo */}
            <div className="px-5 py-5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-white" />
                    </div>
                    <span className="font-semibold text-white text-sm tracking-wide">
            DevisApp
          </span>
                </div>
                {user?.company_name && (
                    <p className="mt-2 text-xs text-slate-500 truncate">
                        {user.company_name}
                    </p>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            [
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150',
                                isActive
                                    ? 'bg-slate-800 text-white font-medium'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                            ].join(' ')
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon size={16} className="shrink-0" />
                                <span className="flex-1">{label}</span>
                                {isActive && (
                                    <ChevronRight size={14} className="text-slate-500" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer — profil + déconnexion */}
            <div className="border-t border-slate-800 p-3 space-y-0.5">
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        [
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150',
                            isActive
                                ? 'bg-slate-800 text-white font-medium'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                        ].join(' ')
                    }
                >
                    <Settings size={16} className="shrink-0" />
                    <span>Paramètres</span>
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors duration-150"
                >
                    <LogOut size={16} className="shrink-0" />
                    <span>Déconnexion</span>
                </button>

                {/* Avatar utilisateur */}
                {user && (
                    <div className="flex items-center gap-3 px-3 pt-3 mt-1 border-t border-slate-800">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-xs font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}