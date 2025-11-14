import type {
  ApiResponse,
  ListIntentsParams,
  ListIntentsResponse,
  MembershipIntentData,
} from '@/types'
import { ApiError } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const api = {
  async submitMembershipIntent(data: MembershipIntentData): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_URL}/membership-intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'Erro ao enviar formulário',
        response.status,
        errorData.errors
      )
    }

    return response.json()
  },

  async listMembershipIntents(
    apiKey: string,
    params?: ListIntentsParams
  ): Promise<ApiResponse<ListIntentsResponse>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)

    const response = await fetch(
      `${API_URL}/membership-intents?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'Erro ao buscar intenções',
        response.status,
        errorData.errors
      )
    }

    return response.json()
  },

  async approveMembershipIntent(
    apiKey: string,
    intentId: string,
    notes?: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_URL}/membership-intents/${intentId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ notes }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'Erro ao aprovar intenção',
        response.status,
        errorData.errors
      )
    }

    return response.json()
  },

  async rejectMembershipIntent(
    apiKey: string,
    intentId: string,
    reason?: string
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_URL}/membership-intents/${intentId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'Erro ao rejeitar intenção',
        response.status,
        errorData.errors
      )
    }

    return response.json()
  },

  async validateInviteToken(token: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_URL}/membership-intents/validate-token/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'Token inválido ou expirado',
        response.status,
        errorData.errors
      )
    }

    return response.json()
  },

  async completeRegistration(data: any): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_URL}/membership-intents/complete-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'Erro ao completar cadastro',
        response.status,
        errorData.errors
      )
    }

    return response.json()
  },

  async getDashboardStats(apiKey: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'Erro ao buscar estatísticas',
        response.status,
        errorData.errors
      )
    }

    return response.json()
  },
}
