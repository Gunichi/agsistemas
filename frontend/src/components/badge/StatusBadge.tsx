import { Badge, BadgeProps } from '@/components/ui/badge'

const statusVariants = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
} as const

const statusLabels = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
} as const

interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const variant = statusVariants[status]
  const label = statusLabels[status]

  return <Badge variant={variant as BadgeProps['variant']}>{label}</Badge>
} 
