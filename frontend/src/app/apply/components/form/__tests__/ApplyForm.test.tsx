import { api } from '@/lib/api'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplyForm from '../ApplyForm'

jest.mock('@/lib/api', () => ({
  api: {
    submitMembershipIntent: jest.fn(),
  },
}))

describe('ApplyForm', () => {
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form fields', () => {
    render(<ApplyForm onSuccess={mockOnSuccess} />)

    expect(screen.getByLabelText(/nome completo/i)).toBeTruthy()
    expect(screen.getByLabelText(/email/i)).toBeTruthy()
    expect(screen.getByLabelText(/telefone/i)).toBeTruthy()
    expect(screen.getByLabelText(/empresa/i)).toBeTruthy()
    expect(screen.getByText(/setor de atuação/i)).toBeTruthy()
    expect(screen.getByLabelText(/por que você quer participar/i)).toBeTruthy()
  })

  it('should update form fields when user types', async () => {
    const user = userEvent.setup()
    render(<ApplyForm onSuccess={mockOnSuccess} />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    await act(async () => {
      await user.type(nameInput, 'João Silva')
    })

    expect(nameInput).toHaveValue('João Silva')
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    ;(api.submitMembershipIntent as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { id: 'intent-id' },
    })

    render(<ApplyForm onSuccess={mockOnSuccess} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com')
      await user.type(
        screen.getByLabelText(/por que você quer participar/i),
        'Desejo expandir minha rede de contatos profissionais'
      )
    })

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(api.submitMembershipIntent).toHaveBeenCalledWith({
        fullName: 'João Silva',
        email: 'joao@example.com',
        phone: '',
        company: '',
        industry: '',
        motivation: 'Desejo expandir minha rede de contatos profissionais',
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Email já cadastrado'
    const { ApiError } = await import('@/types')
    ;(api.submitMembershipIntent as jest.Mock).mockRejectedValueOnce(
      new ApiError(errorMessage, 409)
    )

    render(<ApplyForm onSuccess={mockOnSuccess} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com')
      await user.type(
        screen.getByLabelText(/por que você quer participar/i),
        'Desejo expandir minha rede de contatos profissionais'
      )
    })

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(
      () => {
        expect(screen.getByText(errorMessage)).toBeTruthy()
      },
      { timeout: 3000 }
    )
  })

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup()
    ;(api.submitMembershipIntent as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<ApplyForm onSuccess={mockOnSuccess} />)

    await act(async () => {
      await user.type(screen.getByLabelText(/nome completo/i), 'João Silva')
      await user.type(screen.getByLabelText(/email/i), 'joao@example.com')
      await user.type(
        screen.getByLabelText(/por que você quer participar/i),
        'Desejo expandir minha rede de contatos profissionais'
      )
    })

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await act(async () => {
      await user.click(submitButton)
    })

    expect(screen.getByText(/enviando/i)).toBeTruthy()
    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()
    ;(api.submitMembershipIntent as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { id: 'intent-id' },
    })

    render(<ApplyForm onSuccess={mockOnSuccess} />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)

    await act(async () => {
      await user.type(nameInput, 'João Silva')
      await user.type(emailInput, 'joao@example.com')
      await user.type(
        screen.getByLabelText(/por que você quer participar/i),
        'Desejo expandir minha rede de contatos profissionais'
      )
    })

    const submitButton = screen.getByRole('button', { name: /enviar intenção/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(nameInput).toHaveValue('')
      expect(emailInput).toHaveValue('')
    })
  })
})

