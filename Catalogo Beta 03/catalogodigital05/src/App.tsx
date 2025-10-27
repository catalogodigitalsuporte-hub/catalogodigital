
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import LoginPage from './components/LoginPage'
import Dashboard from './pages/Dashboard'
import Revendas from './pages/Revendas'
import ResellerPanel from './pages/ResellerPanel'
import ResellerLogin from './pages/ResellerLogin'
import CatalogView from './pages/CatalogView'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Rota para painel de revendedores */}
          <Route path="/revenda/:resellerId" element={<ResellerLogin />} />
          <Route path="/painel-revendedor" element={<ResellerPanel />} />
          <Route path="/catalogo/:catalogId" element={<CatalogView />} />
          
          {/* Rotas do painel mestre */}
          <Route path="/*" element={
            !user ? (
              <LoginPage />
            ) : (
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/revendas" element={<Revendas />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            )
          } />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App
