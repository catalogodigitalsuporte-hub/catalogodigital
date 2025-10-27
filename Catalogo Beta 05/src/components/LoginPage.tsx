
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Crown, Sparkles, ArrowRight, Shield, Users, BarChart3, Package, Chrome } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                


              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Painel Mestre

                </h1>
                <p className="text-gray-600 text-lg">
                  Acesse seu painel de controle
                </p>
              </div>
            </div>

            {/* Login Button */}
            <div className="space-y-6">
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center space-x-3 group">

                <Chrome className="w-5 h-5" />
                <span className="text-lg">Entrar com Google</span>
              </button>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                O que você pode fazer:
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Catálogos</p>
                      <p className="text-xs text-blue-600">Digitais</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">Vendas</p>
                      <p className="text-xs text-purple-600">Relatórios</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50/80 backdrop-blur-sm rounded-xl p-4 border border-green-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Revendas</p>
                      <p className="text-xs text-green-600">Gestão</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-900">Analytics</p>
                      <p className="text-xs text-orange-600">Detalhados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Autenticação via Firebase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default LoginPage;