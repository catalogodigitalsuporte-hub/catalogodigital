
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'

interface Product {
  _id: string
  name: string
  description?: string
  price: number
  image_url?: string
  category?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await lumi.entities.products.list({
        sort: { created_at: -1 }
      })
      
      const productsList = Array.isArray(response?.list) ? response.list : []
      setProducts(productsList)
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      setError('Falha ao carregar produtos')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    fetchProducts
  }
}
