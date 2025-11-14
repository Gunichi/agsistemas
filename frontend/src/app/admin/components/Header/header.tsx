import { Button } from '@/components/ui/button';

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-primary-600">Admin</h1>
      <div className="flex gap-3">
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/admin/dashboard'}
          className="bg-transparent hover:bg-primary-600 text-primary-600 hover:text-white"
        >
          Dashboard
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/admin'} className="bg-transparent hover:bg-primary-600 text-primary-600 hover:text-white">
          Gestão de Membros
        </Button>
        <Button variant="outline" onClick={onLogout} className="bg-transparent hover:bg-primary-600 text-primary-600 hover:text-white">
          Sair
        </Button>
      </div>
    </div>
  )
}

export default Header;