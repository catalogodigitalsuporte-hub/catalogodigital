
import React, { useState } from 'react'
import { useResellers } from '../hooks/useResellers'
import * as LucideIcons from 'lucide-react'
import toast from 'react-hot-toast'

const Revendas: React.FC = () => {
  const { resellers, loading, error, createReseller, updateReseller, deleteReseller } = useResellers()
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [editingReseller, setEditingReseller] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    password: '',
    phone: '',
    whatsapp_number: '',
    commission_rate: 10,
    status: 'active' as const
  })

  // Gerar link de acesso baseado na URL atual
  const generateAccessLink = (resellerId: string) => {
    const currentOrigin = window.location.origin
    return `${currentOrigin}/revenda/${resellerId}`
  }

  const resetForm = () => {
    setFormData({
      business_name: '',
      contact_name: '',
      email: '',
      password: '',
      phone: '',
      whatsapp_number: '',
      commission_rate: 10,
      status: 'active'
    })
    setEditingReseller(null)
    setShowPassword(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      if (editingReseller) {
        const reseller = resellers.find(r => r._id === editingReseller)
        const accessLink = reseller ? generateAccessLink(reseller.reseller_id) : ''
        
        // Não incluir password se estiver vazio na edição
        const updateData = { ...formData, access_link: accessLink }
        if (!formData.password) {
          delete updateData.password
        }
        
        await updateReseller(editingReseller, updateData)
      } else {
        // Criar novo revendedor
        const newResellerId = `RSL-${Date.now()}`
        const accessLink = generateAccessLink(newResellerId)
        
        await createReseller({
          ...formData,
          reseller_id: newResellerId,
          access_link: accessLink
        })
      }
      
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao salvar revenda:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (reseller: any) => {
    setFormData({
      business_name: reseller.business_name || '',
      contact_name: reseller.contact_name || '',
      email: reseller.email || '',
      password: '', // Por segurança, não preenchemos a senha
      phone: reseller.phone || '',
      whatsapp_number: reseller.whatsapp_number || '',
      commission_rate: reseller.commission_rate || 10,
      status: reseller.status || 'active'
    })
    setEditingReseller(reseller._id)
    setShowForm(true)
  }

  const handleDelete = async (resellerId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta revenda?')) {
      try {
        await deleteReseller(resellerId)
      } catch (error) {
        console.error('Erro ao excluir revenda:', error)
      }
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copiado para a área de transferência!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar')
    }
  }

  // Estado de loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando revendas...</p>
        </div>
      </div>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LucideIcons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revendas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas revendas e seus acessos</p>
        </div>
        
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <LucideIcons.Plus size={20} />
          <span>Nova Revenda</span>
        </button>
      </div>

      {/* Lista de Revendas ou Estado Vazio */}
      {resellers.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LucideIcons.Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma revenda cadastrada</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Comece criando sua primeira revenda. Você poderá configurar o acesso e as credenciais.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg flex items-center space-x-3 mx-auto transition-colors text-lg"
          >
            <LucideIcons.Plus size={24} />
            <span>Adicionar Nova Revenda</span>
          </button>
        </div>
      ) : (
        <>
          {/* Lista de Revendas */}
          {resellers.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Revendas Cadastradas ({resellers.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {resellers.map((reseller) => {
                  const accessLink = generateAccessLink(reseller.reseller_id)
                  
                  return (
                    <div key={reseller._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-lg">
                                {reseller.business_name?.charAt(0)?.toUpperCase() || 'R'}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {reseller.business_name || 'Nome não informado'}
                              </h4>
                              <p className="text-gray-600">
                                {reseller.contact_name || 'Contato não informado'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Email */}
                            <div className="flex items-center space-x-2">
                              <LucideIcons.Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-600 truncate">
                                {reseller.email || 'Email não informado'}
                              </span>
                              {reseller.email && (
                                <button
                                  onClick={() => copyToClipboard(reseller.email, `email-${reseller._id}`)}
                                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                                >
                                  {copiedField === `email-${reseller._id}` ? 
                                    <LucideIcons.Check className="w-4 h-4 text-green-500" /> : 
                                    <LucideIcons.Copy className="w-4 h-4" />
                                  }
                                </button>
                              )}
                            </div>
                            
                            {/* Link de Acesso */}
                            <div className="flex items-center space-x-2">
                              <LucideIcons.Link className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-600 truncate">{accessLink}</span>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <button
                                  onClick={() => copyToClipboard(accessLink, `link-${reseller._id}`)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {copiedField === `link-${reseller._id}` ? 
                                    <LucideIcons.Check className="w-4 h-4 text-green-500" /> : 
                                    <LucideIcons.Copy className="w-4 h-4" />
                                  }
                                </button>
                                <a
                                  href={accessLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <LucideIcons.ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                            
                            {/* Status */}
                            <div className="flex items-center space-x-2">
                              <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                                reseller.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : reseller.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : reseller.status === 'suspended'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {reseller.status === 'active' ? 'Ativo' :
                                 reseller.status === 'pending' ? 'Pendente' :
                                 reseller.status === 'suspended' ? 'Suspenso' : 'Inativo'}
                              </span>
                            </div>
                          </div>

                          {/* Informações adicionais */}
                          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Comissão: {reseller.commission_rate || 0}%</span>
                            <span>Vendas: R$ {(reseller.total_sales || 0).toLocaleString('pt-BR')}</span>
                            <span>Pedidos: {reseller.total_orders || 0}</span>
                          </div>
                        </div>
                        
                        {/* Ações */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(reseller)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar revenda"
                          >
                            <LucideIcons.Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(reseller._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir revenda"
                          >
                            <LucideIcons.Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Formulário Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingReseller ? 'Editar Revenda' : 'Nova Revenda'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informações da Empresa */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Informações da Empresa</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Loja ABC"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Contato *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: João Silva"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Credenciais de Acesso */}
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <LucideIcons.Lock className="w-5 h-5 text-blue-600" />
                  <span>Credenciais de Acesso</span>
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Acesso *
                  </label>
                  <div className="relative">
                    <LucideIcons.Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@revenda.com"
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha de Acesso {!editingReseller && '*'}
                  </label>
                  <div className="relative">
                    <LucideIcons.Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingReseller}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={editingReseller ? "Deixe em branco para manter atual" : "Senha forte"}
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <LucideIcons.EyeOff className="w-5 h-5" /> : <LucideIcons.Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link de Acesso ao Painel
                  </label>
                  <div className="relative">
                    <LucideIcons.Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      readOnly
                      value={editingReseller ? 
                        generateAccessLink(resellers.find(r => r._id === editingReseller)?.reseller_id || '') :
                        'Será gerado após salvar'
                      }
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Este link será gerado automaticamente
                  </p>
                </div>
              </div>

              {/* Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa de Comissão (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  >
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {submitting 
                      ? (editingReseller ? 'Atualizando...' : 'Criando...') 
                      : (editingReseller ? 'Atualizar Revenda' : 'Criar Revenda')
                    }
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Revendas
