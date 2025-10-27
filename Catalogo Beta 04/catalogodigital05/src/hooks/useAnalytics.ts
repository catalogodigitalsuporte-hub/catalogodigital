
import { useState, useEffect } from 'react'

interface Analytics {
  totalSales: number
  totalOrders: number
  conversionRate: number
  averageOrderValue: number
  topProducts: Array<{
    id: string
    name: string
    sales: number
  }>
  salesByMonth: Array<{
    month: string
    sales: number
  }>
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Retornando dados vazios para garantir a renderização
        const emptyAnalytics: Analytics = {
          totalSales: 0,
          totalOrders: 0,
          conversionRate: 0,
          averageOrderValue: 0,
          topProducts: [],
          salesByMonth: []
        }
        
        setAnalytics(emptyAnalytics)
      } catch (error: any) {
        console.error('Failed to fetch analytics:', error)
        setError('Falha ao carregar analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return {
    analytics,
    loading,
    error
  }
}
