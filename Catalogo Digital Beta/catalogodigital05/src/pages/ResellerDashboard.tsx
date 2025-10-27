
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useResellers } from '../hooks/useResellers'
import * as LucideIcons from 'lucide-react'

const ResellerDashboard: React.FC = () => {
  const { resellerId } = useParams<{ resellerId: string }>()
  const { resellers } = useResellers()

  // Encontrar o revendedor pelo ID
  const reseller = resellers.find(r => r.reseller_id === resellerId)

  if (!reseller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Revenda não encontrada</h1>
          <p className="text-gray-600">O link de acesso não é válido.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <LucideIcons.Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{reseller.business_name}</h1>
                <p className="text-sm text-gray-600">Painel do Revendedor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {reseller.contact_name}
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <LucideIcons.LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <LucideIcons.DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Totais</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {(reseller.total_sales || 0).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <LucideIcons.ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{reseller.total_orders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <LucideIcons.TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comissão</p>
                <p className="text-2xl font-bold text-gray-900">{reseller.commission_rate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <LucideIcons.Package className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <LucideIcons.Package className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Meu Catálogo</h3>
            </div>
            <p className="text-gray-600 mb-4">Gerencie seus produtos e organize seu catálogo digital.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
              Gerenciar Catálogo
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <LucideIcons.ShoppingBag className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pedidos</h3>
            </div>
            <p className="text-gray-600 mb-4">Acompanhe todos os pedidos e vendas realizadas.</p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
              Ver Pedidos
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <LucideIcons.Share2 className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Compartilhar</h3>
            </div>
            <p className="text-gray-600 mb-4">Compartilhe seu catálogo com clientes via WhatsApp.</p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
              Compartilhar Catálogo
            </button>
          </div>
        </div>

        {/* Status da Conta */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600">Status da Conta</p>
              <span className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
                reseller.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : reseller.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {reseller.status === 'active' ? 'Ativa' : 
                 reseller.status === 'pending' ? 'Pendente' : 'Inativa'}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{reseller.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-medium text-gray-900">{reseller.phone || 'Não informado'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">WhatsApp</p>
              <p className="font-medium text-gray-900">{reseller.whatsapp_number || 'Não informado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResellerDashboard
