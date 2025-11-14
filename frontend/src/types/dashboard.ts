export interface DashboardStats {
  members: {
    total: number
    active: number
    inactive: number
    newThisMonth: number
  }
  referrals: {
    total: number
    pending: number
    closed: number
    totalValue: number
    thisMonth: {
      count: number
      value: number
    }
  }
  thankYous: {
    total: number
    thisMonth: number
    thisWeek: number
  }
  meetings: {
    thisMonth: number
    averageAttendance: number
    nextMeeting?: {
      date: string
      title: string
    }
  }
}