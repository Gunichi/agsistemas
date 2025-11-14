'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import type { MembershipIntent } from '@/types'
import { ApiError } from '@/types'
import { useEffect, useState } from 'react'
import IntentDialog from './Dialogs/IntentDialog'
import IntentFilters from './Filters/IntentFilters'
import IntentsList from './IntentsList'
import Header from './Header/header'

interface AdminDashboardProps {
  apiKey: string
  onLogout: () => void
}

export default function AdminDashboard({ apiKey, onLogout }: AdminDashboardProps) {
  const [intents, setIntents] = useState<MembershipIntent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve')
  const [selectedIntent, setSelectedIntent] = useState<MembershipIntent | null>(null)
  const [dialogNote, setDialogNote] = useState('')

  useEffect(() => {
    loadIntents()
  }, [selectedStatus, searchTerm, currentPage])

  const loadIntents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.listMembershipIntents(apiKey, {
        page: currentPage,
        limit: 10,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchTerm || undefined,
      })
      setIntents(response.data.intents)
      setTotalPages(response.data.pagination.totalPages)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value)
    setCurrentPage(1)
  }

  const openDialog = (type: 'approve' | 'reject', intent: MembershipIntent) => {
    setDialogType(type)
    setSelectedIntent(intent)
    setDialogNote('')
    setDialogOpen(true)
  }

  const handleDialogConfirm = async () => {
    if (!selectedIntent) return

    setLoading(true)
    try {
      if (dialogType === 'approve') {
        await api.approveMembershipIntent(apiKey, selectedIntent.id, dialogNote)
      } else {
        await api.rejectMembershipIntent(apiKey, selectedIntent.id, dialogNote)
      }
      setDialogOpen(false)
      setSelectedIntent(null)
      setDialogNote('')
      await loadIntents()
    } catch (err) {
      setError('Erro ao processar solicitação')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <Header onLogout={onLogout} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IntentFilters
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <IntentsList
          intents={intents}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onApprove={(intent) => openDialog('approve', intent)}
          onReject={(intent) => openDialog('reject', intent)}
          onPageChange={setCurrentPage}
        />
      </div>

      <IntentDialog
        open={dialogOpen}
        type={dialogType}
        intent={selectedIntent}
        note={dialogNote}
        loading={loading}
        onOpenChange={setDialogOpen}
        onNoteChange={setDialogNote}
        onConfirm={handleDialogConfirm}
      />
    </div>
  )
}

