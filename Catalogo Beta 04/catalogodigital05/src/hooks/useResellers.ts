
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface Reseller {
  _id: string
  reseller_id: string
  email: string
  business_name: string
  contact_name: string
  phone: string
  whatsapp_number: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  access_link: string
  commission_rate: number
  total_sales: number
  total_orders: number
  last_login?: string
  created_at: string
  updated_at: string
}

export const useResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Removido o fetchResellers original que chamava a API Lumi

  const createReseller = async (resellerData: Omit<Reseller, '_id' | 'total_sales' | 'total_orders' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      const newReseller = await lumi.entities.resellers.create({
        ...resellerData,
        total_sales: 0,
        total_orders: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      setResellers(prev => [newReseller, ...prev])
      toast.success('Revendedor criado com sucesso')
      return newReseller
    } catch (error: any) {
      console.error('Failed to create reseller:', error)
      const errorMessage = error?.message || 'Falha ao criar revendedor'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const updateReseller = async (resellerId: string, updates: Partial<Reseller>) => {
    try {
      setError(null)
      const updatedReseller = await lumi.entities.resellers.update(resellerId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      setResellers(prev => prev.map(r => r._id === resellerId ? updatedReseller : r))
      toast.success('Revendedor atualizado com sucesso')
      return updatedReseller
    } catch (error: any) {
      console.error('Failed to update reseller:', error)
      const errorMessage = error?.message || 'Falha ao atualizar revendedor'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const deleteReseller = async (resellerId: string) => {
    try {
      setError(null)
      await lumi.entities.resellers.delete(resellerId)
      setResellers(prev => prev.filter(r => r._id !== resellerId))
      toast.success('Revendedor excluído com sucesso')
    } catch (error: any) {
      console.error('Failed to delete reseller:', error)
      const errorMessage = error?.message || 'Falha ao excluir revendedor'
      setError(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const updateResellerStatus = async (resellerId: string, status: Reseller['status']) => {
    try {
      await updateReseller(resellerId, { status })
      toast.success(`Status do revendedor atualizado para ${status}`)
    } catch (error) {
      toast.error('Falha ao atualizar status')
    }
  }

  // Inicializar os dados quando o hook for montado
  useEffect(() => {
    // Simulação de dados vazios para garantir que o Dashboard renderize
    setLoading(true)
    setTimeout(() => {
      setResellers([])
      setError(null)
      setLoading(false)
    }, 500) // Simula um pequeno delay de carregamento
  }, [])

  return {
    resellers,
    loading,
    error,
    // fetchResellers, // Removido da exportação
    createReseller,
    updateReseller,
    deleteReseller,
    updateResellerStatus
  }
}
