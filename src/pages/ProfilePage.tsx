import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import type { User as UserType } from '../types/models'
import { useAuthStore } from '../store/authStore'
import Header from '../components/layout/Header'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Card from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { VAT_RATES } from '../utils/formatters'

const schema = z.object({
    name: z.string().min(2, 'Nom requis'),
    company_name: z.string().optional(),
    siret: z.string().max(14).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().max(10).optional(),
    is_vat_registered: z.boolean().optional(),
    vat_number: z.string().optional(),
    default_vat_rate: z.coerce.number(),
    legal_mentions: z.string().optional(),
    payment_terms: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
    const queryClient = useQueryClient()
    const { setUser } = useAuthStore()
    const fileRef = useRef<HTMLInputElement>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await api.get<UserType>('/profile')
            return res.data
        },
    })

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            company_name: '',
            siret: '',
            phone: '',
            address: '',
            city: '',
            postal_code: '',
            is_vat_registered: false,
            vat_number: '',
            default_vat_rate: 20,
            legal_mentions: '',
            payment_terms: '',
        },
    })

    useEffect(() => {
        if (profile) {
            reset({
                name: profile.name,
                company_name: profile.company_name ?? '',
                siret: profile.siret ?? '',
                phone: profile.phone ?? '',
                address: profile.address ?? '',
                city: profile.city ?? '',
                postal_code: profile.postal_code ?? '',
                is_vat_registered: profile.is_vat_registered,
                vat_number: profile.vat_number ?? '',
                default_vat_rate: profile.default_vat_rate,
                legal_mentions: profile.legal_mentions ?? '',
                payment_terms: profile.payment_terms ?? '',
            })
            if (profile.logo_path) {
                setLogoPreview(`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${profile.logo_path}`)
            }
        }
    }, [profile, reset])

    const updateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await api.put<UserType>('/profile', data)
            return res.data
        },
        onSuccess: (updatedUser) => {
            setUser(updatedUser)
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            toast.success('Profil mis à jour')
        },
        onError: () => toast.error('Erreur lors de la sauvegarde'),
    })

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Préview local
        const reader = new FileReader()
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
        reader.readAsDataURL(file)

        // Upload
        setUploadingLogo(true)
        try {
            const formData = new FormData()
            formData.append('logo', file)
            const res = await api.post<{ logo_url: string }>('/profile/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setLogoPreview(res.data.logo_url)
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            toast.success('Logo mis à jour')
        } catch {
            toast.error('Erreur lors de l\'upload du logo')
        } finally {
            setUploadingLogo(false)
        }
    }

    const isVatRegistered = watch('is_vat_registered')

    if (isLoading) return <PageSpinner />

    return (
        <div>
            <Header
                title="Paramètres"
                subtitle="Informations de votre entreprise"
                actions={
                    <Button
                        size="sm"
                        loading={isSubmitting}
                        disabled={!isDirty}
                        onClick={handleSubmit(data => updateMutation.mutate(data))}
                    >
                        Enregistrer
                    </Button>
                }
            />

            <form onSubmit={handleSubmit(data => updateMutation.mutate(data))} className="space-y-4">

                {/* ── Logo ── */}
                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Logo</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                            ) : (
                                <User size={24} className="text-slate-300" />
                            )}
                        </div>
                        <div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleLogoChange}
                                className="sr-only"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                icon={<Upload size={13} />}
                                loading={uploadingLogo}
                                onClick={() => fileRef.current?.click()}
                            >
                                Changer le logo
                            </Button>
                            <p className="text-xs text-slate-400 mt-1.5">PNG, JPG ou WebP · Max 2 Mo</p>
                        </div>
                    </div>
                </Card>

                {/* ── Informations personnelles ── */}
                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Informations personnelles</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Nom complet"
                            required
                            {...register('name')}
                            error={errors.name?.message}
                        />
                        <Input
                            label="Nom de l'entreprise"
                            placeholder="Plomberie Dupont"
                            {...register('company_name')}
                            error={errors.company_name?.message}
                        />
                        <Input
                            label="Téléphone"
                            type="tel"
                            placeholder="06 00 00 00 00"
                            {...register('phone')}
                            error={errors.phone?.message}
                        />
                        <Input
                            label="SIRET"
                            placeholder="12345678900000"
                            {...register('siret')}
                            error={errors.siret?.message}
                            hint="14 chiffres"
                        />
                    </div>
                </Card>

                {/* ── Adresse ── */}
                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Adresse</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Adresse"
                            placeholder="12 rue de la Paix"
                            className="sm:col-span-2"
                            {...register('address')}
                        />
                        <Input
                            label="Code postal"
                            placeholder="75001"
                            {...register('postal_code')}
                        />
                        <Input
                            label="Ville"
                            placeholder="Paris"
                            {...register('city')}
                        />
                    </div>
                </Card>

                {/* ── TVA ── */}
                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">TVA</h2>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                {...register('is_vat_registered')}
                            />
                            <span className="text-sm text-slate-700">Assujetti à la TVA</span>
                        </label>

                        {isVatRegistered && (
                            <Input
                                label="Numéro de TVA intracommunautaire"
                                placeholder="FR12345678900"
                                {...register('vat_number')}
                            />
                        )}

                        <Select
                            label="Taux de TVA par défaut"
                            options={VAT_RATES.map(r => ({ value: r.value, label: r.label }))}
                            {...register('default_vat_rate')}
                        />
                    </div>
                </Card>

                {/* ── Mentions légales ── */}
                <Card>
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Mentions légales sur les devis</h2>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Mentions légales</label>
                            <textarea
                                rows={3}
                                placeholder="Ex: TVA non applicable, art. 293B du CGI..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none placeholder:text-slate-400"
                                {...register('legal_mentions')}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Conditions de paiement</label>
                            <textarea
                                rows={2}
                                placeholder="Ex: Paiement à 30 jours à compter de la date de facture..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none placeholder:text-slate-400"
                                {...register('payment_terms')}
                            />
                        </div>
                    </div>
                </Card>

                {/* ── Actions mobile ── */}
                <div className="sm:hidden pb-4">
                    <Button
                        type="submit"
                        className="w-full"
                        loading={isSubmitting}
                        disabled={!isDirty}
                    >
                        Enregistrer les modifications
                    </Button>
                </div>
            </form>
        </div>
    )
}