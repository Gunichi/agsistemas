'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  TrendingUp, 
  Heart, 
  Calendar,
  Loader2} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { ApiError } from '@/types'
import Header from '../components/Header/header'
import { DashboardStats } from '@/types/dashboard'
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)

  useEffect(() => {
    const storedKey = localStorage.getItem('admin_api_key')
    if (!storedKey) {
      router.push('/admin')
      return
    }
    setApiKey(storedKey)
    loadStats(storedKey)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin_api_key')
    router.push('/admin')
  }

  const loadStats = async (key: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.getDashboardStats(key)
      setStats(response.data)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao carregar estatísticas')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <Header onLogout={handleLogout} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Membros Ativos
                    </CardTitle>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-blue-600">
                      {stats.members.active}
                    </div>
                    <CardDescription className="text-sm">
                      Total de {stats.members.total} membros
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Indicações do Mês
                    </CardTitle>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-green-600">
                      {stats.referrals.thisMonth.count}
                    </div>
                    <CardDescription className="text-sm">
                      {formatCurrency(stats.referrals.thisMonth.value)} em negócios
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-white border-pink-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Obrigados do Mês
                    </CardTitle>
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-pink-600">
                      {stats.thankYous.thisMonth}
                    </div>
                    <CardDescription className="text-sm">
                      {stats.thankYous.total} no total
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Resumo de Indicações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total de Indicações</span>
                      <span className="text-lg font-semibold">{stats.referrals.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pendentes</span>
                      <span className="text-lg font-semibold text-yellow-600">
                        {stats.referrals.pending}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fechadas</span>
                      <span className="text-lg font-semibold text-green-600">
                        {stats.referrals.closed}
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          Valor Total
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(stats.referrals.totalValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Reuniões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reuniões este mês</span>
                      <span className="text-lg font-semibold">{stats.meetings.thisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Presença</span>
                      <span className="text-lg font-semibold text-purple-600">
                        {formatPercentage(stats.meetings.averageAttendance)}
                      </span>
                    </div>
                    {stats.meetings.nextMeeting && (
                      <div className="pt-3 border-t">
                        <div className="text-sm text-gray-600 mb-2">Próxima Reunião</div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="font-semibold text-purple-900">
                            {stats.meetings.nextMeeting.title}
                          </div>
                          <div className="text-sm text-purple-600 mt-1">
                            {formatDate(stats.meetings.nextMeeting.date)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

