
import React, { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import { useAuth } from '../hooks/useAuth'
import * as LucideIcons from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  _id: string
  order_id: string
  reseller_id: string
  catalog_id: string
  customer_info: {
    name: string
    phone: string
    whatsapp: string
    address: string
  }
  items: Array<{
    product_id: string
    name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
  total_amount: number
  commission_amount: number
  status: string
  payment_status: string
  whatsapp_conversation: string
  created_at: string
  updated_at: string
}

const OrdersPage: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const isAdmin = user?.userRole === 'ADMIN'

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await lumi.entities.orders.list({
        sort: { created_at: -1 }
      })
      
      let filteredOrders = response.list || []
      
      // Filter by reseller if not admin
      if (!isAdmin && user?.userId) {
        filteredOrders = filteredOrders.filter((order: Order) => 
          order.reseller_id === user.userId
        )
      }
      
      setOrders(filteredOrders)
    } catch (error: any) {
      console.error('Failed to fetch orders:', error)
      toast.error('Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await lumi.entities.orders.update(orderId, {
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ))
      
      toast.success('Status do pedido atualizado!')
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_info.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'confirmed': return 'Confirmado'
      case 'shipped': return 'Enviado'
      case 'delivered': return 'Entregue'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'pending': return 'Pendente'
      case 'failed': return 'Falhou'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openWhatsApp = (whatsappUrl: string) => {
    window.open(whatsappUrl, '_blank')
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
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
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gerencie todos os pedidos do sistema' : 'Acompanhe seus pedidos e vendas'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <LucideIcons.Package className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Confirmados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Entregues</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <LucideIcons.DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Faturamento</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            R$ {orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por ID do pedido, cliente ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <LucideIcons.Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="confirmed">Confirmado</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.order_id}</div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <LucideIcons.User className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_info.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_info.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-500">
                      Comissão: R$ {order.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`text-xs font-medium rounded-full border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                      {getPaymentStatusLabel(order.payment_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <LucideIcons.Calendar className="h-4 w-4 mr-1" />
                      {formatDate(order.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <LucideIcons.Eye size={16} />
                      </button>
                      <button
                        onClick={() => openWhatsApp(order.whatsapp_conversation)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <LucideIcons.MessageCircleDashed size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <LucideIcons.Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin 
              ? 'Não há pedidos no sistema ainda.' 
              : 'Você ainda não recebeu pedidos. Compartilhe seus catálogos para começar a vender!'
            }
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pedido {selectedOrder.order_id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nome</p>
                    <p className="text-sm text-gray-900">{selectedOrder.customer_info.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Telefone</p>
                    <p className="text-sm text-gray-900">{selectedOrder.customer_info.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700">Endereço</p>
                    <p className="text-sm text-gray-900">{selectedOrder.customer_info.address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Quantidade: {item.quantity} × R$ {item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        R$ {item.total_price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Total do Pedido</span>
                  <span className="font-bold text-lg text-gray-900">
                    R$ {selectedOrder.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Sua Comissão</span>
                  <span className="font-bold text-green-600">
                    R$ {selectedOrder.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pagamento</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                      {getPaymentStatusLabel(selectedOrder.payment_status)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => openWhatsApp(selectedOrder.whatsapp_conversation)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <LucideIcons.MessageCircleDashed size={16} />
                  <span>Abrir WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage
