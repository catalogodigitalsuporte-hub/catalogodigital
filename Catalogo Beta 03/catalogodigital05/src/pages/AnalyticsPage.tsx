
import React, { useState, useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics'
import { useAuth } from '../hooks/useAuth'
import {TrendingUp, DollarSign, ShoppingCart, Eye, Calendar, BarChart3, Users, Package} from 'lucide-react'

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth()
  const { analytics, loading, fetchAnalytics } = useAnalytics()
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('sales')

  const isAdmin = user?.userRole === 'ADMIN'

  useEffect(() => {
    fetchAnalytics(timeRange)
  }, [timeRange, fetchAnalytics])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗️'
    if (growth < 0) return '↘️'
    return '➡️'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Análise completa do desempenho da plataforma' : 'Acompanhe o desempenho das suas vendas'}
          </p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </p>
              <p className={`text-sm mt-1 ${getGrowthColor(analytics?.revenueGrowth || 0)}`}>
                {getGrowthIcon(analytics?.revenueGrowth || 0)} 
                {Math.abs(analytics?.revenueGrowth || 0).toFixed(1)}% vs período anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(analytics?.totalOrders || 0)}
              </p>
              <p className={`text-sm mt-1 ${getGrowthColor(analytics?.ordersGrowth || 0)}`}>
                {getGrowthIcon(analytics?.ordersGrowth || 0)} 
                {Math.abs(analytics?.ordersGrowth || 0).toFixed(1)}% vs período anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visualizações</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(analytics?.totalViews || 0)}
              </p>
              <p className={`text-sm mt-1 ${getGrowthColor(analytics?.viewsGrowth || 0)}`}>
                {getGrowthIcon(analytics?.viewsGrowth || 0)} 
                {Math.abs(analytics?.viewsGrowth || 0).toFixed(1)}% vs período anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(analytics?.conversionRate || 0).toFixed(1)}%
              </p>
              <p className={`text-sm mt-1 ${getGrowthColor(analytics?.conversionGrowth || 0)}`}>
                {getGrowthIcon(analytics?.conversionGrowth || 0)} 
                {Math.abs(analytics?.conversionGrowth || 0).toFixed(1)}% vs período anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Vendas por Período</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMetric('sales')}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedMetric === 'sales'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Vendas
              </button>
              <button
                onClick={() => setSelectedMetric('orders')}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedMetric === 'orders'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pedidos
              </button>
            </div>
          </div>
          
          {/* Simple Chart Placeholder */}
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics?.chartData?.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t-sm"
                  style={{
                    height: `${(data.value / Math.max(...analytics.chartData.map(d => d.value))) * 200}px`
                  }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{data.label}</span>
              </div>
            )) || (
              // Placeholder bars if no data
              [...Array(7)].map((_, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gray-200 rounded-t-sm"
                    style={{ height: `${Math.random() * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">Dia {index + 1}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performing Catalogs */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Catálogos com Melhor Performance</h3>
          <div className="space-y-4">
            {analytics?.topCatalogs?.map((catalog, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{catalog.name}</p>
                    <p className="text-sm text-gray-600">{catalog.views} visualizações</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(catalog.revenue)}</p>
                  <p className="text-sm text-gray-600">{catalog.orders} pedidos</p>
                </div>
              </div>
            )) || (
              // Placeholder if no data
              [...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">Catálogo {index + 1}</p>
                      <p className="text-sm text-gray-400">-- visualizações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-400">R$ --</p>
                    <p className="text-sm text-gray-400">-- pedidos</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revendedores Ativos</h3>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {analytics?.activeResellers || 0}
            </p>
            <p className="text-sm text-gray-600">
              {analytics?.totalResellers || 0} total de revendedores
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Catálogos Publicados</h3>
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {analytics?.publishedCatalogs || 0}
            </p>
            <p className="text-sm text-gray-600">
              {analytics?.totalCatalogs || 0} total de catálogos
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Comissões Pagas</h3>
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(analytics?.totalCommissions || 0)}
            </p>
            <p className="text-sm text-gray-600">
              {(analytics?.avgCommissionRate || 0).toFixed(1)}% taxa média
            </p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analytics?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <activity.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            )) || (
              <p className="text-center text-gray-500 py-8">
                Nenhuma atividade recente encontrada
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
