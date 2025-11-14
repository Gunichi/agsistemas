import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeTruthy()
  })

  it('should handle click events', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should render as different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )

    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeTruthy()
    expect((link as HTMLAnchorElement).href).toBeTruthy()
    expect((link as HTMLAnchorElement).href).toBe('/test')
  })
})

