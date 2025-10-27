
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
        // Simulando dados de analytics por enquanto
        const mockAnalytics: Analytics = {
          totalSales: 45000,
          totalOrders: 128,
          conversionRate: 12.5,
          averageOrderValue: 351.56,
          topProducts: [
            { id: '1', name: 'Produto A', sales: 15000 },
            { id: '2', name: 'Produto B', sales: 12000 },
            { id: '3', name: 'Produto C', sales: 8000 }
          ],
          salesByMonth: [
            { month: 'Jan', sales: 5000 },
            { month: 'Fev', sales: 7000 },
            { month: 'Mar', sales: 8500 },
            { month: 'Abr', sales: 12000 },
            { month: 'Mai', sales: 15000 }
          ]
        }
        
        setAnalytics(mockAnalytics)
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
