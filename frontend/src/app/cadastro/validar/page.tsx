'use client'

import { CheckCircle, KeyRound, Loader2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export default function ValidarTokenPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token.trim()) {
      setError('Por favor, insira o token de convite')
      return
    }

    setValidating(true)
    setError(null)

    try {
      const response = await api.validateInviteToken(token.trim())

      if (response.data.valid) {
        router.push(`/cadastro?token=${token.trim()}`)
      }
    } catch (err) {
      setError('Erro ao validar token. Por favor, tente novamente.')
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Validar Token
            </h1>
            <p className="text-gray-600">
              Insira o token de convite que você recebeu para continuar com seu cadastro
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="token">
                Token de Convite <span className="text-red-500">*</span>
              </Label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ex: 70828a9b-24e1-4099-b7df-cc1528fde4b8"
                className="font-mono text-sm"
                disabled={validating}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={validating || !token.trim()}
              className="w-full bg-primary-500 hover:bg-primary-600"
              size="lg"
            >
              {validating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Validar e Continuar
                </>
              )}
            </Button>
          </form>


          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Voltar para a página inicial
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}



