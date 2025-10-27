
import React, { useState, useEffect } from 'react'
import {X, Eye, Palette, Package, Smartphone, MessageCircle as WhatsApp, ShoppingCart, Plus, Minus, User, MapPin, Check} from 'lucide-react'

interface CatalogConfigModalProps {
  isOpen: boolean
  onClose: () => void
  catalog: any
  onUpdate: (catalogId: string, updates: any) => void
}

interface CartItem {
  product: any
  quantity: number
}

interface CustomerData {
  name: string
  phone: string
  email: string
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    complement?: string
  }
}

const CatalogConfigModal: React.FC<CatalogConfigModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('geral')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'moda',
    whatsapp: '',
    message_template: 'Olá! Tenho interesse neste produto:',
    status: 'active' as 'active' | 'inactive' | 'draft',
    brand_colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#10B981',
      background: '#FFFFFF',
      text: '#1F2937',
      card: '#F9FAFB'
    },
    layout_style: 'modern' as 'modern' | 'classic' | 'minimal',
    show_prices: true,
    show_original_price: true,
    show_stock: true,
    cover_image: ''
  })

  // Estados do carrinho para o preview
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [productQuantity, setProductQuantity] = useState(1)
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      complement: ''
    }
  })

  // Produtos de exemplo para o preview
  const sampleProducts = [
    {
      _id: '1',
      name: 'Bolo de Chocolate',
      description: 'Bolo de chocolate feito na hora',
      price: 25.00,
      original_price: 32.00,
      images: ['https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'],
      category: 'Doces',
      in_stock: true,
      tags: ['chocolate', 'doce', 'bolo']
    },
    {
      _id: '2',
      name: 'Bolo de Laranja',
      description: 'Bolo fofinho de laranja',
      price: 22.00,
      original_price: 28.00,
      images: ['https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg'],
      category: 'Doces',
      in_stock: true,
      tags: ['laranja', 'doce', 'bolo']
    }
  ]

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)

  useEffect(() => {
    if (catalog) {
      setFormData({
        name: catalog.name || '',
        description: catalog.description || '',
        category: catalog.category || 'moda',
        whatsapp: catalog.whatsapp || '',
        message_template: catalog.message_template || 'Olá! Tenho interesse neste produto:',
        status: catalog.status || 'active',
        brand_colors: catalog.brand_colors || {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#10B981',
          background: '#FFFFFF',
          text: '#1F2937',
          card: '#F9FAFB'
        },
        layout_style: catalog.layout_style || 'modern',
        show_prices: catalog.show_prices !== false,
        show_original_price: catalog.show_original_price !== false,
        show_stock: catalog.show_stock !== false,
        cover_image: catalog.cover_image || ''
      })
    }
  }, [catalog])

  if (!isOpen || !catalog) return null

  const handleSave = async () => {
    try {
      await onUpdate(catalog._id, formData)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setProductQuantity(1)
    setShowProductModal(true)
  }

  const addToCart = (product: any, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product._id === product._id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevCart, { product, quantity }]
      }
    })
    setShowProductModal(false)
    setProductQuantity(1)
  }

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.product._id !== productId))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
    }
  }

  const handleCheckout = () => {
    setShowCartModal(false)
    setShowCheckoutModal(true)
  }

  const handleOrderSubmit = () => {
    // Formatar pedido para WhatsApp
    let orderMessage = `🛍️ *NOVO PEDIDO*\n\n`
    orderMessage += `👤 *Cliente:* ${customerData.name}\n`
    orderMessage += `📱 *Telefone:* ${customerData.phone}\n`
    if (customerData.email) {
      orderMessage += `📧 *Email:* ${customerData.email}\n`
    }
    orderMessage += `\n📍 *Endereço de Entrega:*\n`
    orderMessage += `${customerData.address.street}, ${customerData.address.number}\n`
    orderMessage += `${customerData.address.neighborhood}\n`
    orderMessage += `${customerData.address.city} - ${customerData.address.state}\n`
    orderMessage += `CEP: ${customerData.address.zipCode}\n`
    if (customerData.address.complement) {
      orderMessage += `Complemento: ${customerData.address.complement}\n`
    }
    
    orderMessage += `\n🛒 *Itens do Pedido:*\n`
    cart.forEach((item, index) => {
      orderMessage += `\n${index + 1}. *${item.product.name}*\n`
      orderMessage += `   Quantidade: ${item.quantity}\n`
      orderMessage += `   Preço unitário: R$ ${item.product.price.toFixed(2)}\n`
      orderMessage += `   Subtotal: R$ ${(item.product.price * item.quantity).toFixed(2)}\n`
    })
    
    orderMessage += `\n💰 *Total do Pedido: R$ ${cartTotal.toFixed(2)}*`
    
    // Redirecionar para WhatsApp
    const whatsapp = formData.whatsapp || ''
    if (whatsapp) {
      const cleanPhone = whatsapp.replace(/\D/g, '')
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(orderMessage)}`
      window.open(whatsappUrl, '_blank')
    }
    
    // Limpar carrinho e fechar modais
    setCart([])
    setShowCheckoutModal(false)
    setCustomerData({
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        complement: ''
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex">
        {/* Sidebar de Configurações */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('geral')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'geral' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Eye size={20} />
                <span>Geral</span>
              </button>
              
              <button
                onClick={() => setActiveTab('design')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'design' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Palette size={20} />
                <span>Design</span>
              </button>
              
              <button
                onClick={() => setActiveTab('produtos')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'produtos' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Package size={20} />
                <span>Produtos</span>
              </button>
              
              <button
                onClick={() => setActiveTab('preview')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'preview' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Smartphone size={20} />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'geral' && (
            <div className="p-6 overflow-y-auto">
              <h3 className="text-xl font-semibold mb-6">Informações Gerais</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Catálogo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do catálogo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição do catálogo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="moda">Moda</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="casa">Casa e Decoração</option>
                    <option value="beleza">Beleza</option>
                    <option value="eletronicos">Eletrônicos</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp para Contato
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem Padrão
                  </label>
                  <textarea
                    value={formData.message_template}
                    onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mensagem que será enviada quando clicarem em um produto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="draft">Rascunho</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="p-6 overflow-y-auto">
              <h3 className="text-xl font-semibold mb-6">Personalização Visual</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estilo do Layout
                  </label>
                  <select
                    value={formData.layout_style}
                    onChange={(e) => setFormData(prev => ({ ...prev, layout_style: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="modern">Moderno</option>
                    <option value="classic">Clássico</option>
                    <option value="minimal">Minimalista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Cores do Catálogo
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Cor Primária</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.brand_colors.primary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            brand_colors: { ...prev.brand_colors, primary: e.target.value }
                          }))}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.brand_colors.primary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            brand_colors: { ...prev.brand_colors, primary: e.target.value }
                          }))}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Cor Secundária</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.brand_colors.secondary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            brand_colors: { ...prev.brand_colors, secondary: e.target.value }
                          }))}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.brand_colors.secondary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            brand_colors: { ...prev.brand_colors, secondary: e.target.value }
                          }))}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Cor de Destaque</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.brand_colors.accent}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            brand_colors: { ...prev.brand_colors, accent: e.target.value }
                          }))}
                          className="w-12 h-10 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formData.brand_colors.accent}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            brand_colors: { ...prev.brand_colors, accent: e.target.value }
                          }))}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem de Capa (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.cover_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Opções de Exibição</h4>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.show_prices}
                      onChange={(e) => setFormData(prev => ({ ...prev, show_prices: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Mostrar preços</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.show_original_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, show_original_price: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Mostrar preço original riscado</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.show_stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, show_stock: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Mostrar status do estoque</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'produtos' && (
            <div className="p-6 overflow-y-auto">
              <h3 className="text-xl font-semibold mb-6">Configurações de Produtos</h3>
              
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Configurações avançadas de produtos</p>
                <p className="text-sm text-gray-500">Em breve: filtros, categorias, ordenação automática</p>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Preview do Catálogo</h3>
                <p className="text-gray-600 text-sm mb-8">Veja como seu catálogo ficará no celular dos clientes</p>
              </div>

              {/* Simulador de iPhone */}
              <div className="w-80 h-[600px] bg-gray-900 rounded-3xl p-3 shadow-2xl">
                {/* Notch do iPhone */}
                <div className="w-full h-6 bg-black rounded-t-2xl relative">
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-full"></div>
                </div>
                
                {/* Tela do catálogo */}
                <div className="w-full h-[calc(100%-24px)] bg-white rounded-b-2xl overflow-hidden">
                  {/* Header do catálogo */}
                  <div 
                    className="relative h-32 flex items-end p-4"
                    style={{
                      background: formData.layout_style === 'modern' 
                        ? `linear-gradient(135deg, ${formData.brand_colors.primary}, ${formData.brand_colors.secondary})`
                        : formData.brand_colors.primary,
                      color: 'white'
                    }}
                  >
                    {/* Ícone do carrinho no topo direito */}
                    <button
                      onClick={() => setShowCartModal(true)}
                      className="absolute top-3 right-3 p-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all"
                    >
                      <div className="relative">
                        <ShoppingCart size={18} className="text-white" />
                        {cartItemsCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {cartItemsCount}
                          </span>
                        )}
                      </div>
                    </button>

                    {formData.cover_image && (
                      <img
                        src={formData.cover_image}
                        alt="Capa"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                      />
                    )}
                    <div className="relative z-10">
                      <h1 className="text-lg font-bold mb-1">{formData.name}</h1>
                      <p className="text-sm opacity-90">{formData.description}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs">Online agora</span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de produtos */}
                  <div className="flex-1 overflow-y-auto p-3" style={{ height: 'calc(100% - 160px)' }}>
                    <div className="space-y-3">
                      {sampleProducts.map((product, index) => (
                        <div 
                          key={product._id}
                          className="border rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          style={{ 
                            borderColor: formData.brand_colors.card,
                            backgroundColor: formData.brand_colors.background 
                          }}
                          onClick={() => handleProductClick(product)}
                        >
                          {/* Imagem do produto */}
                          <div className="aspect-w-16 aspect-h-9">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                          
                          {/* Informações do produto */}
                          <div className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-sm" style={{ color: formData.brand_colors.text }}>
                                {product.name}
                              </h3>
                              {formData.show_stock && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  Disponível
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                            
                            {/* Preços */}
                            {formData.show_prices && (
                              <div className="flex items-center space-x-2 mb-2">
                                <span 
                                  className="text-sm font-bold"
                                  style={{ color: formData.brand_colors.accent }}
                                >
                                  R$ {product.price.toFixed(2)}
                                </span>
                                {formData.show_original_price && product.original_price && (
                                  <span className="text-xs text-gray-500 line-through">
                                    R$ {product.original_price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500">{product.category}</p>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                                <span 
                                  key={tagIndex}
                                  className="px-2 py-1 text-xs rounded-full"
                                  style={{ 
                                    backgroundColor: `${formData.brand_colors.primary}20`, 
                                    color: formData.brand_colors.primary 
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer fixo */}
                  <div 
                    className="border-t p-3"
                    style={{ 
                      borderColor: formData.brand_colors.card,
                      backgroundColor: formData.brand_colors.background 
                    }}
                  >
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">
                        Catálogo Digital • {sampleProducts.length} produtos
                      </p>
                      {formData.whatsapp && (
                        <button
                          className="flex items-center justify-center space-x-2 w-full py-2 rounded-lg text-white font-medium text-sm transition-colors"
                          style={{ backgroundColor: formData.brand_colors.primary }}
                        >
                          <WhatsApp size={14} />
                          <span>Falar com Vendedor</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal do Produto */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <button
                onClick={() => setShowProductModal(false)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
              
              <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
              
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl font-bold" style={{ color: formData.brand_colors.accent }}>
                  R$ {selectedProduct.price.toFixed(2)}
                </span>
                {selectedProduct.original_price && (
                  <span className="text-lg text-gray-500 line-through">
                    R$ {selectedProduct.original_price.toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Seletor de quantidade */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold">Quantidade:</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{productQuantity}</span>
                  <button
                    onClick={() => setProductQuantity(productQuantity + 1)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => addToCart(selectedProduct, productQuantity)}
                className="w-full py-3 rounded-xl text-white font-semibold text-lg transition-colors"
                style={{ backgroundColor: formData.brand_colors.accent }}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Carrinho */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Carrinho</h2>
                <button
                  onClick={() => setShowCartModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Seu carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.product._id} className="flex items-center space-x-4 p-4 border rounded-xl">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">R$ {item.product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartItemQuantity(item.product._id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItemQuantity(item.product._id, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 mb-6">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span style={{ color: formData.brand_colors.accent }}>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-xl text-white font-semibold text-lg transition-colors"
                    style={{ backgroundColor: formData.brand_colors.primary }}
                  >
                    Finalizar Compra
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Finalizar Pedido</h2>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Dados pessoais */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Dados Pessoais
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome completo *"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Telefone/WhatsApp *"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email (opcional)"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Endereço de entrega */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin size={20} className="mr-2" />
                  Endereço de Entrega
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="CEP *"
                      value={customerData.address.zipCode}
                      onChange={(e) => setCustomerData(prev => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Número *"
                      value={customerData.address.number}
                      onChange={(e) => setCustomerData(prev => ({
                        ...prev,
                        address: { ...prev.address, number: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Rua/Avenida *"
                    value={customerData.address.street}
                    onChange={(e) => setCustomerData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Bairro *"
                    value={customerData.address.neighborhood}
                    onChange={(e) => setCustomerData(prev => ({
                      ...prev,
                      address: { ...prev.address, neighborhood: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Cidade *"
                      value={customerData.address.city}
                      onChange={(e) => setCustomerData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Estado *"
                      value={customerData.address.state}
                      onChange={(e) => setCustomerData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Complemento (opcional)"
                    value={customerData.address.complement}
                    onChange={(e) => setCustomerData(prev => ({
                      ...prev,
                      address: { ...prev.address, complement: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Resumo do pedido */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
                <div className="space-y-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span style={{ color: formData.brand_colors.accent }}>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleOrderSubmit}
                disabled={!customerData.name || !customerData.phone || !customerData.address.street || !customerData.address.number || !customerData.address.neighborhood || !customerData.address.city || !customerData.address.state || !customerData.address.zipCode}
                className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                style={{ backgroundColor: formData.brand_colors.accent }}
              >
                <WhatsApp size={20} />
                <span>Fazer Pedido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CatalogConfigModal
