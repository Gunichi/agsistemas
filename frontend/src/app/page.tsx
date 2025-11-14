import Link from 'next/link'

import Header from '@/components/header/header'

import Footer from '@/components/footer/footer'
import { ArrowRight, KeyRound } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gestão de grupos de{' '}
            <span className="text-primary-600 animate-pulse">Networking</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Faça parte de um grupo exclusivo de profissionais comprometidos em
            gerar oportunidades reais de negócio através do networking estratégico.
          </p>
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/apply"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 text-lg font-semibold"
              >
                Quero Participar
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition text-lg font-semibold"
              >
                Área do Membro
              </Link>
            </div>
            
            <div className="pt-4">
              <Link
                href="/cadastro/validar"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition text-sm font-medium"
              >
                <KeyRound className="w-4 h-4" />
                Já tenho um token de convite
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer textColor="#000" />
    </div>
  )
}


