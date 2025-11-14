import { CheckCircle, Link, ArrowLeft } from "lucide-react"

export default function SuccessScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Intenção Registrada!
        </h2>
        <p className="text-gray-600 mb-6">
          Obrigado por seu interesse! Entraremos em contato em breve para dar continuidade ao processo.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
      </div>
    </div>
  )
}