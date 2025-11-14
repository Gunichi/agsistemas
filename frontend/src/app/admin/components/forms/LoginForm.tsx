'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

interface LoginFormProps {
  onLogin: (apiKey: string) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) {
      setError('Por favor, insira a API Key')
      return
    }
    setError(null)
    onLogin(apiKey)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary-600">Área Administrativa</CardTitle>
          <CardDescription>
            Insira a API Key para acessar o painel de administração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Insira sua API Key"
                className="mt-1"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-primary-600 text-white hover:bg-primary-700">
              Acessar Painel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

