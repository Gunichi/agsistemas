'use client'

import StatusBadge from '@/components/badge/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { MembershipIntent } from '@/types'
import { Check } from 'lucide-react'

interface IntentCardProps {
  intent: MembershipIntent
  onApprove: (intent: MembershipIntent) => void
  onReject: (intent: MembershipIntent) => void
  loading: boolean
}

export default function IntentCard({
  intent,
  onApprove,
  onReject,
  loading,
}: IntentCardProps) {

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{intent.fullName}</CardTitle>
            <CardDescription className="mt-1">
              {intent.email}
              {intent.phone && ` • ${intent.phone}`}
            </CardDescription>
          </div>
          <StatusBadge status={intent.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {intent.company && (
            <div>
              <span className="font-medium text-sm text-gray-700">Empresa:</span>
              <span className="ml-2 text-sm text-gray-600">{intent.company}</span>
            </div>
          )}
          {intent.industry && (
            <div>
              <span className="font-medium text-sm text-gray-700">Ramo:</span>
              <span className="ml-2 text-sm text-gray-600">{intent.industry}</span>
            </div>
          )}
          <div>
            <span className="font-medium text-sm text-gray-700">Motivação:</span>
            <p className="mt-1 text-sm text-gray-600">{intent.motivation}</p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-xs text-gray-500">
              Enviado em: {formatDate(intent.createdAt)}
              {intent.reviewedAt && (
                <> • Revisado em: {formatDate(intent.reviewedAt)}</>
              )}
            </div>
            {intent.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onApprove(intent)}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(intent)}
                  disabled={loading}
                >
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
          {intent.status === 'APPROVED' && intent.inviteToken && (
            <div className="pt-3 border-t">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Token para cadastro</span>
                  </div>
                  {intent.tokenExpiresAt && new Date(intent.tokenExpiresAt) < new Date() && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-semibold">
                      Expirado
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-600">Token:</span>
                    <div className="mt-1 p-2 bg-white rounded border border-green-200 font-mono text-xs text-gray-700 break-all">
                      {intent.inviteToken}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {intent.rejectionReason && (
            <div className="pt-3 border-t">
              <span className="font-medium text-sm text-red-700">
                Motivo da rejeição:
              </span>
              <p className="mt-1 text-sm text-red-600">{intent.rejectionReason}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

