
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface Catalog {
  _id: string
  catalog_id: string
  reseller_id: string
  name: string
  description: string
  template_id: string
  status: 'draft' | 'published' | 'archived'
  cover_image: string
  brand_colors: {
    primary: string
    secondary: string
    accent: string
  }
  whatsapp_message: string
  share_link: string
  qr_code: string
  view_count: number
  share_count: number
  created_at: string
  updated_at: string
}

export const useCatalogs = (resellerId?: string) => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCatalogs = useCallback(async () => {
    setLoading(true)
    try {
      const filter = resellerId ? { reseller_id: resellerId } : {}
      const response = await lumi.entities.catalogs.list({
        filter,
        sort: { updated_at: -1 }
      })
      setCatalogs(response.list || [])
    } catch (error: any) {
      console.error('Failed to fetch catalogs:', error)
      toast.error('Failed to load catalogs')
    } finally {
      setLoading(false)
    }
  }, [resellerId])

  const createCatalog = async (catalogData: Omit<Catalog, '_id' | 'catalog_id' | 'share_link' | 'qr_code' | 'view_count' | 'share_count' | 'created_at' | 'updated_at'>) => {
    try {
      const newCatalogId = `CAT-${Date.now()}`
      const shareLink = `${window.location.origin}/catalogo/${newCatalogId}`
      
      const newCatalog = await lumi.entities.catalogs.create({
        ...catalogData,
        catalog_id: newCatalogId,
        share_link: shareLink,
        qr_code: '',
        view_count: 0,
        share_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      setCatalogs(prev => [newCatalog, ...prev])
      toast.success('Catalog created successfully')
      return newCatalog
    } catch (error: any) {
      console.error('Failed to create catalog:', error)
      toast.error('Failed to create catalog')
      throw error
    }
  }

  const updateCatalog = async (catalogId: string, updates: Partial<Catalog>) => {
    try {
      const updatedCatalog = await lumi.entities.catalogs.update(catalogId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      setCatalogs(prev => prev.map(c => c._id === catalogId ? updatedCatalog : c))
      toast.success('Catalog updated successfully')
      return updatedCatalog
    } catch (error: any) {
      console.error('Failed to update catalog:', error)
      toast.error('Failed to update catalog')
      throw error
    }
  }

  const deleteCatalog = async (catalogId: string) => {
    try {
      await lumi.entities.catalogs.delete(catalogId)
      setCatalogs(prev => prev.filter(c => c._id !== catalogId))
      toast.success('Catalog deleted successfully')
    } catch (error: any) {
      console.error('Failed to delete catalog:', error)
      toast.error('Failed to delete catalog')
      throw error
    }
  }

  const publishCatalog = async (catalogId: string) => {
    try {
      await updateCatalog(catalogId, { status: 'published' })
      toast.success('Catalog published successfully')
    } catch (error) {
      toast.error('Failed to publish catalog')
    }
  }

  const generateQRCode = async (catalogId: string, shareLink: string) => {
    try {
      // In a real implementation, you would generate the QR code here
      const qrCodeData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQR...`
      await updateCatalog(catalogId, { qr_code: qrCodeData })
      toast.success('QR code generated successfully')
      return qrCodeData
    } catch (error) {
      toast.error('Failed to generate QR code')
      throw error
    }
  }

  useEffect(() => {
    fetchCatalogs()
  }, [fetchCatalogs])

  return {
    catalogs,
    loading,
    fetchCatalogs,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    publishCatalog,
    generateQRCode
  }
}
