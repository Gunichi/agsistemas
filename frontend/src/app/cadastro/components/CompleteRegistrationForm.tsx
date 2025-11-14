'use client'

import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'

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

interface CompleteRegistrationFormProps {
  token: string
  intentData: {
    fullName: string
    email: string
  }
  onSuccess: () => void
}

export default function CompleteRegistrationForm({
  token,
  intentData,
  onSuccess,
}: CompleteRegistrationFormProps) {
  const [formData, setFormData] = useState({
    inviteToken: token,
    fullName: intentData.fullName,
    email: intentData.email,
    password: '',
    confirmPassword: '',
    phone: '',
    cpf: '',
    birthDate: '',
    photoUrl: '',
    company: '',
    position: '',
    industry: '',
    businessDescription: '',
    website: '',
    linkedinUrl: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: '',
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const validateStep1 = () => {
    if (!formData.password || formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError(null)
    if (currentStep === 1) {
      if (!validateStep1()) return
    }
    setCurrentStep(currentStep + 1)
  }

  const handlePreviousStep = () => {
    setError(null)
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { confirmPassword, ...submitData } = formData

      const cleanedAddress = Object.fromEntries(
        Object.entries(submitData.address).filter(([_, v]) => v !== '')
      )

      const finalData = {
        ...submitData,
        address: Object.keys(cleanedAddress).length > 0 ? cleanedAddress : undefined,
      }

      await api.completeRegistration(finalData)
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao completar cadastro. Por favor, tente novamente.')
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

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === currentStep
                    ? 'bg-primary-500 text-white'
                    : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={currentStep === 1 ? 'font-semibold' : 'text-gray-500'}>
            Segurança
          </span>
          <span className={currentStep === 2 ? 'font-semibold' : 'text-gray-500'}>
            Dados Pessoais
          </span>
          <span className={currentStep === 3 ? 'font-semibold' : 'text-gray-500'}>
            Profissional
          </span>
        </div>
      </div>

      {currentStep === 1 && (
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
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">
              Este é o email aprovado. Não pode ser alterado.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Senha <span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirmar Senha <span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Digite a senha novamente"
            />
          </div>

          <Button
            type="button"
            onClick={handleNextStep}
            className="w-full bg-primary-500 hover:bg-primary-600"
            size="lg"
          >
            Próximo
          </Button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
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
            <Label htmlFor="cpf">CPF</Label>
            <Input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">URL da Foto</Label>
            <Input
              type="url"
              id="photoUrl"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="https://exemplo.com/sua-foto.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address.street">Rua</Label>
              <Input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Nome da rua"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.number">Número</Label>
              <Input
                type="text"
                id="address.number"
                name="address.number"
                value={formData.address.number}
                onChange={handleChange}
                placeholder="123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.complement">Complemento</Label>
            <Input
              type="text"
              id="address.complement"
              name="address.complement"
              value={formData.address.complement}
              onChange={handleChange}
              placeholder="Apto, sala, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address.neighborhood">Bairro</Label>
              <Input
                type="text"
                id="address.neighborhood"
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleChange}
                placeholder="Nome do bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.city">Cidade</Label>
              <Input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="Sua cidade"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address.state">Estado</Label>
              <Input
                type="text"
                id="address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="SP"
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.zipcode">CEP</Label>
              <Input
                type="text"
                id="address.zipcode"
                name="address.zipcode"
                value={formData.address.zipcode}
                onChange={handleChange}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={handlePreviousStep}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleNextStep}
              className="flex-1 bg-primary-500 hover:bg-primary-600"
              size="lg"
            >
              Próximo
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
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
            <Label htmlFor="position">Cargo</Label>
            <Input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Seu cargo na empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Setor de Atuação</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleSelectChange(value, 'industry')}
            >
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
            <Label htmlFor="businessDescription">Descrição do Negócio</Label>
            <Textarea
              id="businessDescription"
              name="businessDescription"
              rows={4}
              value={formData.businessDescription}
              onChange={handleChange}
              placeholder="Descreva brevemente seu negócio e o que sua empresa faz..."
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://seusite.com.br"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/seu-perfil"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              onClick={handlePreviousStep}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Concluir Cadastro
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}



