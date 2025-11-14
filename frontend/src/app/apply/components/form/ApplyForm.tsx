'use client'

import { useState } from 'react'

import { Send } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import { ApiError } from '@/types'

interface ApplyFormProps {
  onSuccess: () => void
}

export default function ApplyForm({ onSuccess }: ApplyFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    motivation: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      industry: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await api.submitMembershipIntent(formData)

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        industry: '',
        motivation: ''
      })
      
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao enviar. Por favor, tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nome Completo <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            id="fullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Seu nome completo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Nome da sua empresa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Setor de Atuação</Label>
          <Select value={formData.industry} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
              <SelectItem value="Saúde">Saúde</SelectItem>
              <SelectItem value="Educação">Educação</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
              <SelectItem value="Varejo">Varejo</SelectItem>
              <SelectItem value="Serviços">Serviços</SelectItem>
              <SelectItem value="Indústria">Indústria</SelectItem>
              <SelectItem value="Consultoria">Consultoria</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Imobiliário">Imobiliário</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivation">
            Por que você quer participar? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="motivation"
            name="motivation"
            required
            rows={5}
            value={formData.motivation}
            onChange={handleChange}
            placeholder="Conte-nos sobre suas expectativas e o que você espera do grupo de networking..."
            className="resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 hover:bg-primary-600"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Enviar Intenção
            </>
          )}
        </Button>
      </div>
    </form>
  )
}