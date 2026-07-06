import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, FileText, Copy, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { quotesApi } from '../../api/Quotes'
import type { Quote, QuoteStatus } from '../../types/models'
import Header from '../../components/layout/Header'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatPrice, formatDate, QUOTE_STATUS_LABELS } from '../../utils/Formatters'

const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: '', label: 'Tous' },
    { value: 'draft', label: QUOTE_STATUS_LABELS.draft },
    { value: 'sent', label: QUOTE_STATUS_LABELS.sent },
    { value: 'accepted', label: QUOTE_STATUS_LABELS.accepted },
    { value: 'rejected', label: QUOTE_STATUS_LABELS.rejected },
    { value: 'invoiced', label: QUOTE_STATUS_LABELS.invoiced },
]

export default function QuotesPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['quotes', search, status],
        queryFn: () => quotesApi.list({ search: search || undefined, status: status || undefined }),
    })

    const duplicateMutation = useMutation({
        mutationFn: quotesApi.duplicate,
        onSuccess: (newQuote) => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] })
            toast.success('Devis dupliqué')
            navigate(`/app/quotes/${newQuote.id}`)
        },
        onError: () => toast.error('Erreur lors de la duplication'),
    })

    const deleteMutation = useMutation({
        mutationFn: quotesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes'] })
            toast.success('Devis supprimé')
        },
        onError: () => toast.error('Impossible de supprimer ce devis'),
    })

    return (
        <div>
            <Header
                title="Devis"
                subtitle={data ? `${data.total} devis` : undefined}
                actions={
                    <Button size="sm" icon={<Plus size={14} />} onClick={() => navigate('/app/quotes/new')}>
                        Nouveau devis
                    </Button>
                }
            />

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                    placeholder="Rechercher un devis..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    leftIcon={<Search size={14} />}
                    className="sm:max-w-xs"
                />
                <div className="flex gap-1.5 flex-wrap">
                    {STATUS_FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setStatus(f.value)}
                            className={[
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                status === f.value
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300',
                            ].join(' ')}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste */}
            {isLoading ? (
                <PageSpinner />
            ) : data?.data.length === 0 ? (
                <EmptyState
                    icon={<FileText size={32} />}
                    title="Aucun devis"
                    description="Créez votre premier devis pour commencer."
                    action={{ label: 'Créer un devis', onClick: () => navigate('/app/quotes/new') }}
                />
            ) : (
                <Card padding="none">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Numéro</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">Client</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-3 py-3 hidden sm:table-cell">Date</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">Statut</th>
                            <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Montant</th>
                            <th className="px-3 py-3 w-16"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {data?.data.map(quote => (
                            <QuoteRow
                                key={quote.id}
                                quote={quote}
                                onOpen={() => navigate(`/app/quotes/${quote.id}`)}
                                onDuplicate={() => duplicateMutation.mutate(quote.id)}
                                onDelete={() => { if (confirm('Supprimer ce devis ?')) deleteMutation.mutate(quote.id) }}
                            />
                        ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    )
}

function QuoteRow({
                      quote,
                      onOpen,
                      onDuplicate,
                      onDelete,
                  }: {
    quote: Quote
    onOpen: () => void
    onDuplicate: () => void
    onDelete: () => void
}) {
    return (
        <tr
            className="group hover:bg-slate-50 cursor-pointer transition-colors"
            onClick={onOpen}
        >
            <td className="px-5 py-3.5 font-medium text-slate-900">{quote.number}</td>
            <td className="px-3 py-3.5 text-slate-600 truncate max-w-[140px]">
                {quote.client?.display_name ?? '—'}
            </td>
            <td className="px-3 py-3.5 text-slate-500 hidden sm:table-cell">
                {formatDate(quote.issued_at)}
            </td>
            <td className="px-3 py-3.5">
                <Badge status={quote.status as QuoteStatus} type="quote" size="sm" />
            </td>
            <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                {formatPrice(quote.total_ttc)}
            </td>
            <td className="px-3 py-3.5">
                <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={onDuplicate}
                        title="Dupliquer"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <Copy size={13} />
                    </button>
                    {quote.status === 'draft' && (
                        <button
                            onClick={onDelete}
                            title="Supprimer"
                            className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    )
}