import Link from "next/link"

export default function Header() {
  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <div className="text-2xl font-bold text-primary-600">
          Sistema de Gestão
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
          >
            Login
          </Link>
          <Link
            href="/apply"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Participar
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 text-gray-500 hover:text-gray-700 transition"
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  )
}