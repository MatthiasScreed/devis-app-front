import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Receipt, Send, Check, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { invoicesApi } from '../../api/Invoices'
import type { Invoice, InvoiceStatus } from '../../types/models'
import Header from '../../components/layout/Header'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatPrice, formatDate, INVOICE_STATUS_LABELS } from '../../utils/Formatters'

const STATUS_FILTERS = [
    { value: '', label: 'Toutes' },
    { value: 'draft', label: INVOICE_STATUS_LABELS.draft },
    { value: 'sent', label: INVOICE_STATUS_LABELS.sent },
    { value: 'paid', label: INVOICE_STATUS_LABELS.paid },
    { value: 'overdue', label: INVOICE_STATUS_LABELS.overdue },
]

export default function InvoicesPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [sendingId, setSendingId] = useState<number | null>(null)
    const [sendEmail, setSendEmail] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['invoices', search, status],
        queryFn: () => invoicesApi.list({ search: search || undefined, status: status || undefined }),
    })

    const sendMutation = useMutation({
        mutationFn: ({ id, email }: { id: number; email?: string }) => invoicesApi.send(id, email),
        onSuccess: () => {
            toast.success('Facture envoyée')
            setSendingId(null)
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        },
        onError: () => toast.error('Erreur lors de l\'envoi'),
    })

    const paidMutation = useMutation({
        mutationFn: (id: number) => invoicesApi.markAsPaid(id),
        onSuccess: () => {
            toast.success('Facture marquée comme payée')
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        },
        onError: () => toast.error('Erreur'),
    })

    const handleDownload = async (id: number, number: string) => {
        try {
            const blob = await invoicesApi.getPdf(id)
            if (blob.type !== 'application/pdf') {
                throw new Error('Réponse invalide du serveur')
            }
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${number}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch {
            toast.error('Erreur lors du téléchargement du PDF')
        }
    }

    return (
        <div>
            <Header
                title="Factures"
                subtitle={data ? `${data.total} facture${data.total > 1 ? 's' : ''}` : undefined}
            />

            {/* Filtres */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                    placeholder="Rechercher une facture..."
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
                    icon={<Receipt size={32} />}
                    title="Aucune facture"
                    description="Les factures sont créées depuis les devis acceptés."
                />
            ) : (
                <Card padding="none">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Numéro</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">Client</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-3 py-3 hidden sm:table-cell">Échéance</th>
                            <th className="text-left text-xs font-medium text-slate-500 px-3 py-3">Statut</th>
                            <th className="text-right text-xs font-medium text-slate-500 px-3 py-3">Montant</th>
                            <th className="px-5 py-3 w-28 text-right text-xs font-medium text-slate-500">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {data?.data.map(invoice => (
                            <InvoiceRow
                                key={invoice.id}
                                invoice={invoice}
                                onSend={() => { setSendingId(invoice.id); setSendEmail(invoice.client?.email ?? '') }}
                                onPaid={() => { if (confirm('Marquer cette facture comme payée ?')) paidMutation.mutate(invoice.id) }}
                                onDownload={() => handleDownload(invoice.id, invoice.number)}
                            />
                        ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* Modal envoi */}
            {sendingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setSendingId(null)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Envoyer la facture</h2>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Email du destinataire</label>
                            <input
                                type="email"
                                value={sendEmail}
                                onChange={e => setSendEmail(e.target.value)}
                                placeholder="email@exemple.com"
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setSendingId(null)}>Annuler</Button>
                            <Button
                                className="flex-1"
                                icon={<Send size={13} />}
                                loading={sendMutation.isPending}
                                onClick={() => sendMutation.mutate({ id: sendingId, email: sendEmail })}
                            >
                                Envoyer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function InvoiceRow({
                        invoice,
                        onSend,
                        onPaid,
                        onDownload,
                    }: {
    invoice: Invoice
    onSend: () => void
    onPaid: () => void
    onDownload: () => void
}) {
    const isOverdue = invoice.status === 'overdue' ||
        (invoice.status === 'sent' && invoice.due_at && new Date(invoice.due_at) < new Date())

    return (
        <tr className="group hover:bg-slate-50 transition-colors">
            <td className="px-5 py-3.5 font-medium text-slate-900">{invoice.number}</td>
            <td className="px-3 py-3.5 text-slate-600 truncate max-w-[140px]">
                {invoice.client?.display_name ?? '—'}
            </td>
            <td className="px-3 py-3.5 hidden sm:table-cell">
                {invoice.due_at ? (
                    <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}>
            {formatDate(invoice.due_at)}
          </span>
                ) : (
                    <span className="text-slate-400">—</span>
                )}
            </td>
            <td className="px-3 py-3.5">
                <Badge status={invoice.status as InvoiceStatus} type="invoice" size="sm" />
            </td>
            <td className="px-3 py-3.5 text-right font-medium text-slate-900">
                {formatPrice(invoice.total_ttc)}
            </td>
            <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onDownload}
                        title="Télécharger PDF"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <Download size={13} />
                    </button>
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <button
                            onClick={onSend}
                            title="Envoyer par email"
                            className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            <Send size={13} />
                        </button>
                    )}
                    {invoice.status === 'sent' && (
                        <button
                            onClick={onPaid}
                            title="Marquer payée"
                            className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                            <Check size={13} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    )
}