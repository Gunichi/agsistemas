import { api } from '@/lib/api'
import { ApiError } from '@/types'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompleteRegistrationForm from '../CompleteRegistrationForm'

jest.mock('@/lib/api', () => ({
  api: {
    completeRegistration: jest.fn(),
  },
}))

describe('CompleteRegistrationForm', () => {
  const mockOnSuccess = jest.fn()
  const mockProps = {
    token: 'test-token-123',
    intentData: {
      fullName: 'João Silva',
      email: 'joao@example.com',
    },
    onSuccess: mockOnSuccess,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render step 1 (Security) with initial fields', () => {
    render(<CompleteRegistrationForm {...mockProps} />)

    expect(screen.getByText(/segurança/i)).toBeTruthy()
    expect(screen.getByLabelText(/nome completo/i)).toBeTruthy()
    expect(screen.getByLabelText(/email/i)).toBeTruthy()
    expect(document.getElementById('password')).toBeTruthy()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /próximo/i })).toBeTruthy()
  })

  it('should pre-fill name and email from intentData', () => {
    render(<CompleteRegistrationForm {...mockProps} />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)

    expect((nameInput as HTMLInputElement).value).toBe('João Silva')
    expect((emailInput as HTMLInputElement).value).toBe('joao@example.com')
    expect((emailInput as HTMLInputElement).disabled).toBe(true)
  })

  it('should update password fields when user types', async () => {
    const user = userEvent.setup()
    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement

    await act(async () => {
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
    })

    expect((passwordInput as HTMLInputElement).value).toBe('password123')
    expect((confirmPasswordInput as HTMLInputElement).value).toBe('password123')
  })

  it('should show error when password is too short', async () => {
    const user = userEvent.setup()
    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(passwordInput, 'short')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/a senha deve ter no mínimo 8 caracteres/i)).toBeTruthy()
    })
  })

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement
    const nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'different123')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeTruthy()
    })
  })

  it('should advance to step 2 when step 1 is valid', async () => {
    const user = userEvent.setup()
    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement
    const nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/dados pessoais/i)).toBeTruthy()
    })
  })

  it('should render step 2 (Personal Data) fields', async () => {
    const user = userEvent.setup()
    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement
    const nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/dados pessoais/i)).toBeTruthy()
      expect(screen.getByLabelText(/telefone/i)).toBeTruthy()
      expect(screen.getByLabelText(/cpf/i)).toBeTruthy()
    })
  })

  it('should go back to previous step', async () => {
    const user = userEvent.setup()
    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement
    const nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/dados pessoais/i)).toBeTruthy()
    })

    const backButton = screen.getByRole('button', { name: /voltar/i })
    await act(async () => {
      await user.click(backButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/segurança/i)).toBeTruthy()
    })
  })

  it('should submit form with all data', async () => {
    const user = userEvent.setup()
    ;(api.completeRegistration as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { userId: 'user-id', memberId: 'member-id' },
    })

    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement
    let nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/dados pessoais/i)).toBeTruthy()
    })

    const phoneInput = screen.getByLabelText(/telefone/i)
    nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(phoneInput, '+5511999999999')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/profissional/i)).toBeTruthy()
    })

    const companyInput = screen.getByLabelText(/empresa/i)
    const submitButton = screen.getByRole('button', { name: /concluir cadastro/i })

    await act(async () => {
      await user.type(companyInput, 'Empresa XPTO')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(api.completeRegistration).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Erro ao completar cadastro'
    ;(api.completeRegistration as jest.Mock).mockRejectedValueOnce(
      new ApiError(errorMessage, 400)
    )

    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement
    let nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/dados pessoais/i)).toBeTruthy()
    })

    nextButton = screen.getByRole('button', { name: /próximo/i })
    await act(async () => {
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/profissional/i)).toBeTruthy()
    })

    const submitButton = screen.getByRole('button', { name: /concluir cadastro/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeTruthy()
    })
  })

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup()
    ;(api.completeRegistration as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )

    render(<CompleteRegistrationForm {...mockProps} />)

    const passwordInput = document.getElementById('password') as HTMLInputElement
    const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement
    let nextButton = screen.getByRole('button', { name: /próximo/i })

    await act(async () => {
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/dados pessoais/i)).toBeTruthy()
    })

    nextButton = screen.getByRole('button', { name: /próximo/i })
    await act(async () => {
      await user.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/profissional/i)).toBeTruthy()
    })

    const submitButton = screen.getByRole('button', { name: /concluir cadastro/i })
    await act(async () => {
      await user.click(submitButton)
    })

    expect((submitButton as HTMLButtonElement).disabled).toBe(true)

    await waitFor(() => {
      expect((submitButton as HTMLButtonElement).disabled).toBe(false)
    })
  })

  it('should show step indicators correctly', () => {
    render(<CompleteRegistrationForm {...mockProps} />)

    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })
})

