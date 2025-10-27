import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';

interface ResellerCatalog {
  id: string; // Usando 'id' para Firestore
  catalog_id: string;
  reseller_id: string;
  name: string;
  description: string;
  category: string;
  whatsapp: string;
  message_template: string;
  status: 'active' | 'inactive' | 'draft';
  cover_image?: string;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export const useResellerCatalogs = (resellerId: string) => {
  const [catalogs, setCatalogs] = useState<ResellerCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalogs = useCallback(async () => {
    if (!resellerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const q = query(
        collection(db, 'reseller_catalogs'),
        where('reseller_id', '==', resellerId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const catalogsList: ResellerCatalog[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<ResellerCatalog, 'id'>
      }));
      
      setCatalogs(catalogsList);
    } catch (error: any) {
      console.error('Failed to fetch catalogs:', error);
      setError('Falha ao carregar catálogos');
      setCatalogs([]);
      toast.error('Falha ao carregar catálogos');
    } finally {
      setLoading(false);
    }
  }, [resellerId]);

  // A função createCatalog não precisa mais de Omit, já que 'id' será gerado pelo Firestore
  const createCatalog = async (catalogData: Omit<ResellerCatalog, 'id' | 'catalog_id' | 'view_count' | 'share_count' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      // Gerar um ID de catálogo customizado se necessário, mas o Firestore cuidará do ID do documento
      const catalogId = `CAT-${resellerId}-${Date.now()}`;
      const now = new Date().toISOString();
      
      const newCatalogData = {
        ...catalogData,
        catalog_id: catalogId,
        reseller_id: resellerId, // Garantir que o resellerId está no objeto
        view_count: 0,
        share_count: 0,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'reseller_catalogs'), newCatalogData);
      
      const newCatalog: ResellerCatalog = {
        id: docRef.id,
        ...newCatalogData
      };
      
      setCatalogs(prev => [newCatalog, ...prev]);
      toast.success('Catálogo criado com sucesso!');
      return newCatalog;
    } catch (error: any) {
      console.error('Failed to create catalog:', error);
      const errorMessage = error?.message || 'Falha ao criar catálogo';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateCatalog = async (catalogId: string, updates: Partial<ResellerCatalog>) => {
    try {
      setError(null);
      const catalogRef = doc(db, 'reseller_catalogs', catalogId);
      
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      await updateDoc(catalogRef, updatesWithTimestamp);
      
      // Atualizar o estado local
      setCatalogs(prev => prev.map(c => c.id === catalogId ? { ...c, ...updatesWithTimestamp } as ResellerCatalog : c));
      
      toast.success('Catálogo atualizado com sucesso!');
      // Retornar o catálogo atualizado (simulado para manter a interface)
      const updatedCatalog = catalogs.find(c => c.id === catalogId) || {} as ResellerCatalog;
      return { ...updatedCatalog, ...updatesWithTimestamp } as ResellerCatalog;

    } catch (error: any) {
      console.error('Failed to update catalog:', error);
      const errorMessage = error?.message || 'Falha ao atualizar catálogo';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteCatalog = async (catalogId: string) => {
    try {
      setError(null);
      const catalogRef = doc(db, 'reseller_catalogs', catalogId);
      await deleteDoc(catalogRef);
      
      setCatalogs(prev => prev.filter(c => c.id !== catalogId));
      toast.success('Catálogo excluído com sucesso!');
    } catch (error: any) {
      console.error('Failed to delete catalog:', error);
      const errorMessage = error?.message || 'Falha ao excluir catálogo';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const incrementViewCount = async (catalogId: string) => {
    try {
      const catalog = catalogs.find(c => c.id === catalogId);
      if (catalog) {
        // Usar o campo do Firestore para a referência
        const catalogRef = doc(db, 'reseller_catalogs', catalogId);
        
        // Usar FieldValue.increment se estivéssemos usando transactions ou update
        // Mas para simplificar, vamos apenas atualizar o valor no Firestore
        const newViewCount = catalog.view_count + 1;
        await updateDoc(catalogRef, { 
          view_count: newViewCount,
          updated_at: new Date().toISOString()
        });

        // Atualizar o estado local
        setCatalogs(prev => prev.map(c => c.id === catalogId ? { ...c, view_count: newViewCount } : c));
      }
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const incrementShareCount = async (catalogId: string) => {
    try {
      const catalog = catalogs.find(c => c.id === catalogId);
      if (catalog) {
        const catalogRef = doc(db, 'reseller_catalogs', catalogId);
        
        const newShareCount = catalog.share_count + 1;
        await updateDoc(catalogRef, { 
          share_count: newShareCount,
          updated_at: new Date().toISOString()
        });

        // Atualizar o estado local
        setCatalogs(prev => prev.map(c => c.id === catalogId ? { ...c, share_count: newShareCount } : c));
      }
    } catch (error) {
      console.error('Failed to increment share count:', error);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  return {
    catalogs,
    loading,
    error,
    fetchCatalogs,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    incrementViewCount,
    incrementShareCount
  };
};
