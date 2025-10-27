import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, QueryConstraint } from 'firebase/firestore';

interface Catalog {
  id: string; // Usando 'id' para Firestore
  catalog_id: string;
  reseller_id: string;
  name: string;
  description: string;
  template_id: string;
  status: 'draft' | 'published' | 'archived';
  cover_image: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  whatsapp_message: string;
  share_link: string;
  qr_code: string;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export const useCatalogs = (resellerId?: string) => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCatalogs = useCallback(async () => {
    setLoading(true);
    try {
      const constraints: QueryConstraint[] = [];
      
      if (resellerId) {
        constraints.push(where('reseller_id', '==', resellerId));
      }
      
      constraints.push(orderBy('updated_at', 'desc'));

      const q = query(
        collection(db, 'catalogs'),
        ...constraints
      );
      
      const querySnapshot = await getDocs(q);
      const catalogsList: Catalog[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Catalog, 'id'>
      }));
      
      setCatalogs(catalogsList);
    } catch (error: any) {
      console.error('Failed to fetch catalogs:', error);
      toast.error('Failed to load catalogs');
    } finally {
      setLoading(false);
    }
  }, [resellerId]);

  const createCatalog = async (catalogData: Omit<Catalog, 'id' | 'catalog_id' | 'share_link' | 'qr_code' | 'view_count' | 'share_count' | 'created_at' | 'updated_at'>) => {
    try {
      const newCatalogId = `CAT-${Date.now()}`;
      // O share_link deve ser gerado com base no ID do documento do Firestore, mas
      // para manter a lógica original, vamos usar o newCatalogId temporariamente.
      // O ID real do Firestore será usado para o docRef.
      const shareLinkTemplate = `${window.location.origin}/catalogo/${newCatalogId}`;
      const now = new Date().toISOString();
      
      const newCatalogData = {
        ...catalogData,
        catalog_id: newCatalogId,
        share_link: shareLinkTemplate, // Será atualizado após a criação
        qr_code: '',
        view_count: 0,
        share_count: 0,
        created_at: now,
        updated_at: now
      };

      const docRef = await addDoc(collection(db, 'catalogs'), newCatalogData);
      
      // Atualizar o share_link com o ID do Firestore
      const finalShareLink = `${window.location.origin}/catalogo/${docRef.id}`;
      await updateDoc(docRef, { share_link: finalShareLink });

      const newCatalog: Catalog = {
        id: docRef.id,
        ...newCatalogData,
        share_link: finalShareLink
      } as Catalog;
      
      setCatalogs(prev => [newCatalog, ...prev]);
      toast.success('Catalog created successfully');
      return newCatalog;
    } catch (error: any) {
      console.error('Failed to create catalog:', error);
      toast.error('Failed to create catalog');
      throw error;
    }
  };

  const updateCatalog = async (catalogId: string, updates: Partial<Catalog>) => {
    try {
      const catalogRef = doc(db, 'catalogs', catalogId);
      
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      await updateDoc(catalogRef, updatesWithTimestamp);
      
      // Atualizar o estado local
      setCatalogs(prev => prev.map(c => c.id === catalogId ? { ...c, ...updatesWithTimestamp } as Catalog : c));
      
      toast.success('Catalog updated successfully');
      // Retornar o catálogo atualizado (simulado para manter a interface)
      const updatedCatalog = catalogs.find(c => c.id === catalogId) || {} as Catalog;
      return { ...updatedCatalog, ...updatesWithTimestamp } as Catalog;

    } catch (error: any) {
      console.error('Failed to update catalog:', error);
      toast.error('Failed to update catalog');
      throw error;
    }
  };

  const deleteCatalog = async (catalogId: string) => {
    try {
      const catalogRef = doc(db, 'catalogs', catalogId);
      await deleteDoc(catalogRef);
      
      setCatalogs(prev => prev.filter(c => c.id !== catalogId));
      toast.success('Catalog deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete catalog:', error);
      toast.error('Failed to delete catalog');
      throw error;
    }
  };

  const publishCatalog = async (catalogId: string) => {
    try {
      await updateCatalog(catalogId, { status: 'published' });
      toast.success('Catalog published successfully');
    } catch (error) {
      toast.error('Failed to publish catalog');
    }
  };

  const generateQRCode = async (catalogId: string, shareLink: string) => {
    try {
      // Manter a simulação de QR Code, pois a geração real é um processo externo
      const qrCodeData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQR...`;
      await updateCatalog(catalogId, { qr_code: qrCodeData });
      toast.success('QR code generated successfully');
      return qrCodeData;
    } catch (error) {
      toast.error('Failed to generate QR code');
      throw error;
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  return {
    catalogs,
    loading,
    fetchCatalogs,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    publishCatalog,
    generateQRCode
  };
};
