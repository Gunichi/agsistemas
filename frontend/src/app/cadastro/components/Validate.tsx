import { Loader2 } from 'lucide-react';

export default function Validate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Validando convite...
        </h2>
        <p className="text-gray-600">
          Aguarde enquanto verificamos seu token de convite.
        </p>
      </div>
    </div>
  )
}