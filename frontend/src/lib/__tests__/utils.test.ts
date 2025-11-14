import { cn, formatCurrency, formatDate, formatPercentage } from '../utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const dateString = '2024-01-15T10:30:00Z'
      const formatted = formatDate(dateString)
      
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('should handle different date formats', () => {
      const dateString = '2024-12-25T00:00:00Z'
      const formatted = formatDate(dateString)
      
      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency in BRL', () => {
      expect(formatCurrency(1000)).toMatch(/R\$\s*1\.000/)
    })

    it('should format decimal values', () => {
      expect(formatCurrency(1234.56)).toMatch(/R\$\s*1\.234/)
    })

    it('should format zero', () => {
      expect(formatCurrency(0)).toMatch(/R\$\s*0/)
    })

    it('should format large numbers', () => {
      expect(formatCurrency(1000000)).toMatch(/R\$\s*1\.000\.000/)
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(0.5)).toBe('50%')
    })

    it('should format zero percentage', () => {
      expect(formatPercentage(0)).toBe('0%')
    })

    it('should format 100%', () => {
      expect(formatPercentage(1)).toBe('100%')
    })

    it('should format decimal percentages', () => {
      expect(formatPercentage(0.123)).toBe('12%')
    })

    it('should round percentages', () => {
      expect(formatPercentage(0.1234)).toBe('12%')
      expect(formatPercentage(0.125)).toBe('13%')
    })
  })
})

