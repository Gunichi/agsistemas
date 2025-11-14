export interface MembershipIntent {
  id: string
  fullName: string
  email: string
  phone?: string
  company?: string
  industry?: string
  motivation: string
  status: MembershipIntentStatus
  createdAt: string
  reviewedAt?: string
  rejectionReason?: string
  inviteToken?: string
  tokenExpiresAt?: string
}

export type MembershipIntentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface MembershipIntentData {
  fullName: string
  email: string
  phone?: string
  company?: string
  industry?: string
  motivation: string
}

export interface ListIntentsResponse {
  intents: MembershipIntent[]
  pagination: PaginationData
}

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface ListIntentsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

