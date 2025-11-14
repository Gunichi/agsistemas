import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'

describe('LoginForm', () => {
  const mockOnLogin = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    expect(screen.getByText(/área administrativa/i)).toBeTruthy()
    expect(screen.getByText(/insira a api key/i)).toBeTruthy()
    expect(screen.getByLabelText(/api key/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /acessar painel/i })).toBeTruthy()
  })

  it('should update API key input when user types', async () => {
    const user = userEvent.setup()
    render(<LoginForm onLogin={mockOnLogin} />)

    const apiKeyInput = screen.getByLabelText(/api key/i)
    await act(async () => {
      await user.type(apiKeyInput, 'test-api-key-123')
    })

    expect((apiKeyInput as HTMLInputElement).value).toBe('test-api-key-123')
  })

  it('should call onLogin with API key on submit', async () => {
    const user = userEvent.setup()
    render(<LoginForm onLogin={mockOnLogin} />)

    const apiKeyInput = screen.getByLabelText(/api key/i)
    const submitButton = screen.getByRole('button', { name: /acessar painel/i })

    await act(async () => {
      await user.type(apiKeyInput, 'test-api-key-123')
      await user.click(submitButton)
    })

    expect(mockOnLogin).toHaveBeenCalledWith('test-api-key-123')
  })

  it('should show error when submitting empty API key', async () => {
    const user = userEvent.setup()
    render(<LoginForm onLogin={mockOnLogin} />)

    const submitButton = screen.getByRole('button', { name: /acessar painel/i })
    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/por favor, insira a api key/i)).toBeTruthy()
    })

    expect(mockOnLogin).not.toHaveBeenCalled()
  })

  it('should show error when submitting API key with only whitespace', async () => {
    const user = userEvent.setup()
    render(<LoginForm onLogin={mockOnLogin} />)

    const apiKeyInput = screen.getByLabelText(/api key/i)
    const submitButton = screen.getByRole('button', { name: /acessar painel/i })

    await act(async () => {
      await user.type(apiKeyInput, '   ')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/por favor, insira a api key/i)).toBeTruthy()
    })

    expect(mockOnLogin).not.toHaveBeenCalled()
  })

  it('should clear error when submitting valid API key after error', async () => {
    const user = userEvent.setup()
    render(<LoginForm onLogin={mockOnLogin} />)

    const apiKeyInput = screen.getByLabelText(/api key/i)
    const submitButton = screen.getByRole('button', { name: /acessar painel/i })

    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/por favor, insira a api key/i)).toBeTruthy()
    })

    await act(async () => {
      await user.type(apiKeyInput, 'valid-api-key')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.queryByText(/por favor, insira a api key/i)).not.toBeTruthy()
    })

    expect(mockOnLogin).toHaveBeenCalledWith('valid-api-key')
  })

  it('should have password input type for API key', () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    const apiKeyInput = screen.getByLabelText(/api key/i)
    expect((apiKeyInput as HTMLInputElement).type).toBe('password')
  })
})

