import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Heart, Settings } from 'lucide-react'
import { useState } from 'react'
import { authService } from '@/services/api'
import logo from '../assets/logo.png'

export default function Navbar({ user, setUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      localStorage.removeItem('user')
      navigate('/')
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
      // Mesmo com erro, limpar dados locais
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/')
    }
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="PiFloor Logo" className="h-12 w-12" />
            <span className="text-xl font-bold">PiFloor Pisos</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-secondary transition-colors">
              Início
            </Link>
            <Link to="/produtos" className="hover:text-secondary transition-colors">
              Produtos
            </Link>
            <Link to="/dicas" className="hover:text-secondary transition-colors">
              Dicas
            </Link>
            <Link to="/faq" className="hover:text-secondary transition-colors">
              FAQ
            </Link>

            {user ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-4">
                  <Link to="/perfil">
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-secondary">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>

                  {user.isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-secondary">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-primary-foreground hover:text-secondary"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>

                <Link to="/favoritos">
                  <Button
                    variant="outline"
                    className="text-primary-foreground hover:text-secondary border-secondary mt-2"
                  >
                    ❤️ Favoritos
                  </Button>
                </Link>
              </div>
            ) : (

              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button variant="outline" size="sm" className="border-secondary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 hover:text-secondary transition-colors">
              Início
            </Link>
            <Link to="/produtos" className="block py-2 hover:text-secondary transition-colors">
              Produtos
            </Link>
            <Link to="/dicas" className="block py-2 hover:text-secondary transition-colors">
              Dicas
            </Link>
            <Link to="/faq" className="block py-2 hover:text-secondary transition-colors">
              FAQ
            </Link>

            {user ? (
              <>
                <Link to="/perfil" className="block py-2 hover:text-secondary transition-colors">
                  Perfil
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="block py-2 hover:text-secondary transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 hover:text-secondary transition-colors"
                >
                  Sair
                </button>
                <Link to="/favoritos" className="block py-2 mt-2 hover:text-secondary transition-colors font-semibold">
                  ❤️ Favoritos
                </Link>
              </>

            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" className="block">
                  <Button variant="secondary" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link to="/cadastro" className="block">
                  <Button variant="outline" className="w-full border-secondary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

