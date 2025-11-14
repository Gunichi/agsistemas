'use client'

import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  isTokenUsed?: boolean
  isTokenExpired?: boolean
  error?: string | null
}

const Error = ({ isTokenUsed, isTokenExpired, error }: ErrorProps) => {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isTokenUsed ? 'Convite Já Utilizado' : isTokenExpired ? 'Token Expirado' : 'Token Inválido'}
        </h2>
        <p className="text-gray-600 mb-6">
          {error || 'O token de convite não é válido ou expirou.'}
        </p>

        {isTokenUsed && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              ℹ️ O que fazer?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Seu cadastro já foi completado anteriormente</li>
              <li>• Se você não completou, entre em contato com o administrador</li>
              <li>• Caso precise de um novo convite, solicite ao admin</li>
            </ul>
          </div>
        )}

        {isTokenExpired && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-orange-900 mb-2">
              ⏰ Token Expirado
            </h3>
            <p className="text-sm text-orange-700">
              Este convite tinha validade de 7 dias e expirou. Entre em contato com o administrador para receber um novo convite.
            </p>
          </div>
        )}

        <Button
          onClick={() => router.push('/')}
          className="bg-primary-500 hover:bg-primary-600"
        >
          Voltar para a Página Inicial
        </Button>
      </div>
    </div>
  )
}

export default Error;