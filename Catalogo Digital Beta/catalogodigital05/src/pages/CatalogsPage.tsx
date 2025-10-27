
import React, { useState } from 'react'
import { useCatalogs } from '../hooks/useCatalogs'
import { useAuth } from '../hooks/useAuth'
import * as LucideIcons from 'lucide-react'
import toast from 'react-hot-toast'

const CatalogsPage: React.FC = () => {
  const { user } = useAuth()
  const { catalogs, loading, createCatalog, deleteCatalog } = useCatalogs()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  
  const [newCatalog, setNewCatalog] = useState({
    name: '',
    description: '',
    template_id: 'TPL-001',
    whatsapp_message: 'Olá! Confira nosso catálogo digital. O que te interessa?'
  })

  const isAdmin = user?.userRole === 'ADMIN'
  
  // Filter catalogs based on user role
  const userCatalogs = isAdmin ? catalogs : catalogs.filter(catalog => 
    catalog.reseller_id === user?.userId
  )

  const filteredCatalogs = userCatalogs.filter(catalog => {
    const matchesSearch = catalog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         catalog.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || catalog.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleCreateCatalog = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCatalog.name.trim()) {
      toast.error('Nome do catálogo é obrigatório')
      return
    }

    try {
      await createCatalog({
        ...newCatalog,
        reseller_id: user?.userId || 'current-user'
      })
      
      setShowCreateForm(false)
      setNewCatalog({
        name: '',
        description: '',
        template_id: 'TPL-001',
        whatsapp_message: 'Olá! Confira nosso catálogo digital. O que te interessa?'
      })
      toast.success('Catálogo criado com sucesso!')
    } catch (error) {
      toast.error('Erro ao criar catálogo')
    }
  }

  const handleDelete = async (catalogId: string, catalogName: string) => {
    if (confirm(`Tem certeza que deseja excluir o catálogo "${catalogName}"? Esta ação não pode ser desfeita.`)) {
      await deleteCatalog(catalogId)
    }
  }

  const copyShareLink = async (shareLink: string, catalogId: string) => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopiedLink(catalogId)
      toast.success('Link copiado!')
      setTimeout(() => setCopiedLink(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar link')
    }
  }

  const shareOnWhatsApp = (catalog: any) => {
    const message = encodeURIComponent(
      `${catalog.whatsapp_message}\n\n🛍️ ${catalog.name}\n${catalog.share_link}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado'
      case 'draft': return 'Rascunho'
      case 'archived': return 'Arquivado'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Todos os Catálogos' : 'Meus Catálogos'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Visualize todos os catálogos do sistema' : 'Crie e gerencie seus catálogos digitais'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <LucideIcons.Plus size={20} />
            <span>Novo Catálogo</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Publicados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filteredCatalogs.filter(c => c.status === 'published').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Rascunhos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filteredCatalogs.filter(c => c.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Visualizações</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filteredCatalogs.reduce((sum, c) => sum + (c.view_count || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Compartilhamentos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {filteredCatalogs.reduce((sum, c) => sum + (c.share_count || 0), 0)}
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
              placeholder="Buscar catálogos..."
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
              <option value="published">Publicado</option>
              <option value="draft">Rascunho</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalogs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalogs.map((catalog) => (
          <div key={catalog._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
              {catalog.cover_image ? (
                <img
                  src={catalog.cover_image}
                  alt={catalog.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-6xl font-bold opacity-20">
                    {catalog.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(catalog.status)}`}>
                  {getStatusLabel(catalog.status)}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{catalog.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{catalog.description}</p>
              
              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{catalog.view_count || 0} visualizações</span>
                <span>{catalog.share_count || 0} compartilhamentos</span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <LucideIcons.Eye size={16} />
                  </button>
                  {!isAdmin && (
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <LucideIcons.Edit size={16} />
                    </button>
                  )}
                  {!isAdmin && (
                    <button
                      onClick={() => handleDelete(catalog._id, catalog.name)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LucideIcons.Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyShareLink(catalog.share_link, catalog._id)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {copiedLink === catalog._id ? <LucideIcons.Check size={16} /> : <LucideIcons.Copy size={16} />}
                  </button>
                  <button
                    onClick={() => shareOnWhatsApp(catalog)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <LucideIcons.MessageCircleDashed size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCatalogs.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📚</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum catálogo encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? 'Não há catálogos no sistema ainda.' : 'Comece criando seu primeiro catálogo digital.'}
          </p>
          {!isAdmin && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <LucideIcons.Plus className="mr-2 h-4 w-4" />
                Criar Catálogo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Catalog Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Novo Catálogo</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreateCatalog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Catálogo *
                  </label>
                  <input
                    type="text"
                    value={newCatalog.name}
                    onChange={(e) => setNewCatalog(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Coleção Verão 2025"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={newCatalog.description}
                    onChange={(e) => setNewCatalog(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva seu catálogo..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem do WhatsApp
                  </label>
                  <textarea
                    value={newCatalog.whatsapp_message}
                    onChange={(e) => setNewCatalog(prev => ({ ...prev, whatsapp_message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Mensagem que será enviada junto com o catálogo"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Catálogo'}
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

export default CatalogsPage
