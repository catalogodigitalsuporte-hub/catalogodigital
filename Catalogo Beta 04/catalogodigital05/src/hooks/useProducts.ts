
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

  // Removido o fetchProducts original que chamava a API Lumi

  useEffect(() => {
    // Simulação de dados vazios para garantir que o Dashboard renderize
    setLoading(true)
    setTimeout(() => {
      setProducts([])
      setError(null)
      setLoading(false)
    }, 500) // Simula um pequeno delay de carregamento
  }, [])

  return {
    products,
    loading,
    error,
    // fetchProducts // Removido da exportação
  }
}
