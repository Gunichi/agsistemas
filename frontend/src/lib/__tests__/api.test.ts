import { ApiError } from '@/types'
import { api } from '../api'

global.fetch = jest.fn()

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
  })

  describe('submitMembershipIntent', () => {
    const mockData = {
      fullName: 'João Silva',
      email: 'joao@example.com',
      motivation: 'Desejo expandir minha rede de contatos',
    }

    it('should submit membership intent successfully', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'intent-id' },
        message: 'Intenção criada com sucesso',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.submitMembershipIntent(mockData)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/membership-intents',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockData),
        })
      )
    })

    it('should throw ApiError on failure', async () => {
      const errorResponse = {
        message: 'Email já cadastrado',
        errors: {},
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => errorResponse,
      })

      await expect(api.submitMembershipIntent(mockData)).rejects.toThrow(ApiError)
    })
  })

  describe('listMembershipIntents', () => {
    const apiKey = 'test-api-key'

    it('should list membership intents successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          intents: [],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.listMembershipIntents(apiKey)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/membership-intents?',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
          },
        })
      )
    })

    it('should include query parameters', async () => {
      const mockResponse = {
        success: true,
        data: { intents: [], pagination: {} },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await api.listMembershipIntents(apiKey, {
        page: 2,
        limit: 10,
        status: 'PENDING',
        search: 'test',
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=PENDING'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=test'),
        expect.any(Object)
      )
    })
  })

  describe('approveMembershipIntent', () => {
    const apiKey = 'test-api-key'
    const intentId = 'intent-id'

    it('should approve intent successfully', async () => {
      const mockResponse = {
        success: true,
        data: { id: intentId, status: 'APPROVED' },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.approveMembershipIntent(apiKey, intentId, 'Notes')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/membership-intents/${intentId}/approve`,
        expect.objectContaining({
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
          },
          body: JSON.stringify({ notes: 'Notes' }),
        })
      )
    })
  })

  describe('rejectMembershipIntent', () => {
    const apiKey = 'test-api-key'
    const intentId = 'intent-id'

    it('should reject intent successfully', async () => {
      const mockResponse = {
        success: true,
        data: { id: intentId, status: 'REJECTED' },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.rejectMembershipIntent(apiKey, intentId, 'Reason')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/membership-intents/${intentId}/reject`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ reason: 'Reason' }),
        })
      )
    })
  })

  describe('validateInviteToken', () => {
    const token = 'test-token'

    it('should validate token successfully', async () => {
      const mockResponse = {
        success: true,
        data: { valid: true, intent: { id: 'intent-id' } },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.validateInviteToken(token)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/membership-intents/validate-token/${token}`,
        expect.objectContaining({
          method: 'GET',
        })
      )
    })

    it('should throw ApiError on invalid token', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Token inválido' }),
      })

      await expect(api.validateInviteToken(token)).rejects.toThrow(ApiError)
    })
  })

  describe('completeRegistration', () => {
    const registrationData = {
      inviteToken: 'token',
      email: 'joao@example.com',
      password: 'password123',
      fullName: 'João Silva',
    }

    it('should complete registration successfully', async () => {
      const mockResponse = {
        success: true,
        data: { userId: 'user-id', memberId: 'member-id' },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.completeRegistration(registrationData)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/membership-intents/complete-registration',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(registrationData),
        })
      )
    })
  })

  describe('getDashboardStats', () => {
    const apiKey = 'test-api-key'

    it('should get dashboard stats successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          members: { total: 50, active: 45 },
          referrals: { total: 100 },
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.getDashboardStats(apiKey)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/dashboard/stats',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': apiKey,
          },
        })
      )
    })
  })
})

