import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText } from 'lucide-react'
import toast from 'react-hot-toast'

import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const schema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
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
            const res = await authApi.login(data)
            setAuth(res.token, res.user)
            navigate('/dashboard')
        } catch (err: any) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.errors?.email?.[0] ||
                'Identifiants incorrects.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
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
                    <h1 className="text-lg font-semibold text-slate-900 mb-1">Connexion</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        Accédez à vos devis et factures.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                            placeholder="••••••••"
                            error={errors.password?.message}
                            autoComplete="current-password"
                            {...register('password')}
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full mt-2"
                        >
                            Se connecter
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-500 mt-4">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Créer un compte
                    </Link>
                </p>
            </div>
        </div>
    )
}