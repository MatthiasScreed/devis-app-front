import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { quotesApi } from '../../api/Quotes'
import { clientsApi } from '../../api/Clients'
import Header from '../../components/layout/Header'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import { today, addDays, formatPrice, calcLineTotal, calcTotals, UNITS, VAT_RATES } from '../../utils/formatters'

const lineSchema = z.object({
    description: z.string().min(1, 'Description requise'),
    quantity: z.coerce.number().min(0.01),
    unit_price: z.coerce.number().min(0),
    unit: z.string().default('h'),
    discount_percent: z.coerce.number().min(0).max(100).default(0),
})

const schema = z.object({
    subject: z.string().optional(),
    issued_at: z.string().min(1, 'Date requise'),
    valid_until: z.string().optional(),
    vat_rate: z.coerce.number(),
    footer_notes: z.string().optional(),
    lines: z.array(lineSchema).min(1),
})

type FormData = z.infer<typeof schema>

export default function QuoteNewPage() {
    const navigate = useNavigate()

    // client géré en state React pur — pas de RHF
    const [clientId, setClientId] = useState<number>(0)
    const [clientError, setClientError] = useState('')

    // charge tous les clients une seule fois
    const { data: clientsData } = useQuery({
        queryKey: ['clients-all'],
        queryFn: () => clientsApi.list({ page: 1 }),
    })

    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            subject: '',
            issued_at: today(),
            valid_until: addDays(30),
            vat_rate: 20,
            footer_notes: '',
            lines: [{ description: '', quantity: 1, unit_price: 0, unit: 'h', discount_percent: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
    const lines = watch('lines')
    const vatRate = watch('vat_rate')

    const lineTotals = lines.map(l =>
        calcLineTotal(Number(l.quantity) || 0, Number(l.unit_price) || 0, Number(l.discount_percent) || 0)
    )
    const { subtotalHT, vatAmount, totalTTC } = calcTotals(
        lineTotals.map(t => ({ line_total_ht: t })),
        Number(vatRate) || 0
    )

    const createMutation = useMutation({
        mutationFn: quotesApi.create,
        onSuccess: (quote) => {
            toast.success(`Devis ${quote.number} créé`)
            navigate(`/app/quotes/${quote.id}`)
        },
        onError: () => toast.error('Erreur lors de la création'),
    })

    const onSubmit = (data: FormData) => {
        if (!clientId) {
            setClientError('Veuillez sélectionner un client')
            return
        }
        createMutation.mutate({
            ...data,
            client_id: clientId,
            lines: data.lines.map(l => ({
                ...l,
                quantity: Number(l.quantity),
                unit_price: Number(l.unit_price),
                discount_percent: Number(l.discount_percent ?? 0),
            })),
        })
    }

    return (
        <div>
            <Header
                title="Nouveau devis"
                actions={
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => navigate('/app/quotes')}>
                            Annuler
                        </Button>
                        <Button size="sm" loading={createMutation.isPending} onClick={handleSubmit(onSubmit)}>
                            Créer le devis
                        </Button>
                    </div>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Informations</h2>
                    <div className="grid sm:grid-cols-2 gap-4">

                        {/* Client — select natif, zéro problème de focus */}
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">
                                Client <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={clientId}
                                onChange={e => {
                                    setClientId(Number(e.target.value))
                                    setClientError('')
                                }}
                                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 10px center',
                                    paddingRight: '28px',
                                }}
                            >
                                <option value={0}>-- Sélectionner un client --</option>
                                {clientsData?.data.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.display_name}{c.email ? ` — ${c.email}` : ''}
                                    </option>
                                ))}
                            </select>
                            {clientError && <p className="text-xs text-red-600">{clientError}</p>}
                        </div>

                        <Input
                            label="Objet du devis"
                            placeholder="Ex: Rénovation salle de bain"
                            {...register('subject')}
                        />
                        <Select
                            label="TVA"
                            options={VAT_RATES.map(r => ({ value: r.value, label: r.label }))}
                            {...register('vat_rate')}
                        />
                        <Input
                            label="Date d'émission"
                            type="date"
                            required
                            {...register('issued_at')}
                            error={errors.issued_at?.message}
                        />
                        <Input
                            label="Valable jusqu'au"
                            type="date"
                            {...register('valid_until')}
                        />
                    </div>
                </Card>

                <Card padding="none">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-900">Prestations</h2>
                    </div>

                    <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-medium">
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2">Quantité</div>
                        <div className="col-span-1">Unité</div>
                        <div className="col-span-2">Prix HT</div>
                        <div className="col-span-1">Rem. %</div>
                        <div className="col-span-2 text-right">Total HT</div>
                    </div>

                    <div className="divide-y divide-slate-50">
                        {fields.map((field, index) => {
                            const lineTotal = lineTotals[index] ?? 0
                            return (
                                <div key={field.id} className="grid grid-cols-12 gap-2 px-5 py-3 items-start group">
                                    <div className="col-span-11 sm:col-span-4">
                                        <input
                                            placeholder="Description de la prestation"
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            {...register(`lines.${index}.description`)}
                                        />
                                        {errors.lines?.[index]?.description && (
                                            <p className="text-xs text-red-500 mt-1">{errors.lines[index].description?.message}</p>
                                        )}
                                    </div>
                                    <div className="col-span-6 sm:col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="1"
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            {...register(`lines.${index}.quantity`)}
                                        />
                                    </div>
                                    <div className="col-span-5 sm:col-span-1">
                                        <select
                                            className="w-full h-9 px-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                                            {...register(`lines.${index}.unit`)}
                                        >
                                            {UNITS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-6 sm:col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            {...register(`lines.${index}.unit_price`)}
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-1">
                                        <input
                                            type="number"
                                            step="1"
                                            placeholder="0"
                                            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                            {...register(`lines.${index}.discount_percent`)}
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-2">
                    <span className="text-sm font-medium text-slate-900 hidden sm:block">
                      {formatPrice(lineTotal)}
                    </span>
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="p-1.5 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="px-5 py-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => append({ description: '', quantity: 1, unit_price: 0, unit: 'h', discount_percent: 0 })}
                            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <Plus size={14} />
                            Ajouter une ligne
                        </button>
                    </div>

                    <div className="border-t border-slate-100 px-5 py-4">
                        <div className="ml-auto w-64 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Total HT</span>
                                <span>{formatPrice(subtotalHT)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>TVA ({vatRate}%)</span>
                                <span>{formatPrice(vatAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold text-slate-900 border-t border-slate-100 pt-2">
                                <span>Total TTC</span>
                                <span>{formatPrice(totalTTC)}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 mb-3">Notes de bas de page</h2>
                    <textarea
                        placeholder="Conditions de paiement, mentions légales..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                        {...register('footer_notes')}
                    />
                </Card>

                <div className="flex gap-3 sm:hidden pb-4">
                    <Button variant="secondary" className="flex-1" onClick={() => navigate('/app/quotes')}>
                        Annuler
                    </Button>
                    <Button className="flex-1" loading={createMutation.isPending} onClick={handleSubmit(onSubmit)}>
                        Créer le devis
                    </Button>
                </div>
            </form>
        </div>
    )
}
