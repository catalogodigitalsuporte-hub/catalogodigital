
import React, { useState } from 'react'
import {X, MessageCircle as WhatsApp, ShoppingBag, ShoppingCart, Plus, Minus, User, MapPin, Phone, Mail} from 'lucide-react'

interface CatalogPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  catalog: any
  products: any[]
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

const CatalogPreviewModal: React.FC<CatalogPreviewModalProps> = ({
  isOpen,
  onClose,
  catalog,
  products
}) => {
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

  if (!isOpen || !catalog) return null

  const colors = catalog.brand_colors || {
    primary: '#8B5CF6',
    secondary: '#EC4899',
    accent: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937',
    card: '#F9FAFB'
  }

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)

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
    const whatsapp = catalog.whatsapp || ''
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X size={32} />
        </button>

        {/* Simulador de iPhone */}
        <div className="w-80 h-[700px] bg-gray-900 rounded-3xl p-3 shadow-2xl">
          {/* Notch do iPhone */}
          <div className="w-full h-6 bg-black rounded-t-2xl relative">
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-full"></div>
          </div>
          
          {/* Tela do catálogo */}
          <div className="w-full h-[calc(100%-24px)] bg-white rounded-b-2xl overflow-hidden">
            {/* Header do catálogo */}
            <div 
              className="relative h-40 flex items-end p-4"
              style={{
                background: catalog.layout_style === 'modern' 
                  ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                  : colors.primary,
                color: 'white'
              }}
            >
              {/* Ícone do carrinho no topo direito */}
              <button
                onClick={() => setShowCartModal(true)}
                className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all"
              >
                <div className="relative">
                  <ShoppingCart size={20} className="text-white" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </div>
              </button>

              {catalog.cover_image && (
                <img
                  src={catalog.cover_image}
                  alt="Capa"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )}
              <div className="relative z-10">
                <h1 className="text-xl font-bold mb-1">{catalog.name}</h1>
                <p className="text-sm opacity-90">{catalog.description}</p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs">Online agora</span>
                </div>
              </div>
            </div>

            {/* Lista de produtos */}
            <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100% - 160px)' }}>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum produto cadastrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <div 
                      key={product._id || index}
                      className="border rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      style={{ 
                        borderColor: colors.card,
                        backgroundColor: colors.background 
                      }}
                      onClick={() => handleProductClick(product)}
                    >
                      {/* Imagem do produto */}
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={product.images?.[0] || 'https://images.pexels.com/photos/441923/pexels-photo-441923.jpeg'}
                          alt={product.name}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                      
                      {/* Informações do produto */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-base" style={{ color: colors.text }}>
                            {product.name}
                          </h3>
                          {catalog.show_stock !== false && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              product.in_stock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.in_stock ? 'Disponível' : 'Esgotado'}
                            </span>
                          )}
                        </div>
                        
                        {/* Preços */}
                        <div className="flex items-center justify-between">
                          <div>
                            {catalog.show_prices !== false && (
                              <div className="flex items-center space-x-2">
                                <span 
                                  className="text-lg font-bold"
                                  style={{ color: colors.accent }}
                                >
                                  R$ {product.price?.toFixed(2) || '0,00'}
                                </span>
                                {catalog.show_original_price !== false && product.original_price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    R$ {product.original_price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                            {product.category && (
                              <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {product.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                              <span 
                                key={tagIndex}
                                className="px-2 py-1 text-xs rounded-full"
                                style={{ 
                                  backgroundColor: `${colors.primary}20`, 
                                  color: colors.primary 
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer fixo */}
            <div 
              className="border-t p-4"
              style={{ 
                borderColor: colors.card,
                backgroundColor: colors.background 
              }}
            >
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Catálogo Digital • {products.length} produtos
                </p>
                {catalog.whatsapp && (
                  <button
                    onClick={() => {
                      const cleanPhone = catalog.whatsapp.replace(/\D/g, '')
                      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre seus produtos.')}`
                      window.open(whatsappUrl, '_blank')
                    }}
                    className="flex items-center justify-center space-x-2 w-full py-2 rounded-lg text-white font-medium transition-colors"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <WhatsApp size={16} />
                    <span>Falar com Vendedor</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Produto */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedProduct.images?.[0] || 'https://images.pexels.com/photos/441923/pexels-photo-441923.jpeg'}
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
              
              {selectedProduct.description && (
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
              )}
              
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                  R$ {selectedProduct.price?.toFixed(2) || '0,00'}
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
                style={{ backgroundColor: colors.accent }}
                disabled={!selectedProduct.in_stock}
              >
                {selectedProduct.in_stock ? 'Adicionar ao Carrinho' : 'Produto Indisponível'}
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
                          src={item.product.images?.[0] || 'https://images.pexels.com/photos/441923/pexels-photo-441923.jpeg'}
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
                      <span style={{ color: colors.accent }}>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-xl text-white font-semibold text-lg transition-colors"
                    style={{ backgroundColor: colors.primary }}
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
                  <span style={{ color: colors.accent }}>R$ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleOrderSubmit}
                disabled={!customerData.name || !customerData.phone || !customerData.address.street || !customerData.address.number || !customerData.address.neighborhood || !customerData.address.city || !customerData.address.state || !customerData.address.zipCode}
                className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                style={{ backgroundColor: colors.accent }}
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

export default CatalogPreviewModal
