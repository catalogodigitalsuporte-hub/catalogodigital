import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

// Definição de tipo simplificada para o usuário, baseada no Lumi
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  // Adicionando um campo de role para manter a compatibilidade com o código existente
  userRole: 'USER' | 'ADMIN'; 
}

// O provedor do Google é o único que vamos suportar por enquanto
const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    // onAuthStateChanged é o listener do Firebase para mudanças de estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Mapear o usuário do Firebase para o formato User esperado
        const mappedUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          // Por padrão, todos são USER. A lógica de ADMIN deve ser adicionada no Firestore
          userRole: 'USER', 
        };
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      // Abre o pop-up de login com o Google
      await signInWithPopup(auth, googleProvider);
      // O listener onAuthStateChanged cuidará de atualizar o estado
    } catch (error: any) {
      console.error('Sign in failed:', error);
      // O Firebase retorna um código de erro que pode ser tratado
      toast.error(error.message || 'Falha ao fazer login com o Google.');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out failed:', error);
      toast.error('Falha ao sair.');
      throw error;
    }
  };

  // 🚀 FUNÇÃO PARA ALTERAR USUÁRIO PARA ADMIN (Lógica de Mock para compatibilidade)
  const promoteToAdmin = async () => {
    toast.error('A promoção para ADMIN requer lógica de backend no Firestore. Funcionalidade desativada temporariamente.');
    // A lógica real envolveria:
    // 1. Chamar uma Cloud Function do Firebase
    // 2. A Cloud Function atualizaria o campo 'userRole' no Firestore
    // 3. O listener onAuthStateChanged seria reativado
  };

  return {
    user,
    isAuthenticated,
    loading,
    signIn,
    signOut,
    promoteToAdmin,
  };
}

