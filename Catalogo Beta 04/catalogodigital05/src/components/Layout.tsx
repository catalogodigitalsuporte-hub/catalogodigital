
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as LucideIcons from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/revendas', icon: Users, label: 'Revendas' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <LucideIcons.Crown className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Painel Mestre</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Informações do Usuário */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.userName?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.userName || 'Administrador'}</p>
              <p className="text-xs text-blue-600">Painel Mestre</p>
            </div>
          </div>
        </div>
        
        {/* Navegação */}
        <nav className="mt-6">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
          
          {/* Botão de Logout */}
          <div className="absolute bottom-6 left-3 right-3">
            <button
              onClick={signOut}
              className="flex items-center space-x-3 w-full px-3 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LucideIcons.LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <LucideIcons.Menu size={24} />
            </button>
            
            <div className="flex items-center space-x-4">
              <LucideIcons.Crown className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Bem-vindo ao Painel Mestre
              </h2>
            </div>
            
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              ADMINISTRADOR
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay do Sidebar Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
