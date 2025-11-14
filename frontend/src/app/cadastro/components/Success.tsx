'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

const Success = () => {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cadastro Completo!
        </h2>
        <p className="text-gray-600 mb-6">
          Seu cadastro foi realizado com sucesso. Bem-vindo(a) ao grupo!
        </p>
        <Button
          onClick={() => router.push('/')}
          className="bg-green-500 hover:bg-green-600"
        >
          Ir para a Página Inicial
        </Button>
      </div>
    </div>
  )
}

export default Success