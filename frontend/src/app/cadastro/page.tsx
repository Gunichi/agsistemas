'use client'

import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { api } from '@/lib/api'
import CompleteRegistrationForm from './components/CompleteRegistrationForm'
import Error from './components/Error'
import Success from './components/Success'
import Validate from './components/Validate'

function CadastroContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [validating, setValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [intentData, setIntentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token não fornecido')
        setValidating(false)
        return
      }

      try {
        const response = await api.validateInviteToken(token)
        setIsValid(true)
        setIntentData(response.data.intent)
      } catch (err) {
        setError('Erro ao validar token')
        setIsValid(false)
      } finally {
        setValidating(false)
      }
    }
    validateToken()
  }, [token])

  const handleSuccess = () => {
    setSuccess(true)
  }

  if (validating) {
    return (
     <Validate />
    )
  }

  if (error || !isValid) {
    const isTokenUsed = error?.includes('já foi utilizado')
    const isTokenExpired = error?.includes('expirado')

    return (
      <Error isTokenUsed={isTokenUsed} isTokenExpired={isTokenExpired} error={error} />
    )
  }

  if (success) {
    return (
      <Success />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete seu Cadastro
          </h1>
          <p className="text-lg text-gray-600">
            Olá, <span className="font-semibold">{intentData?.fullName}</span>!
            <br />
            Preencha os dados abaixo para finalizar seu cadastro.
          </p>
        </div>

        <CompleteRegistrationForm
          token={token!}
          intentData={intentData}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Carregando...
            </h2>
          </div>
        </div>
      }
    >
      <CadastroContent />
    </Suspense>
  )
}

