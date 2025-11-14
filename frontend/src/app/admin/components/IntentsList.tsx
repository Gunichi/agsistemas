'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { MembershipIntent } from '@/types'
import IntentCard from './Cards/IntentCard'

interface IntentsListProps {
  intents: MembershipIntent[]
  loading: boolean
  currentPage: number
  totalPages: number
  onApprove: (intent: MembershipIntent) => void
  onReject: (intent: MembershipIntent) => void
  onPageChange: (page: number) => void
}

export default function IntentsList({
  intents,
  loading,
  currentPage,
  totalPages,
  onApprove,
  onReject,
  onPageChange,
}: IntentsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (intents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          Nenhuma intenção encontrada
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {intents.map((intent) => (
          <IntentCard
            key={intent.id}
            intent={intent}
            onApprove={onApprove}
            onReject={onReject}
            loading={loading}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Anterior
          </Button>
          <div className="flex items-center px-4 text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Próxima
          </Button>
        </div>
      )}
    </>
  )
}

