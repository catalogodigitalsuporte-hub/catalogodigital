import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, QueryConstraint } from 'firebase/firestore';

interface CatalogProduct {
  id: string; // Usando 'id' para Firestore
  product_id: string;
  catalog_id: string;
  reseller_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category: string;
  tags: string[];
  in_stock: boolean;
  quantity: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  created_at: string;
  updated_at: string;
}

export const useCatalogProducts = (catalogId?: string, resellerId?: string) => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const constraints: QueryConstraint[] = [];
      
      if (catalogId) {
        constraints.push(where('catalog_id', '==', catalogId));
      }
      
      if (resellerId) {
        constraints.push(where('reseller_id', '==', resellerId));
      }
      
      constraints.push(orderBy('created_at', 'desc'));

      const q = query(
        collection(db, 'catalog_products'),
        ...constraints
      );
      
      const querySnapshot = await getDocs(q);
      const productsList: CatalogProduct[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<CatalogProduct, 'id'>
      }));
      
      setProducts(productsList);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      setError('Falha ao carregar produtos');
      setProducts([]);
      toast.error('Falha ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [catalogId, resellerId]);

  const createProduct = async (productData: Omit<CatalogProduct, 'id' | 'product_id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      
      const productId = `PROD-${productData.catalog_id}-${Date.now()}`;
      const now = new Date().toISOString();
      
      const newProductData = {
        ...productData,
        product_id: productId,
        created_at: now,
        updated_at: now
      };
      
      const docRef = await addDoc(collection(db, 'catalog_products'), newProductData);
      
      const newProduct: CatalogProduct = {
        id: docRef.id,
        ...newProductData
      } as CatalogProduct; // Type assertion para garantir a compatibilidade
      
      setProducts(prev => [newProduct, ...prev]);
      toast.success('Produto adicionado com sucesso!');
      return newProduct;
    } catch (error: any) {
      console.error('Failed to create product:', error);
      const errorMessage = error?.message || 'Falha ao criar produto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<CatalogProduct>) => {
    try {
      setError(null);
      const productRef = doc(db, 'catalog_products', productId);
      
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      await updateDoc(productRef, updatesWithTimestamp);
      
      // Atualizar o estado local
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updatesWithTimestamp } as CatalogProduct : p));
      
      toast.success('Produto atualizado com sucesso!');
      // Retornar o produto atualizado (simulado para manter a interface)
      const updatedProduct = products.find(p => p.id === productId) || {} as CatalogProduct;
      return { ...updatedProduct, ...updatesWithTimestamp } as CatalogProduct;

    } catch (error: any) {
      console.error('Failed to update product:', error);
      const errorMessage = error?.message || 'Falha ao atualizar produto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setError(null);
      const productRef = doc(db, 'catalog_products', productId);
      await deleteDoc(productRef);
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Produto excluído com sucesso!');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      const errorMessage = error?.message || 'Falha ao excluir produto';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};
