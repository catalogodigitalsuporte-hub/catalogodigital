import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Definição de tipo Reseller (compatível com o formato Lumi original)
interface Reseller {
  id: string; // Usando 'id' para o ID do Firestore
  reseller_id: string;
  email: string;
  business_name: string;
  contact_name: string;
  phone: string;
  whatsapp_number: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  access_link: string;
  commission_rate: number;
  total_sales: number;
  total_orders: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Referência à coleção de revendedores no Firestore
const resellersCollection = collection(db, 'resellers');

export const useResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para mapear um DocumentSnapshot do Firestore para o tipo Reseller
  const mapDocToReseller = (doc: any): Reseller => ({
    id: doc.id,
    ...doc.data(),
    // Garantir que os campos de data sejam strings ISO
    created_at: doc.data().created_at || new Date().toISOString(),
    updated_at: doc.data().updated_at || new Date().toISOString(),
  });

  // 1. FETCH (LISTAR)
  const fetchResellers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Cria uma query para ordenar por created_at (decrescente)
      const q = query(resellersCollection, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const resellersList = querySnapshot.docs.map(mapDocToReseller) as Reseller[];
      setResellers(resellersList);
    } catch (error: any) {
      console.error('Failed to fetch resellers from Firestore:', error);
      setError('Falha ao carregar revendedores do Firestore');
      setResellers([]);
      toast.error('Falha ao carregar revendedores');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. CREATE (CRIAR)
  const createReseller = async (resellerData: Omit<Reseller, 'id' | 'total_sales' | 'total_orders' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      // Cria um ID único para o reseller_id (simulando a Lumi)
      const uniqueResellerId = `RES_${Date.now()}`; 

      const newResellerData = {
        ...resellerData,
        reseller_id: uniqueResellerId,
        total_sales: 0,
        total_orders: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(resellersCollection, newResellerData);
      
      // Cria o objeto Reseller completo com o ID do Firestore
      const newReseller: Reseller = {
        id: docRef.id,
        ...newResellerData,
      } as Reseller;

      setResellers(prev => [newReseller, ...prev]);
      toast.success('Revendedor criado com sucesso no Firestore');
      return newReseller;
    } catch (error: any) {
      console.error('Failed to create reseller in Firestore:', error);
      const errorMessage = error?.message || 'Falha ao criar revendedor';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  // 3. UPDATE (ATUALIZAR)
  const updateReseller = async (resellerId: string, updates: Partial<Reseller>) => {
    try {
      setError(null);
      const resellerDocRef = doc(db, 'resellers', resellerId);
      
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(resellerDocRef, updatedData);
      
      // Atualiza o estado local
      setResellers(prev => prev.map(r => r.id === resellerId ? { ...r, ...updatedData, id: resellerId } as Reseller : r));
      
      // Retorna a versão atualizada (opcionalmente, poderia buscar o doc novamente)
      const updatedResellerDoc = await getDoc(resellerDocRef);
      const updatedReseller = mapDocToReseller(updatedResellerDoc);

      toast.success('Revendedor atualizado com sucesso no Firestore');
      return updatedReseller;
    } catch (error: any) {
      console.error('Failed to update reseller in Firestore:', error);
      const errorMessage = error?.message || 'Falha ao atualizar revendedor';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  // 4. DELETE (EXCLUIR)
  const deleteReseller = async (resellerId: string) => {
    try {
      setError(null);
      const resellerDocRef = doc(db, 'resellers', resellerId);
      await deleteDoc(resellerDocRef);
      
      setResellers(prev => prev.filter(r => r.id !== resellerId));
      toast.success('Revendedor excluído com sucesso do Firestore');
    } catch (error: any) {
      console.error('Failed to delete reseller in Firestore:', error);
      const errorMessage = error?.message || 'Falha ao excluir revendedor';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  // 5. UPDATE STATUS (ATUALIZAR STATUS)
  const updateResellerStatus = async (resellerId: string, status: Reseller['status']) => {
    try {
      await updateReseller(resellerId, { status });
      toast.success(`Status do revendedor atualizado para ${status}`);
    } catch (error) {
      toast.error('Falha ao atualizar status');
    }
  };

  // Inicializar os dados quando o hook for montado
  useEffect(() => {
    fetchResellers();
  }, [fetchResellers]);

  return {
    resellers,
    loading,
    error,
    fetchResellers,
    createReseller,
    updateReseller,
    deleteReseller,
    updateResellerStatus,
  };
};
