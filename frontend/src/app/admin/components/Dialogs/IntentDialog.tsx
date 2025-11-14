'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { MembershipIntent } from '@/types'

interface IntentDialogProps {
  open: boolean
  type: 'approve' | 'reject'
  intent: MembershipIntent | null
  note: string
  loading: boolean
  onOpenChange: (open: boolean) => void
  onNoteChange: (note: string) => void
  onConfirm: () => void
}

export default function IntentDialog({
  open,
  type,
  intent,
  note,
  loading,
  onOpenChange,
  onNoteChange,
  onConfirm,
}: IntentDialogProps) {
  if (!intent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'approve' ? 'Aprovar Intenção' : 'Rejeitar Intenção'}
          </DialogTitle>
          <DialogDescription>
            {type === 'approve'
              ? 'Ao aprovar, um convite será enviado ao candidato.'
              : 'Ao rejeitar, o candidato será notificado.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="note">
            {type === 'approve'
              ? 'Observações (opcional)'
              : 'Motivo da rejeição (opcional)'}
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={
              type === 'approve'
                ? 'Adicione observações sobre a aprovação...'
                : 'Explique o motivo da rejeição...'
            }
            className="mt-2"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant={type === 'approve' ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={loading}
            className={type === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
          >
            {loading
              ? 'Processando...'
              : type === 'approve'
                ? 'Aprovar'
                : 'Rejeitar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

