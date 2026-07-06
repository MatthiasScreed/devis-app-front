import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText } from 'lucide-react'
import toast from 'react-hot-toast'

import { authApi } from '../../api/Auth'
import { useAuthStore } from '../../store/AuthStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
    name: z.string().min(2, 'Nom requis (2 caractères minimum)'),
    company_name: z.string().optional(),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
    const navigate = useNavigate()
    const setAuth = useAuthStore(s => s.setAuth)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) })

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        try {
            const res = await authApi.register(data)
            setAuth(res.token, res.user)
            toast.success('Compte créé avec succès !')
            navigate('/dashboard')
        } catch (err: any) {
            const firstError = Object.values(
                err.response?.data?.errors ?? {}
            )[0] as string[] | undefined
            toast.error(firstError?.[0] ?? 'Une erreur est survenue.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <FileText size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-slate-900 text-lg">DevisApp</span>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h1 className="text-lg font-semibold text-slate-900 mb-1">Créer un compte</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Commencez à envoyer des devis professionnels.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Nom complet"
                            type="text"
                            placeholder="Jean Dupont"
                            error={errors.name?.message}
                            autoComplete="name"
                            {...register('name')}
                        />
                        <Input
                            label="Nom de l'entreprise"
                            type="text"
                            placeholder="Plomberie Dupont (optionnel)"
                            error={errors.company_name?.message}
                            {...register('company_name')}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="jean@example.com"
                            error={errors.email?.message}
                            autoComplete="email"
                            {...register('email')}
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="Minimum 8 caractères"
                            error={errors.password?.message}
                            autoComplete="new-password"
                            {...register('password')}
                        />
                        <Input
                            label="Confirmer le mot de passe"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password_confirmation?.message}
                            autoComplete="new-password"
                            {...register('password_confirmation')}
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full mt-2"
                        >
                            Créer mon compte
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-500 mt-4">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    )
}