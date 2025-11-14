import { render, screen } from '@testing-library/react'
import StatusBadge from '../StatusBadge'

describe('StatusBadge', () => {
  it('should render PENDING status correctly', () => {
    render(<StatusBadge status="PENDING" />)
    expect(screen.getByText('Pendente')).toBeTruthy()
  })

  it('should render APPROVED status correctly', () => {
    render(<StatusBadge status="APPROVED" />)
    expect(screen.getByText('Aprovado')).toBeTruthy()
  })

  it('should render REJECTED status correctly', () => {
    render(<StatusBadge status="REJECTED" />)
    expect(screen.getByText('Rejeitado')).toBeTruthy()
  })

  it('should apply correct variant for each status', () => {
    const { rerender } = render(<StatusBadge status="PENDING" />)
    let badge = screen.getByText('Pendente')
    expect(badge).toBeTruthy()

    rerender(<StatusBadge status="APPROVED" />)
    badge = screen.getByText('Aprovado')
    expect(badge).toBeTruthy()

    rerender(<StatusBadge status="REJECTED" />)
    badge = screen.getByText('Rejeitado')
    expect(badge).toBeTruthy()
  })
})

