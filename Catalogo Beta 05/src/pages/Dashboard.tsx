
import React from 'react'
import { useResellers } from '../hooks/useResellers'
import { useProducts } from '../hooks/useProducts'
import { useAnalytics } from '../hooks/useAnalytics'
import {Users, Package, ShoppingCart, TrendingUp, DollarSign, Activity, Plus, Eye, AlertCircle} from 'lucide-react'

const Dashboard: React.FC = () => {
  const { resellers, loading: resellersLoading } = useResellers()
  const { products, loading: productsLoading } = useProducts()
  const { analytics, loading: analyticsLoading } = useAnalytics()

  const loading = resellersLoading || productsLoading || analyticsLoading

  // Calcular métricas
  const totalResellers = resellers?.length || 0
  const activeResellers = resellers?.filter(r => r.status === 'active')?.length || 0
  const totalProducts = products?.length || 0
  // Usando dados do hook de analytics (simulado) para vendas e pedidos
  const totalSales = analytics?.totalSales || 0
  const totalOrders = analytics?.totalOrders || 0

  const stats = [
    {
      title: 'Total de Revendedores',
      value: totalResellers,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Revendedores Ativos',
      value: activeResellers,
      change: '+8%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Total de Produtos',
      value: totalProducts,
      change: '+5%',
      changeType: 'positive' as const,
      icon: Package,
      color: 'purple'
    },
    {
      title: 'Total em Vendas',
      value: `R$ ${totalSales.toLocaleString('pt-BR')}`,
      change: '+15%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'emerald'
    },
    {
      title: 'Total de Pedidos',
      value: totalOrders,
      change: '+10%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'orange'
    },
    {
      title: 'Taxa de Conversão',
      value: `${analytics?.conversionRate || 0}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'pink'
    }
  ]

  const recentResellers = resellers?.slice(0, 5) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu sistema de revendas</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 flex items-center space-x-2 transition-colors">
            <Eye size={20} />
            <span>Relatórios</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus size={20} />
            <span>Nova Revenda</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            emerald: 'bg-emerald-100 text-emerald-600',
            orange: 'bg-orange-100 text-orange-600',
            pink: 'bg-pink-100 text-pink-600'
          }

          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revendedores Recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Revendedores Recentes</h3>
          </div>
          
          <div className="p-6">
            {recentResellers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum revendedor cadastrado ainda</p>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Adicionar Primeiro Revendedor
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentResellers.map((reseller) => (
                  <div key={reseller.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {reseller.business_name?.charAt(0)?.toUpperCase() || 'N'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reseller.business_name || 'Nome não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {reseller.contact_name || 'Contato não informado'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        reseller.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : reseller.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {reseller.status === 'active' ? 'Ativo' :
                         reseller.status === 'pending' ? 'Pendente' : 'Inativo'}
                      </span>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {/* Placeholder para atividades */}
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade recente</p>
                <p className="text-sm text-gray-400 mt-1">
                  As atividades dos revendedores aparecerão aqui
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Comece Agora</h3>
            <p className="text-blue-100">
              Configure seu primeiro revendedor e comece a vender
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors">
              Adicionar Revendedor
            </button>
            <button className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Ver Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
