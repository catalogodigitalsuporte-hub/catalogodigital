import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShoppingCart, ShoppingBag, MessageCircle as WhatsApp, X, Plus, Minus } from 'lucide-react'
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast'

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

const CatalogView: React.FC = () => {
  const { catalogId } = useParams<{ catalogId: string }>()
  const [catalog, setCatalog] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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

  // Carregar dados do catálogo e produtos
  useEffect(() => {
    const fetchCatalogData = async () => {
      if (!catalogId) {
        setError('ID do catálogo não fornecido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Buscar catálogo pelo ID
       const qCatalog = query(
          collection(db, 'reseller_catalogs'),
          where('catalog_id', '==', catalogId)
        );
        const catalogSnapshot = await getDocs(qCatalog);
        const catalogData = catalogSnapshot.docs.length > 0 
          ? { id: catalogSnapshot.docs[0].id, ...catalogSnapshot.docs[0].data() } 
          : null;        if (!catalogData) {
          setError('Catálogo não encontrado')
          setLoading(false)
          return
        }

        setCatalog(catalogData)

        // Buscar produtos do catálogo
       const qProducts = query(
          collection(db, 'catalog_products'),
          where('catalog_id', '==', catalogId),
          orderBy('created_at', 'desc')
        );
        const productsSnapshot = await getDocs(qProducts);
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));        setProducts(productsList)

        // Incrementar view count
        try {
         const catalogRef = doc(db, 'reseller_catalogs', catalogData.id);
          await updateDoc(catalogRef, {
            view_count: (catalogData.view_count || 0) + 1,
            updated_at: new Date().toISOString()
          });
        } catch (err) {
          console.error('Erro ao incrementar visualizações:', err)
        }
      } catch (err: any) {
        console.error('Erro ao carregar catálogo:', err)
        setError('Erro ao carregar catálogo. Por favor, tente novamente.')
        toast.error('Erro ao carregar catálogo')
      } finally {
        setLoading(false)
      }
    }

    fetchCatalogData()
  }, [catalogId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    )
  }

  if (error || !catalog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Catálogo não encontrado</h2>
          <p className="text-gray-600">{error || 'O catálogo que você está procurando não existe ou foi removido.'}</p>
        </div>
      </div>
    )
  }

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
      const existingItem = prevCart.find(item => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [...prevCart, { product, quantity }]
      }
    })
    setShowProductModal(false)
    setProductQuantity(1)
    toast.success('Produto adicionado ao carrinho!')
  }

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
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
    if (!customerData.name || !customerData.phone) {
      toast.error('Por favor, preencha nome e telefone')
      return
    }

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
    
    const whatsapp = catalog.whatsapp || ''
    if (whatsapp) {
      const cleanPhone = whatsapp.replace(/\D/g, '')
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(orderMessage)}`
      window.open(whatsappUrl, '_blank')
    }
    
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
    toast.success('Pedido enviado com sucesso!')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header do catálogo */}
      <div 
        className="relative h-40 flex items-end p-4 text-white"
        style={{
          background: catalog.layout_style === 'modern' 
            ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
            : colors.primary
        }}
      >
        {/* Ícone do carrinho no topo direito */}
        <button
          onClick={() => setShowCartModal(true)}
          className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all"
        >
          <div className="relative">
            <ShoppingCart size={24} className="text-white" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
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
          <h1 className="text-3xl font-bold mb-2">{catalog.name}</h1>
          <p className="text-lg opacity-90">{catalog.description}</p>
          <div className="flex items-center mt-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm">Online agora</span>
          </div>
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="max-w-4xl mx-auto p-4">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhum produto cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <div 
                key={product.id || index}
                className="rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                style={{ 
                  borderColor: colors.card,
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.card}`
                }}
                onClick={() => handleProductClick(product)}
              >
                {/* Imagem do produto */}
                <div className="aspect-video overflow-hidden bg-gray-200">
                  <img
                    src={product.images?.[0] || 'https://images.pexels.com/photos/441923/pexels-photo-441923.jpeg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Informações do produto */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base line-clamp-2" style={{ color: colors.text }}>
                      {product.name}
                    </h3>
                    {catalog.show_stock !== false && (
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${
                        product.in_stock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.in_stock ? 'Disponível' : 'Esgotado'}
                      </span>
                    )}
                  </div>
                  
                  {/* Preços */}
                  {catalog.show_prices !== false && (
                    <div className="flex items-center space-x-2 mb-3">
                      <span 
                        className="text-lg font-bold"
                        style={{ color: colors.accent }}
                      >
                        R$ {product.price?.toFixed(2) || '0,00'}
                      </span>
                      {product.original_price && (
                        <span className="text-sm text-gray-500 line-through">
                          R$ {product.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
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
        className="border-t p-4 mt-8"
        style={{ 
          borderColor: colors.card,
          backgroundColor: colors.background 
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-3">
            Catálogo Digital • {products.length} produtos
          </p>
          {catalog.whatsapp && (
            <button
              onClick={() => {
                const cleanPhone = catalog.whatsapp.replace(/\D/g, '')
                const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre seus produtos.')}`
                window.open(whatsappUrl, '_blank')
              }}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              <WhatsApp size={18} />
              <span>Falar com Vendedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal do Produto */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              
              {/* Botão Adicionar ao Carrinho */}
              <button
                onClick={() => addToCart(selectedProduct, productQuantity)}
                className="w-full py-3 rounded-lg text-white font-semibold transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Carrinho */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Carrinho</h2>
                <button
                  onClick={() => setShowCartModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Seu carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">R$ {item.product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                        R$ {cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full py-3 rounded-lg text-white font-semibold transition-colors hover:opacity-90"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Finalizar Compra
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Dados de Entrega</h2>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                  <input
                    type="text"
                    value={customerData.address.street}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: {...customerData.address, street: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rua"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                    <input
                      type="text"
                      value={customerData.address.number}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        address: {...customerData.address, number: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                    <input
                      type="text"
                      value={customerData.address.neighborhood}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        address: {...customerData.address, neighborhood: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bairro"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                    <input
                      type="text"
                      value={customerData.address.city}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        address: {...customerData.address, city: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Cidade"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                    <input
                      type="text"
                      value={customerData.address.state}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        address: {...customerData.address, state: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SP"
                      maxLength="2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                  <input
                    type="text"
                    value={customerData.address.zipCode}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: {...customerData.address, zipCode: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345-678"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={customerData.address.complement}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: {...customerData.address, complement: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apto, sala, etc"
                  />
                </div>
              </div>
              
              <button
                onClick={handleOrderSubmit}
                className="w-full mt-6 py-3 rounded-lg text-white font-semibold transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                Enviar Pedido via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CatalogView

