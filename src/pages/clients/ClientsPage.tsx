import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, User, Building2, Phone, Mail, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { clientsApi } from '../../api/clients'
import type { Client } from '../../types/models'
import Header from '../../components/layout/Header'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { PageSpinner } from '../../components/ui/Spinner'

const schema = z.object({
    type: z.enum(['individual', 'company']),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    company_name: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ClientsPage() {
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ['clients', search],
        queryFn: () => clientsApi.list({ search: search || undefined }),
    })

    const deleteMutation = useMutation({
        mutationFn: clientsApi.delete,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast.success('Client supprimé') },
        onError: () => toast.error('Impossible de supprimer ce client'),
    })

    const closeModal = () => { setShowModal(false); setEditingClient(null) }

    return (
        <div>
            <Header
                title="Clients"
                subtitle={data ? `${data.total} client${data.total > 1 ? 's' : ''}` : undefined}
                actions={<Button size="sm" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>Nouveau client</Button>}
            />
            <div className="mb-4">
                <Input placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search size={14} />} />
            </div>
            {isLoading ? <PageSpinner /> : data?.data.length === 0 ? (
                <EmptyState icon={<User size={32} />} title="Aucun client" description="Ajoutez votre premier client pour commencer à créer des devis." action={{ label: 'Ajouter un client', onClick: () => setShowModal(true) }} />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data?.data.map(client => (
                        <ClientCard key={client.id} client={client}
                                    onEdit={() => { setEditingClient(client); setShowModal(true) }}
                                    onDelete={() => { if (confirm('Supprimer ce client ?')) deleteMutation.mutate(client.id) }}
                        />
                    ))}
                </div>
            )}
            {showModal && (
                <ClientModal client={editingClient} onClose={closeModal}
                             onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['clients'] }); closeModal() }}
                />
            )}
        </div>
    )
}

function ClientCard({ client, onEdit, onDelete }: { client: Client; onEdit: () => void; onDelete: () => void }) {
    return (
        <Card padding="md" className="group cursor-pointer hover:border-slate-300 transition-colors">
            <div onClick={onEdit} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                    {client.type === 'company' ? <Building2 size={16} /> : <User size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{client.display_name}</p>
                    {client.email && <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate"><Mail size={11} />{client.email}</p>}
                    {client.phone && <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Phone size={11} />{client.phone}</p>}
                    {client.city && <p className="text-xs text-slate-400 mt-1">{client.city}</p>}
                </div>
            </div>
            <div className="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                </button>
            </div>
        </Card>
    )
}

function ClientModal({ client, onClose, onSuccess }: { client: Client | null; onClose: () => void; onSuccess: () => void }) {
    const isEdit = !!client
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: client ? { type: client.type, first_name: client.first_name ?? '', last_name: client.last_name ?? '', company_name: client.company_name ?? '', email: client.email ?? '', phone: client.phone ?? '', address: client.address ?? '', city: client.city ?? '', postal_code: client.postal_code ?? '' } : { type: 'individual' },
    })
    const type = watch('type')
    const onSubmit = async (data: FormData) => {
        try {
            if (isEdit) { await clientsApi.update(client!.id, data); toast.success('Client mis à jour') }
            else { await clientsApi.create(data); toast.success('Client créé') }
            onSuccess()
        } catch { toast.error('Une erreur est survenue') }
    }
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">{isEdit ? 'Modifier le client' : 'Nouveau client'}</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        {(['individual', 'company'] as const).map(t => (
                            <label key={t} className="flex-1">
                                <input type="radio" value={t} {...register('type')} className="sr-only" />
                                <div className={['flex items-center justify-center gap-2 py-2.5 text-sm cursor-pointer transition-colors', watch('type') === t ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-50'].join(' ')}>
                                    {t === 'individual' ? <User size={14} /> : <Building2 size={14} />}
                                    {t === 'individual' ? 'Particulier' : 'Entreprise'}
                                </div>
                            </label>
                        ))}
                    </div>
                    {type === 'individual' ? (
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Prénom" {...register('first_name')} error={errors.first_name?.message} />
                            <Input label="Nom" {...register('last_name')} error={errors.last_name?.message} />
                        </div>
                    ) : (
                        <Input label="Nom de l'entreprise" {...register('company_name')} error={errors.company_name?.message} />
                    )}
                    <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
                    <Input label="Téléphone" type="tel" {...register('phone')} error={errors.phone?.message} />
                    <Input label="Adresse" {...register('address')} error={errors.address?.message} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Code postal" {...register('postal_code')} error={errors.postal_code?.message} />
                        <Input label="Ville" {...register('city')} error={errors.city?.message} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
                        <Button type="submit" loading={isSubmitting} className="flex-1">{isEdit ? 'Enregistrer' : 'Créer le client'}</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}