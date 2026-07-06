import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Check, X, Copy, Receipt, Download, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { quotesApi } from '../../api/Quotes'
import type { QuoteStatus } from '../../types/models'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatPrice, formatDate } from '../../utils/Formatters'
import { useAuthStore } from '../../store/AuthStore'

export default function QuoteDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { token } = useAuthStore()
    const [sendEmail, setSendEmail] = useState('')
    const [showSendModal, setShowSendModal] = useState(false)

    const { data: quote, isLoading } = useQuery({
        queryKey: ['quotes', id],
        queryFn: () => quotesApi.get(Number(id)),
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['quotes', id] })

    const sendMutation = useMutation({
        mutationFn: (email?: string) => quotesApi.send(Number(id), email),
        onSuccess: () => { toast.success('Devis envoyé par email'); setShowSendModal(false); invalidate() },
        onError: () => toast.error('Erreur lors de l\'envoi'),
    })

    const acceptMutation = useMutation({
        mutationFn: () => quotesApi.accept(Number(id)),
        onSuccess: () => { toast.success('Devis marqué comme accepté'); invalidate() },
        onError: () => toast.error('Erreur'),
    })

    const rejectMutation = useMutation({
        mutationFn: () => quotesApi.reject(Number(id)),
        onSuccess: () => { toast.success('Devis marqué comme refusé'); invalidate() },
        onError: () => toast.error('Erreur'),
    })

    const duplicateMutation = useMutation({
        mutationFn: () => quotesApi.duplicate(Number(id)),
        onSuccess: (newQuote) => { toast.success('Devis dupliqué'); navigate(`/app/quotes/${newQuote.id}`) },
        onError: () => toast.error('Erreur lors de la duplication'),
    })

    const toInvoiceMutation = useMutation({
        mutationFn: () => quotesApi.toInvoice(Number(id)),
        onSuccess: (invoice: any) => {
            toast.success('Facture créée')
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            navigate(`/app/invoices/${invoice.id}`)
        },
        onError: (err: any) => toast.error(err.response?.data?.message ?? 'Erreur'),
    })

    const handleDownloadPdf = async () => {
        try {
            const blob = await quotesApi.getPdf(Number(id))

            // Sécurité : si le backend a renvoyé une erreur JSON au lieu d'un PDF
            // (ex: 404/500), le blob aura le mauvais type — on le détecte ici
            if (blob.type !== 'application/pdf') {
                throw new Error('Réponse invalide du serveur')
            }

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${quote?.number ?? 'devis'}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch {
            toast.error('Erreur lors du téléchargement du PDF')
        }
    }

    if (isLoading) return <PageSpinner />
    if (!quote) return <div className="text-slate-500">Devis introuvable</div>

    const canSend = ['draft', 'sent'].includes(quote.status)
    const canAccept = quote.status === 'sent'
    const canReject = quote.status === 'sent'
    const canToInvoice = quote.status === 'accepted'
    const canDuplicate = true

    return (
        <div>
            {/* En-tête */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/app/quotes')} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-semibold text-slate-900">{quote.number}</h1>
                            <Badge status={quote.status as QuoteStatus} type="quote" />
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {quote.client?.display_name} · {formatDate(quote.issued_at)}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 shrink-0">
                    <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={handleDownloadPdf}>
                        PDF
                    </Button>
                    {canDuplicate && (
                        <Button variant="secondary" size="sm" icon={<Copy size={13} />} loading={duplicateMutation.isPending} onClick={() => duplicateMutation.mutate()}>
                            Dupliquer
                        </Button>
                    )}
                    {canSend && (
                        <Button size="sm" icon={<Send size={13} />} onClick={() => setShowSendModal(true)}>
                            {quote.status === 'sent' ? 'Renvoyer' : 'Envoyer'}
                        </Button>
                    )}
                    {canAccept && (
                        <Button size="sm" variant="primary" icon={<Check size={13} />} loading={acceptMutation.isPending} onClick={() => acceptMutation.mutate()}>
                            Accepté
                        </Button>
                    )}
                    {canReject && (
                        <Button size="sm" variant="danger" icon={<X size={13} />} loading={rejectMutation.isPending} onClick={() => rejectMutation.mutate()}>
                            Refusé
                        </Button>
                    )}
                    {canToInvoice && (
                        <Button size="sm" icon={<Receipt size={13} />} loading={toInvoiceMutation.isPending} onClick={() => toInvoiceMutation.mutate()}>
                            Créer la facture
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {/* ── Colonne principale ── */}
                <div className="md:col-span-2 space-y-4">

                    {/* Lignes */}
                    <Card padding="none">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-semibold text-slate-900">Prestations</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left text-xs font-medium text-slate-500 px-5 py-2.5">Description</th>
                                <th className="text-right text-xs font-medium text-slate-500 px-3 py-2.5 hidden sm:table-cell">Qté</th>
                                <th className="text-right text-xs font-medium text-slate-500 px-3 py-2.5 hidden sm:table-cell">P.U. HT</th>
                                <th className="text-right text-xs font-medium text-slate-500 px-5 py-2.5">Total HT</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {quote.lines?.map(line => (
                                <tr key={line.id}>
                                    <td className="px-5 py-3">
                                        <p className="font-medium text-slate-900">{line.description}</p>
                                        {line.details && <p className="text-xs text-slate-500 mt-0.5">{line.details}</p>}
                                        {line.discount_percent > 0 && (
                                            <p className="text-xs text-orange-600 mt-0.5">Remise {line.discount_percent}%</p>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-right text-slate-600 hidden sm:table-cell">
                                        {line.quantity} {line.unit ?? ''}
                                    </td>
                                    <td className="px-3 py-3 text-right text-slate-600 hidden sm:table-cell">
                                        {formatPrice(line.unit_price)}
                                    </td>
                                    <td className="px-5 py-3 text-right font-medium text-slate-900">
                                        {formatPrice(line.line_total_ht)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {/* Totaux */}
                        <div className="border-t border-slate-100 px-5 py-4">
                            <div className="ml-auto w-56 space-y-2">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Total HT</span>
                                    <span>{formatPrice(quote.subtotal_ht)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>TVA ({quote.vat_rate}%)</span>
                                    <span>{formatPrice(quote.vat_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-2">
                                    <span>Total TTC</span>
                                    <span>{formatPrice(quote.total_ttc)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    {quote.footer_notes && (
                        <Card>
                            <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Notes</h2>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{quote.footer_notes}</p>
                        </Card>
                    )}
                </div>

                {/* ── Colonne infos ── */}
                <div className="space-y-4">
                    <Card>
                        <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Client</h2>
                        <p className="text-sm font-semibold text-slate-900">{quote.client?.display_name}</p>
                        {quote.client?.email && <p className="text-xs text-slate-500 mt-1">{quote.client.email}</p>}
                        {quote.client?.phone && <p className="text-xs text-slate-500">{quote.client.phone}</p>}
                        {quote.client?.full_address && <p className="text-xs text-slate-400 mt-1">{quote.client.full_address}</p>}
                    </Card>

                    <Card>
                        <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Détails</h2>
                        <dl className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <dt className="text-slate-500">Émis le</dt>
                                <dd className="font-medium text-slate-900">{formatDate(quote.issued_at)}</dd>
                            </div>
                            {quote.valid_until && (
                                <div className="flex justify-between text-sm">
                                    <dt className="text-slate-500">Valable jusqu'au</dt>
                                    <dd className="font-medium text-slate-900">{formatDate(quote.valid_until)}</dd>
                                </div>
                            )}
                            {quote.sent_at && (
                                <div className="flex justify-between text-sm">
                                    <dt className="text-slate-500">Envoyé le</dt>
                                    <dd className="font-medium text-slate-900">{formatDate(quote.sent_at)}</dd>
                                </div>
                            )}
                            {quote.sent_to_email && (
                                <div className="flex justify-between text-sm">
                                    <dt className="text-slate-500">Envoyé à</dt>
                                    <dd className="font-medium text-slate-900 truncate max-w-[130px]">{quote.sent_to_email}</dd>
                                </div>
                            )}
                        </dl>
                    </Card>
                </div>
            </div>

            {/* ── Modal envoi ── */}
            {showSendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowSendModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-base font-semibold text-slate-900 mb-4">Envoyer le devis</h2>
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-700 block mb-1.5">Email du destinataire</label>
                            <input
                                type="email"
                                value={sendEmail || quote.client?.email || ''}
                                onChange={e => setSendEmail(e.target.value)}
                                placeholder={quote.client?.email ?? 'email@exemple.com'}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setShowSendModal(false)}>Annuler</Button>
                            <Button
                                className="flex-1"
                                icon={<Send size={13} />}
                                loading={sendMutation.isPending}
                                onClick={() => sendMutation.mutate(sendEmail || quote.client?.email)}
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