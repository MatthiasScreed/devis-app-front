import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import {
    FileText,
    Send,
    CheckCircle2,
    Receipt,
    Smartphone,
    Zap,
    ShieldCheck,
} from 'lucide-react'

// ── Données démo pour la maquette animée ─────────────────────────────────────

const DEMO_LINES = [
    { label: 'Dépose ancienne robinetterie', qty: '1', unit: 'forfait', price: '45,00' },
    { label: 'Fourniture mitigeur thermostatique', qty: '1', unit: 'u', price: '189,00' },
    { label: "Pose et raccordement", qty: '2', unit: 'h', price: '90,00' },
]

export default function LandingPage() {
    return (
        <div className="bg-[#FAFAF7] text-[#1C1C1A]">
            <Nav />
            <Hero />
            <SocialProofBar />
            <HowItWorks />
            <ComplianceNote />
            <Pricing />
            <FinalCta />
            <Footer />
        </div>
    )
}

// ── Navigation ───────────────────────────────────────────────────────────────

function Nav() {
    return (
        <header className="sticky top-0 z-40 bg-[#FAFAF7]/90 backdrop-blur-sm border-b border-[#E2E0D8]">
            <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-[#1C1C1A] flex items-center justify-center">
                        <FileText size={14} className="text-[#FAFAF7]" />
                    </div>
                    <span className="font-semibold tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            DevisApp
          </span>
                </div>
                <Link
                    to="/login"
                    className="text-sm font-medium px-4 py-2 rounded-full border border-[#1C1C1A] hover:bg-[#1C1C1A] hover:text-[#FAFAF7] transition-colors duration-200"
                >
                    Se connecter
                </Link>
            </div>
        </header>
    )
}

// ── Hero avec devis animé ────────────────────────────────────────────────────

function Hero() {
    const [visibleLines, setVisibleLines] = useState(0)
    const [showTotal, setShowTotal] = useState(false)

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = []
        DEMO_LINES.forEach((_, i) => {
            timers.push(setTimeout(() => setVisibleLines(i + 1), 600 + i * 500))
        })
        timers.push(setTimeout(() => setShowTotal(true), 600 + DEMO_LINES.length * 500 + 300))
        return () => timers.forEach(clearTimeout)
    }, [])

    const subtotal = DEMO_LINES.slice(0, visibleLines).reduce(
        (sum, l) => sum + parseFloat(l.price.replace(',', '.')) * parseFloat(l.qty),
        0
    )
    const vat = subtotal * 0.2
    const total = subtotal + vat

    return (
        <section className="max-w-5xl mx-auto px-5 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
            {/* Texte */}
            <div>
        <span className="inline-block text-xs font-medium tracking-wide uppercase text-[#D4622A] mb-4">
          Pour plombiers, électriciens, peintres
        </span>
                <h1
                    className="text-4xl sm:text-5xl leading-[1.05] tracking-tight mb-5"
                    style={{ fontFamily: 'Fraunces, serif', fontWeight: 600 }}
                >
                    Le devis qui part
                    <br />
                    avant le café froidisse.
                </h1>
                <p className="text-base text-[#1C1C1A]/70 mb-7 max-w-md leading-relaxed">
                    Créez un devis chiffré, envoyez-le par email et transformez-le en
                    facture — sans quitter le chantier. Pensé pour les artisans seuls,
                    pas pour les bureaux d'études.
                </p>
                <div className="flex items-center gap-4">
                    <Link
                        to="/register"
                        className="px-6 py-3 rounded-full bg-[#1C1C1A] text-[#FAFAF7] text-sm font-medium hover:bg-[#1C1C1A]/90 transition-colors"
                    >
                        Essayer gratuitement
                    </Link>
                    <span className="text-sm text-[#1C1C1A]/50">9€/mois · sans engagement</span>
                </div>
            </div>

            {/* Maquette devis animée */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl border border-[#E2E0D8] shadow-[0_2px_24px_-4px_rgba(0,0,0,0.08)] p-6"
            >
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-xs text-[#1C1C1A]/40 uppercase tracking-wide">Devis</p>
                        <p className="font-semibold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            DEV-2026-014
                        </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#FAFAF7] border border-[#E2E0D8] text-[#1C1C1A]/60">
            Brouillon
          </span>
                </div>

                <div className="space-y-2.5 mb-4 min-h-[120px]">
                    {DEMO_LINES.slice(0, visibleLines).map((line, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between text-sm border-b border-[#F0EFE9] pb-2.5"
                        >
                            <span className="text-[#1C1C1A]/80">{line.label}</span>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[#1C1C1A]/60 shrink-0 ml-3">
                {line.price} €
              </span>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showTotal ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="border-t border-[#E2E0D8] pt-3 space-y-1.5"
                >
                    <div className="flex justify-between text-xs text-[#1C1C1A]/50">
                        <span>Total HT</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#1C1C1A]/50">
                        <span>TVA 20%</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{vat.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-1">
                        <span>Total TTC</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-[#D4622A]">
              {total.toFixed(2)} €
            </span>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    )
}

// ── Bande "réassurance" ──────────────────────────────────────────────────────

function SocialProofBar() {
    const items = [
        { icon: Zap, label: 'Devis créé en 3 minutes' },
        { icon: Smartphone, label: '100% utilisable au téléphone' },
        { icon: ShieldCheck, label: 'Mentions légales automatiques' },
    ]
    return (
        <div className="border-y border-[#E2E0D8] bg-white">
            <div className="max-w-5xl mx-auto px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {items.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-sm text-[#1C1C1A]/70">
                        <Icon size={16} className="text-[#D4622A] shrink-0" />
                        {label}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Comment ça marche ────────────────────────────────────────────────────────

const STEPS = [
    {
        icon: FileText,
        title: 'Créez le devis',
        body: 'Choisissez le client, ajoutez vos lignes de prestation. Le total HT, la TVA et le TTC se calculent tout seuls.',
    },
    {
        icon: Send,
        title: 'Envoyez-le',
        body: "Un clic suffit. Votre client reçoit un PDF professionnel par email, avec vos mentions légales déjà dedans.",
    },
    {
        icon: CheckCircle2,
        title: 'Il accepte',
        body: 'Marquez le devis comme accepté dès que le client donne son accord — par téléphone, email ou sur place.',
    },
    {
        icon: Receipt,
        title: 'Facturez',
        body: 'Le devis accepté devient une facture en un clic, avec le même contenu et un nouveau numéro.',
    },
]

function HowItWorks() {
    return (
        <section className="max-w-5xl mx-auto px-5 py-20">
            <h2
                className="text-3xl mb-12 tracking-tight"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 600 }}
            >
                De la visite chez le client
                <br />
                à l'argent sur le compte.
            </h2>

            <div className="grid sm:grid-cols-2 gap-px bg-[#E2E0D8] rounded-2xl overflow-hidden">
                {STEPS.map((step, i) => (
                    <StepCard key={step.title} step={step} index={i} />
                ))}
            </div>
        </section>
    )
}

function StepCard({
                      step,
                      index,
                  }: {
    step: (typeof STEPS)[number]
    index: number
}) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-40px' })
    const Icon = step.icon

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="bg-[#FAFAF7] p-7"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E0D8] flex items-center justify-center text-[#D4622A]">
                    <Icon size={16} />
                </div>
                <span
                    className="text-xs text-[#1C1C1A]/30"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
          {String(index + 1).padStart(2, '0')}
        </span>
            </div>
            <h3 className="font-semibold mb-1.5">{step.title}</h3>
            <p className="text-sm text-[#1C1C1A]/60 leading-relaxed">{step.body}</p>
        </motion.div>
    )
}

// ── Note conformité facturation électronique ─────────────────────────────────

function ComplianceNote() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-40px' })

    return (
        <section className="max-w-5xl mx-auto px-5 pb-20">
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl border border-[#E2E0D8] p-6 sm:p-7 flex items-start gap-4"
            >
                <div className="w-9 h-9 rounded-lg bg-[#FAFAF7] border border-[#E2E0D8] flex items-center justify-center text-[#2D5F3E] shrink-0">
                    <ShieldCheck size={16} />
                </div>
                <div>
                    <h3 className="font-semibold mb-1">Conforme facturation électronique 2027*</h3>
                    <p className="text-sm text-[#1C1C1A]/60 leading-relaxed max-w-2xl">
                        La réforme de la facturation électronique s'applique aux artisans
                        et TPE à partir de septembre 2027. DevisApp évolue pour rester
                        conforme sans que vous ayez quoi que ce soit à faire de votre côté.
                    </p>
                    <p className="text-xs text-[#1C1C1A]/35 mt-2">
                        *Intégration en cours — déploiement prévu avant l'échéance réglementaire.
                    </p>
                </div>
            </motion.div>
        </section>
    )
}

// ── Tarif ────────────────────────────────────────────────────────────────────

function Pricing() {
    const features = [
        'Devis et factures illimités',
        'Clients illimités',
        'Envoi par email automatique',
        'PDF professionnel avec votre logo',
        'Mentions légales pré-remplies',
        'Accessible depuis votre téléphone',
    ]

    return (
        <section className="bg-white border-y border-[#E2E0D8]">
            <div className="max-w-5xl mx-auto px-5 py-20">
                <div className="max-w-sm mx-auto text-center">
                    <h2
                        className="text-3xl mb-2 tracking-tight"
                        style={{ fontFamily: 'Fraunces, serif', fontWeight: 600 }}
                    >
                        Un seul tarif.
                    </h2>
                    <p className="text-sm text-[#1C1C1A]/60 mb-8">
                        Pas de palier, pas d'option cachée.
                    </p>

                    <div className="rounded-2xl border-2 border-[#1C1C1A] p-8">
                        <div className="flex items-baseline justify-center gap-1 mb-6">
              <span
                  className="text-5xl font-semibold"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                9€
              </span>
                            <span className="text-sm text-[#1C1C1A]/50">/mois</span>
                        </div>

                        <ul className="space-y-2.5 text-left mb-7">
                            {features.map(f => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-[#1C1C1A]/75">
                                    <CheckCircle2 size={15} className="text-[#2D5F3E] shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <Link
                            to="/register"
                            className="block w-full text-center px-6 py-3 rounded-full bg-[#1C1C1A] text-[#FAFAF7] text-sm font-medium hover:bg-[#1C1C1A]/90 transition-colors"
                        >
                            Commencer maintenant
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ── CTA final ────────────────────────────────────────────────────────────────

function FinalCta() {
    return (
        <section className="max-w-3xl mx-auto px-5 py-24 text-center">
            <h2
                className="text-3xl sm:text-4xl mb-5 tracking-tight"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 600 }}
            >
                Votre prochain devis peut partir
                <br />
                avant ce soir.
            </h2>
            <Link
                to="/register"
                className="inline-block px-7 py-3.5 rounded-full bg-[#D4622A] text-white text-sm font-medium hover:bg-[#D4622A]/90 transition-colors"
            >
                Créer mon compte gratuitement
            </Link>
        </section>
    )
}

// ── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
    return (
        <footer className="border-t border-[#E2E0D8] py-8">
            <div className="max-w-5xl mx-auto px-5 flex items-center justify-between text-xs text-[#1C1C1A]/40">
                <span>© 2026 DevisApp</span>
                <span>Fait pour les artisans, pas pour les bureaux d'études.</span>
            </div>
        </footer>
    )
}