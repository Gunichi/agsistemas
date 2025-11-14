'use client'

import { useState } from 'react'

import ApplyForm from './components/form/ApplyForm'
import SuccessScreen from './components/SuccessScreen'

import Footer from '@/components/footer/footer'
import Header from '@/components/header/header'

export default function ApplyPage() {
  
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSuccess = () => {
    setIsSuccess(true)
  }

  if (isSuccess) {
    return <SuccessScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-500">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Participe do nosso grupo.
            </h1>
            <p className="text-lg text-gray-600">
              Preencha o formulário abaixo para manifestar seu interesse.
            </p>
          </div>

          <ApplyForm onSuccess={handleSuccess} />
        </div>
      </main>

      <Footer textColor="white" />
    </div>
  )
}

