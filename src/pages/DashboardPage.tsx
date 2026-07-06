import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, FileText, Receipt, Users, Plus } from 'lucide-react'
import api from '../api/client'
import type { DashboardData } from '../types/models'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { formatPrice, formatDate } from '../utils/Formatters'

const fetchDashboard = async (): Promise<DashboardData> => {
    const res = await api.get<DashboardData>('/dashboard')
    return res.data
}

export default function DashboardPage() {
    const navigate = useNavigate()
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboard,
    })

    if (isLoading) return <PageSpinner />

    const revenueDiff = data ? data.revenue.this_month - data.revenue.prev_month : 0
    const revenueUp = revenueDiff >= 0

    return (
        <div>
            <Header
                title="Tableau de bord"
                actions={
                    <Button size="sm" icon={<Plus size={14} />} onClick={() => navigate('/app/quotes/new')}>
                        Nouveau devis
                    </Button>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard
                    label="CA ce mois"
                    value={formatPrice(data?.revenue.this_month ?? 0)}
                    sub={
                        <span className={revenueUp ? 'text-emerald-600' : 'text-red-500'}>
              {revenueUp ? <TrendingUp size={12} className="inline mr-0.5" /> : <TrendingDown size={12} className="inline mr-0.5" />}
                            {formatPrice(Math.abs(revenueDiff))} vs mois dernier
            </span>
                    }
                />
                <StatCard
                    label="Devis envoyés"
                    value={String(data?.quotes.sent ?? 0)}
                    sub={<span className="text-slate-500">{data?.quotes.accepted ?? 0} acceptés</span>}
                />
                <StatCard
                    label="Factures payées"
                    value={String(data?.invoices.paid ?? 0)}
                    sub={
                        (data?.invoices.overdue ?? 0) > 0
                            ? <span className="text-red-500">{data?.invoices.overdue} en retard</span>
                            : <span className="text-slate-500">Aucun retard</span>
                    }
                />
                <StatCard
                    label="Total encaissé"
                    value={formatPrice(data?.invoices.total_paid_ttc ?? 0)}
                    sub={<span className="text-slate-500">Toutes périodes</span>}
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <Card padding="none">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-900">Derniers devis</h2>
                        <button onClick={() => navigate('/app/quotes')} className="text-xs text-blue-600 hover:underline">Voir tout</button>
                    </div>
                    {data?.recent_quotes.length === 0 ? (
                        <div className="px-5 py-8 text-center text-sm text-slate-400">Aucun devis pour l'instant</div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {data?.recent_quotes.map(q => (
                                <li key={q.id} onClick={() => navigate(`/app/quotes/${q.id}`)}
                                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{q.client?.display_name ?? '—'}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{q.number} · {formatDate(q.issued_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                        <Badge status={q.status} type="quote" size="sm" />
                                        <span className="text-sm font-medium text-slate-900">{formatPrice(q.total_ttc)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card padding="none">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-900">Factures en attente</h2>
                        <button onClick={() => navigate('/app/invoices')} className="text-xs text-blue-600 hover:underline">Voir tout</button>
                    </div>
                    {data?.pending_invoices.length === 0 ? (
                        <div className="px-5 py-8 text-center text-sm text-slate-400">Aucune facture en attente</div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {data?.pending_invoices.map(inv => (
                                <li key={inv.id} onClick={() => navigate(`/app/invoices/${inv.id}`)}
                                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{inv.client?.display_name ?? '—'}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{inv.number}{inv.due_at ? ` · Échéance ${formatDate(inv.due_at)}` : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                        <Badge status={inv.status} type="invoice" size="sm" />
                                        <span className="text-sm font-medium text-slate-900">{formatPrice(inv.total_ttc)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
                <ShortcutCard icon={<FileText size={18} />} label="Nouveau devis" onClick={() => navigate('/app/quotes/new')} />
                <ShortcutCard icon={<Users size={18} />} label="Ajouter un client" onClick={() => navigate('/app/clients')} />
                <ShortcutCard icon={<Receipt size={18} />} label="Voir les factures" onClick={() => navigate('/app/invoices')} />
            </div>
        </div>
    )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
    return (
        <Card padding="md">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-xl font-semibold text-slate-900 leading-tight">{value}</p>
            {sub && <div className="text-xs mt-1.5">{sub}</div>}
        </Card>
    )
}

function ShortcutCard({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <button onClick={onClick}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900">
            {icon}
            <span className="text-xs font-medium text-center leading-tight">{label}</span>
        </button>
    )
}