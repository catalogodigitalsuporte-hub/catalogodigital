
    
import React from 'react'
import { Link } from 'react-router-dom'
import { useResellers } from '../hooks/useResellers'
import { useAuth } from '../hooks/useAuth'
import * as LucideIcons from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const { resellers, loading } = useResellers()
  const { user, promoteToAdmin } = useAuth()

  // Estatísticas calculadas
  const totalResellers = resellers.length
  const activeResellers = resellers.filter(r => r.status === 'active').length
  const totalSales = resellers.reduce((sum, r) => sum + (r.total_sales || 0), 0)
  const totalOrders = resellers.reduce((sum, r) => sum + (r.total_orders || 0), 0)

  // Verificação se é realmente admin
  const isRealAdmin = user?.userRole === 'ADMIN'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header do Painel Mestre */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <LucideIcons.Crown className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Painel Mestre</h1>
            </div>
            <p className="text-blue-100">
              Central de controle administrativo - Gerencie todo o sistema de revendas
            </p>
            <div className="mt-2 text-sm text-blue-200">
              Usuário: {user?.userName} | Role: {user?.userRole}
            </div>
          </div>
          
          {/* Botão de Promoção para Admin (se não for admin) */}
          {!isRealAdmin && (
            <div className="text-center">
              <div className="bg-red-500/20 border border-red-300 rounded-lg p-4 mb-4">
                <LucideIcons.AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-200" />
                <p className="text-sm text-red-200 mb-3">
                  Você não tem permissões de administrador
                </p>
                <button
                  onClick={promoteToAdmin}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Promover para ADMIN
                </button>
              </div>
            </div>
          )}
          
          {/* Ações Rápidas */}
          {isRealAdmin && (
            <div className="flex space-x-3">
              <Link
                to="/admin/revenda"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <LucideIcons.UserPlus size={20} />
                <span>Nova Revenda</span>
              </Link>
              <Link
                to="/admin/analytics"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <LucideIcons.BarChart3 size={20} />
                <span>Relatórios</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <LucideIcons.Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revendedores</p>
              <p className="text-2xl font-bold text-gray-900">{totalResellers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <LucideIcons.TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revendedores Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{activeResellers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <LucideIcons.DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vendas Totais</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {totalSales.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <LucideIcons.ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pedidos Totais</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seções Principais do Painel Mestre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gestão de Revendas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Gestão de Revendas</h3>
            <Link
              to="/admin/revenda"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <LucideIcons.Plus size={16} />
              <span>Nova Revenda</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/resellers"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <LucideIcons.Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Todos Revendedores</p>
                    <p className="text-sm text-gray-600">{totalResellers} cadastrados</p>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/admin/revenda"
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <LucideIcons.UserPlus className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Cadastrar Novo</p>
                    <p className="text-sm text-gray-600">Criar revenda</p>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* Lista dos últimos revendedores */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Últimos Revendedores</h4>
              <div className="space-y-2">
                {resellers.slice(0, 3).map((reseller) => (
                  <div key={reseller._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{reseller.business_name}</p>
                      <p className="text-sm text-gray-600">{reseller.contact_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        reseller.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : reseller.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {reseller.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {resellers.length > 3 && (
                <Link
                  to="/admin/resellers"
                  className="block text-center text-blue-600 hover:text-blue-700 text-sm mt-3"
                >
                  Ver todos os {totalResellers} revendedores →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Ferramentas Administrativas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Ferramentas Administrativas</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/admin/catalogs"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <LucideIcons.ShoppingBag className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Todos os Catálogos</p>
                  <p className="text-sm text-gray-600">Visualizar catálogos de todos os revendedores</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/admin/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <LucideIcons.BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Análise e Relatórios</p>
                  <p className="text-sm text-gray-600">Estatísticas detalhadas do sistema</p>
                </div>
              </div>
            </Link>
            
            <Link
              to="/admin/settings"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <LucideIcons.Settings className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Configurações do Sistema</p>
                  <p className="text-sm text-gray-600">Configurações globais e personalizações</p>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Status do Sistema */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Status do Sistema</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revendedores Ativos</span>
                <span className="text-sm font-medium text-green-600">
                  {activeResellers}/{totalResellers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa de Conversão</span>
                <span className="text-sm font-medium text-blue-600">
                  {totalResellers > 0 ? Math.round((activeResellers / totalResellers) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Receita Média</span>
                <span className="text-sm font-medium text-purple-600">
                  R$ {totalResellers > 0 ? Math.round(totalSales / totalResellers).toLocaleString('pt-BR') : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/revenda"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <LucideIcons.UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Criar Nova Revenda</p>
                <p className="text-sm text-gray-600">Cadastrar novo revendedor</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/admin/resellers"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <LucideIcons.Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gerenciar Revendedores</p>
                <p className="text-sm text-gray-600">Editar e monitorar</p>
              </div>
            </div>
          </Link>
          
          <Link
            to="/admin/analytics"
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <LucideIcons.BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ver Relatórios</p>
                <p className="text-sm text-gray-600">Análise de desempenho</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

    