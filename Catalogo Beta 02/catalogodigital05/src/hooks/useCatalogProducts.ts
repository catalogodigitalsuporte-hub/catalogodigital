
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface CatalogProduct {
  _id: string
  product_id: string
  catalog_id: string
  reseller_id: string
  name: string
  description: string
  price: number
  original_price?: number
  images: string[]
  category: string
  tags: string[]
  in_stock: boolean
  quantity: number
  sku?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  created_at: string
  updated_at: string
}

export const useCatalogProducts = (catalogId?: string, resellerId?: string) => {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      let filter: any = {}
      
      if (catalogId) {
        filter.catalog_id = catalogId
      }
      
      if (resellerId) {
        filter.reseller_id = resellerId
      }
      
      const response = await lumi.entities.catalog_products.list({
        filter,
        sort: { created_at: -1 }
      })
      
      const productsList = Array.isArray(response?.list) ? response.list : []
      setProducts(productsList)
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      setError('Falha ao carregar produtos')
      setProducts([])
      toast.error('Falha ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }, [catalogId, resellerId])

  const createProduct = async (productData: Omit<CatalogProduct, '_id' | 'product_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      
      const productId = `PROD-${productData.catalog_id}-${Date.now()}`
      const now = new Date().toISOString()
      
      const newProduct = await lumi.entities.catalog_products.create({
        ...productData,
        product_id: productId,
        created_at: now,
        updated_at: now
      })
      
      setProducts(prev => [newProduct, ...prev])
      toast.success('Produto adicionado com sucesso!')
      return newProduct
    } catch (error: any) {
      console.error('Failed to create product:', error)
      const errorMessage = error?.message || 'Falha ao criar produto'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const updateProduct = async (productId: string, updates: Partial<CatalogProduct>) => {
    try {
      setError(null)
      const updatedProduct = await lumi.entities.catalog_products.update(productId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      setProducts(prev => prev.map(p => p._id === productId ? updatedProduct : p))
      toast.success('Produto atualizado com sucesso!')
      return updatedProduct
    } catch (error: any) {
      console.error('Failed to update product:', error)
      const errorMessage = error?.message || 'Falha ao atualizar produto'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      setError(null)
      await lumi.entities.catalog_products.delete(productId)
      setProducts(prev => prev.filter(p => p._id !== productId))
      toast.success('Produto excluído com sucesso!')
    } catch (error: any) {
      console.error('Failed to delete product:', error)
      const errorMessage = error?.message || 'Falha ao excluir produto'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
