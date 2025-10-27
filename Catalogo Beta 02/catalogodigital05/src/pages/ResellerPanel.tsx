
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {Crown, LogOut, Plus, BookOpen, Share2, Eye, Edit3, Trash2, Package, Users, TrendingUp, MessageCircle as WhatsApp, Copy, Check, ShoppingBag} from 'lucide-react'
import { useResellerCatalogs } from '../hooks/useResellerCatalogs'
import { useCatalogProducts } from '../hooks/useCatalogProducts'
import CatalogConfigModal from '../components/CatalogConfigModal'
import CatalogPreviewModal from '../components/CatalogPreviewModal'
import toast from 'react-hot-toast'

const ResellerPanel: React.FC = () => {
  const navigate = useNavigate()
  const [reseller, setReseller] = useState<any>(null)
  const [showCreateCatalog, setShowCreateCatalog] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [editingCatalog, setEditingCatalog] = useState<any>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [previewCatalog, setPreviewCatalog] = useState<any>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  
  const { catalogs, loading: catalogsLoading, createCatalog, deleteCatalog, incrementShareCount, updateCatalog } = useResellerCatalogs(reseller?.reseller_id)
  const { products: allProducts } = useCatalogProducts(undefined, reseller?.reseller_id)
  
  const [catalogForm, setCatalogForm] = useState({
    name: '',
    description: '',
    category: 'moda',
    whatsapp: '',
    message_template: 'Olá! Tenho interesse neste produto:',
    status: 'active' as 'active' | 'inactive' | 'draft'
  })

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    images: [''],
    category: '',
    tags: '',
    in_stock: true,
    quantity: '',
    sku: ''
  })

  // Verificar autenticação do revendedor
  useEffect(() => {
    const resellerAuth = localStorage.getItem('resellerAuth')
    if (!resellerAuth) {
      navigate('/')
      return
    }

    try {
      const auth = JSON.parse(resellerAuth)
      setReseller(auth.reseller)
    } catch (error) {
      navigate('/')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('resellerAuth')
    toast.success('Logout realizado com sucesso')
    navigate('/')
  }

  const handleCreateCatalog = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createCatalog({
        ...catalogForm,
        reseller_id: reseller.reseller_id
      })
      
      setShowCreateCatalog(false)
      setCatalogForm({
        name: '',
        description: '',
        category: 'moda',
        whatsapp: '',
        message_template: 'Olá! Tenho interesse neste produto:',
        status: 'active'
      })
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCatalog) {
      toast.error('Selecione um catálogo primeiro')
      return
    }

    try {
      const { createProduct } = useCatalogProducts()
      
      await createProduct({
        catalog_id: selectedCatalog,
        reseller_id: reseller.reseller_id,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : undefined,
        images: productForm.images.filter(img => img.trim() !== ''),
        category: productForm.category,
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        in_stock: productForm.in_stock,
        quantity: parseInt(productForm.quantity) || 0,
        sku: productForm.sku
      })
      
      setShowAddProduct(false)
      setProductForm({
        name: '',
        description: '',
        price: '',
        original_price: '',
        images: [''],
        category: '',
        tags: '',
        in_stock: true,
        quantity: '',
        sku: ''
      })
      
      toast.success('Produto adicionado com sucesso!')
    } catch (error) {
      toast.error('Erro ao adicionar produto')
    }
  }

  const copyShareLink = async (catalogId: string) => {
    const catalogToShare = catalogs.find(c => c.catalog_id === catalogId)
    if (!catalogToShare) {
      toast.error('Catálogo não encontrado')
      return
    }
    const shareLink = `${window.location.origin}/catalogo/${catalogToShare.catalog_id}`
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopiedLink(catalogId)
      await incrementShareCount(catalogId)
      toast.success('Link copiado!')
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar link')
    }
  }

  const handleDeleteCatalog = async (catalogId: string, catalogName: string) => {
    if (confirm(`Tem certeza que deseja excluir o catálogo "${catalogName}"?`)) {
      try {
        await deleteCatalog(catalogId)
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  }

  const handleEditCatalog = (catalog: any) => {
    setEditingCatalog(catalog)
    setShowConfigModal(true)
  }

  const handlePreviewCatalog = (catalog: any) => {
    setPreviewCatalog(catalog)
    setShowPreviewModal(true)
  }

  const handleUpdateCatalog = async (catalogId: string, updates: any) => {
    try {
      await updateCatalog(catalogId, updates)
      setShowConfigModal(false)
      setEditingCatalog(null)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const addImageField = () => {
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }))
  }

  const updateImageField = (index: number, value: string) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }))
  }

  const removeImageField = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  if (!reseller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalProducts = allProducts.length
  const totalViews = catalogs.reduce((sum, cat) => sum + cat.view_count, 0)
  const totalShares = catalogs.reduce((sum, cat) => sum + cat.share_count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{reseller.business_name}</h1>
                <p className="text-sm text-gray-500">Painel do Revendedor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {reseller.contact_name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:block">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Catálogos</p>
                <p className="text-2xl font-bold text-gray-900">{catalogs.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compartilhamentos</p>
                <p className="text-2xl font-bold text-gray-900">{totalShares}</p>
              </div>
              <Share2 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meus Catálogos</h2>
            <p className="text-gray-600">Gerencie seus catálogos digitais para WhatsApp</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <ShoppingBag size={20} />
              <span>Adicionar Produto</span>
            </button>
            <button
              onClick={() => setShowCreateCatalog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus size={20} />
              <span>Novo Catálogo</span>
            </button>
          </div>
        </div>

        {/* Catalogs Grid */}
        {catalogsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catalogs.map(catalog => {
              const catalogProducts = allProducts.filter(p => p.catalog_id === catalog.catalog_id)
              
              return (
                <div key={catalog._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{catalog.name}</h3>
                        <p className="text-sm text-gray-600">{catalog.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Categoria: {catalog.category}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {catalog.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{catalogProducts.length} produtos</span>
                      <span>{catalog.view_count} views</span>
                      <span>{catalog.share_count} shares</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handlePreviewCatalog(catalog)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizar catálogo"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditCatalog(catalog)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar catálogo"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCatalog(catalog._id, catalog.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir catálogo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyShareLink(catalog.catalog_id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Copiar link"
                        >
                          {copiedLink === catalog.catalog_id ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <WhatsApp size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!catalogsLoading && catalogs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum catálogo criado</h3>
            <p className="text-gray-600 mb-6">Crie seu primeiro catálogo digital para WhatsApp</p>
            <button
              onClick={() => setShowCreateCatalog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Criar Primeiro Catálogo</span>
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <CatalogPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false)
          setPreviewCatalog(null)
        }}
        catalog={previewCatalog}
        products={previewCatalog ? allProducts.filter(p => p.catalog_id === previewCatalog.catalog_id) : []}
      />

      {/* Catalog Configuration Modal */}
      <CatalogConfigModal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false)
          setEditingCatalog(null)
        }}
        catalog={editingCatalog}
        onUpdate={handleUpdateCatalog}
      />

      {/* Create Catalog Modal */}
      {showCreateCatalog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Criar Novo Catálogo</h2>
                <button
                  onClick={() => setShowCreateCatalog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateCatalog} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Catálogo *
                  </label>
                  <input
                    type="text"
                    value={catalogForm.name}
                    onChange={(e) => setCatalogForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Coleção Verão 2024"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={catalogForm.description}
                    onChange={(e) => setCatalogForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva seu catálogo..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={catalogForm.category}
                    onChange={(e) => setCatalogForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="moda">Moda</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="casa">Casa e Decoração</option>
                    <option value="beleza">Beleza</option>
                    <option value="eletronicos">Eletrônicos</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp para Contato
                  </label>
                  <input
                    type="tel"
                    value={catalogForm.whatsapp}
                    onChange={(e) => setCatalogForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem Padrão
                  </label>
                  <textarea
                    value={catalogForm.message_template}
                    onChange={(e) => setCatalogForm(prev => ({ ...prev, message_template: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mensagem que será enviada quando clicarem em um produto"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateCatalog(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Criar Catálogo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Adicionar Produto</h2>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Catálogo *
                  </label>
                  <select
                    value={selectedCatalog || ''}
                    onChange={(e) => setSelectedCatalog(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Escolha um catálogo</option>
                    {catalogs.map(catalog => (
                      <option key={catalog._id} value={catalog.catalog_id}>
                        {catalog.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do produto"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Categoria do produto"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição do produto"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço Original
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.original_price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, original_price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagens do Produto
                  </label>
                  {productForm.images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="URL da imagem"
                      />
                      {productForm.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Adicionar mais uma imagem
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={productForm.tags}
                      onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Código do produto"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.in_stock}
                      onChange={(e) => setProductForm(prev => ({ ...prev, in_stock: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Produto em estoque</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Adicionar Produto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResellerPanel
