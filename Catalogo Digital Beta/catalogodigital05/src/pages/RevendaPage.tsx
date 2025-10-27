
import React, { useState } from 'react'
import { useResellers } from '../hooks/useResellers'
import * as LucideIcons from 'lucide-react'
import toast from 'react-hot-toast'

const RevendaPage: React.FC = () => {
  const { createReseller, loading } = useResellers()
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [createdReseller, setCreatedReseller] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    business_name: '',
    contact_name: '',
    phone: '',
    whatsapp_number: '',
    commission_rate: 15
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commission_rate' ? parseFloat(value) || 0 : value
    }))
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password }))
  }

  const generateResellerId = () => {
    return `RSL-${Date.now()}`
  }

  const generateAccessLink = (resellerId: string) => {
    return `${window.location.origin}/revenda/${resellerId}`
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copiado para área de transferência!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.business_name || !formData.contact_name) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const resellerId = generateResellerId()
      const accessLink = generateAccessLink(resellerId)
      
      const newReseller = await createReseller({
        ...formData,
        reseller_id: resellerId,
        access_link: accessLink,
        status: 'active'
      })
      
      // Manter a senha no estado para mostrar no resultado
      const resellerWithPassword = {
        ...newReseller,
        password: formData.password
      }
      
      setCreatedReseller(resellerWithPassword)
      setShowForm(false)
      toast.success('Revendedor criado com sucesso!')
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        business_name: '',
        contact_name: '',
        phone: '',
        whatsapp_number: '',
        commission_rate: 15
      })
    } catch (error) {
      toast.error('Erro ao criar revendedor')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenda</h1>
          <p className="text-gray-600">Cadastre novos revendedores e gerencie acessos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <LucideIcons.Plus size={20} />
          <span>Novo Revendedor</span>
        </button>
      </div>

      {/* Success Card - Show created reseller details */}
      {createdReseller && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <LucideIcons.Check className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900">Revendedor Criado com Sucesso!</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Email de Acesso</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={createdReseller.email}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(createdReseller.email, 'email')}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    {copiedField === 'email' ? <LucideIcons.Check size={16} /> : <LucideIcons.Copy size={16} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Senha</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={createdReseller.password}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(createdReseller.password, 'password')}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    {copiedField === 'password' ? <LucideIcons.Check size={16} /> : <LucideIcons.Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Link do Painel</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={createdReseller.access_link}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => copyToClipboard(createdReseller.access_link, 'link')}
                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                >
                  {copiedField === 'link' ? <LucideIcons.Check size={16} /> : <LucideIcons.Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Instruções:</strong> Envie o email, senha e link do painel para o revendedor. 
              Ele poderá acessar seu painel personalizado através do link único e começar a criar catálogos digitais.
            </p>
          </div>
          
          <button
            onClick={() => setCreatedReseller(null)}
            className="mt-4 text-sm text-green-700 hover:text-green-800 underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Cadastrar Novo Revendedor</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <LucideIcons.Building className="w-5 h-5 mr-2" />
                    Informações do Negócio
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Negócio *
                      </label>
                      <input
                        type="text"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Loja da Maria"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Contato *
                      </label>
                      <input
                        type="text"
                        name="contact_name"
                        value={formData.contact_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Maria Silva"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <LucideIcons.Phone className="w-5 h-5 mr-2" />
                    Contato
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="whatsapp_number"
                        value={formData.whatsapp_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Access Credentials */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <LucideIcons.User className="w-5 h-5 mr-2" />
                    Credenciais de Acesso
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <div className="flex items-center space-x-2">
                        <LucideIcons.Mail className="w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="revendedor@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha *
                      </label>
                      <div className="flex items-center space-x-2">
                        <LucideIcons.Lock className="w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Senha segura"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <LucideIcons.EyeOff size={16} /> : <LucideIcons.Eye size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          Gerar
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxa de Comissão (%)
                      </label>
                      <input
                        type="number"
                        name="commission_rate"
                        value={formData.commission_rate}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <LucideIcons.UserPlus size={16} />
                    )}
                    <span>{loading ? 'Criando...' : 'Criar Revendedor'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Como Funciona a Revenda</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcons.UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Cadastre o Revendedor</h4>
            <p className="text-sm text-gray-600">
              Preencha os dados do revendedor e gere as credenciais de acesso automaticamente.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LucideIcons.Link className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Envie o Link de Acesso</h4>
            <p className="text-sm text-gray-600">
              Compartilhe o email, senha e link único do painel personalizado com o revendedor.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Criação de Catálogos</h4>
            <p className="text-sm text-gray-600">
              O revendedor acessa seu painel único e cria catálogos digitais para WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevendaPage
