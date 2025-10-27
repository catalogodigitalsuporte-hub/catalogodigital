import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Product {
  id: string; // Usando 'id' para o ID do Firestore
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

const productsCollection = collection(db, 'products');

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para mapear um DocumentSnapshot do Firestore para o tipo Product
  const mapDocToProduct = (doc: any): Product => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at || new Date().toISOString(),
    updated_at: doc.data().updated_at || new Date().toISOString(),
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const q = query(productsCollection, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const productsList = querySnapshot.docs.map(mapDocToProduct) as Product[];
      setProducts(productsList);
    } catch (error: any) {
      console.error('Failed to fetch products from Firestore:', error);
      setError('Falha ao carregar produtos do Firestore');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    // Note: Funções de CRUD para produtos (create, update, delete) não foram implementadas aqui, 
    // mas seguiriam o mesmo padrão de useResellers.
  };
};
