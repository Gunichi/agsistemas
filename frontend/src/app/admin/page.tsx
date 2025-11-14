'use client'

import { useEffect, useState } from 'react'
import AdminDashboard from './components/AdminDashboard'
import LoginForm from './components/forms/LoginForm'

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const savedApiKey = localStorage.getItem('admin_api_key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (key: string) => {
    localStorage.setItem('admin_api_key', key)
    setApiKey(key)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_api_key')
    setApiKey('')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <AdminDashboard apiKey={apiKey} onLogout={handleLogout} />
}
