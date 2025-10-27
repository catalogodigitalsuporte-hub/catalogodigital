
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface ResellerCatalog {
  _id: string
  catalog_id: string
  reseller_id: string
  name: string
  description: string
  category: string
  whatsapp: string
  message_template: string
  status: 'active' | 'inactive' | 'draft'
  cover_image?: string
  view_count: number
  share_count: number
  created_at: string
  updated_at: string
}

export const useResellerCatalogs = (resellerId: string) => {
  const [catalogs, setCatalogs] = useState<ResellerCatalog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCatalogs = useCallback(async () => {
    if (!resellerId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await lumi.entities.reseller_catalogs.list({
        filter: { reseller_id: resellerId },
        sort: { created_at: -1 }
      })
      
      const catalogsList = Array.isArray(response?.list) ? response.list : []
      setCatalogs(catalogsList)
    } catch (error: any) {
      console.error('Failed to fetch catalogs:', error)
      setError('Falha ao carregar catálogos')
      setCatalogs([])
      toast.error('Falha ao carregar catálogos')
    } finally {
      setLoading(false)
    }
  }, [resellerId])

  const createCatalog = async (catalogData: Omit<ResellerCatalog, '_id' | 'catalog_id' | 'view_count' | 'share_count' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const catalogId = `CAT-${resellerId}-${Date.now()}`
      const now = new Date().toISOString()
      
      const newCatalog = await lumi.entities.reseller_catalogs.create({
        ...catalogData,
        catalog_id: catalogId,
        view_count: 0,
        share_count: 0,
        created_at: now,
        updated_at: now
      })
      
      setCatalogs(prev => [newCatalog, ...prev])
      toast.success('Catálogo criado com sucesso!')
      return newCatalog
    } catch (error: any) {
      console.error('Failed to create catalog:', error)
      const errorMessage = error?.message || 'Falha ao criar catálogo'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const updateCatalog = async (catalogId: string, updates: Partial<ResellerCatalog>) => {
    try {
      setError(null)
      const updatedCatalog = await lumi.entities.reseller_catalogs.update(catalogId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      setCatalogs(prev => prev.map(c => c._id === catalogId ? updatedCatalog : c))
      toast.success('Catálogo atualizado com sucesso!')
      return updatedCatalog
    } catch (error: any) {
      console.error('Failed to update catalog:', error)
      const errorMessage = error?.message || 'Falha ao atualizar catálogo'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const deleteCatalog = async (catalogId: string) => {
    try {
      setError(null)
      await lumi.entities.reseller_catalogs.delete(catalogId)
      setCatalogs(prev => prev.filter(c => c._id !== catalogId))
      toast.success('Catálogo excluído com sucesso!')
    } catch (error: any) {
      console.error('Failed to delete catalog:', error)
      const errorMessage = error?.message || 'Falha ao excluir catálogo'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const incrementViewCount = async (catalogId: string) => {
    try {
      const catalog = catalogs.find(c => c._id === catalogId)
      if (catalog) {
        await updateCatalog(catalogId, { 
          view_count: catalog.view_count + 1 
        })
      }
    } catch (error) {
      console.error('Failed to increment view count:', error)
    }
  }

  const incrementShareCount = async (catalogId: string) => {
    try {
      const catalog = catalogs.find(c => c._id === catalogId)
      if (catalog) {
        await updateCatalog(catalogId, { 
          share_count: catalog.share_count + 1 
        })
      }
    } catch (error) {
      console.error('Failed to increment share count:', error)
    }
  }

  useEffect(() => {
    fetchCatalogs()
  }, [fetchCatalogs])

  return {
    catalogs,
    loading,
    error,
    fetchCatalogs,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    incrementViewCount,
    incrementShareCount
  }
}
