
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(lumi.auth.isAuthenticated)
  const [user, setUser] = useState(lumi.auth.user)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = lumi.auth.onAuthChange(({ isAuthenticated, user }) => {
      setIsAuthenticated(isAuthenticated)
      setUser(user)
      setLoading(false)
    })

    setLoading(false)
    return unsubscribe
  }, [])

  const signIn = async () => {
    try {
      await lumi.auth.signIn()
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await lumi.auth.signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  // 🚀 FUNÇÃO PARA ALTERAR USUÁRIO PARA ADMIN

  const promoteToAdmin = async () => {
    try {
      // Simula alteração do role para ADMIN
      if (user) {
        const updatedUser = { ...user, userRole: 'ADMIN' }
        // Nota: Em produção, isso seria feito via API backend
        toast.success('Usuário promovido para ADMIN! Recarregue a página.')
        console.log('User promoted to ADMIN:', updatedUser)
        
        // Força atualização do estado local para demonstração
        setUser(updatedUser)
        
        // Instrução para recarregar
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to promote user:', error)
      toast.error('Falha ao promover usuário')
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    signIn,
    signOut,
    promoteToAdmin
  }
}
