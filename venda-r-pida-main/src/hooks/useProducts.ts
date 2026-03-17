import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductCategory } from '@/types';
import { toast } from 'sonner';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category as ProductCategory,
        standardMeterage: Number(p.standard_meterage),
        basePrice: Number(p.base_price),
        pricePerSquareMeter: p.price_per_square_meter,
        createdAt: new Date(p.created_at),
      }));

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          category: productData.category,
          standard_meterage: productData.standardMeterage,
          base_price: productData.basePrice,
          price_per_square_meter: productData.pricePerSquareMeter,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        name: data.name,
        category: data.category as ProductCategory,
        standardMeterage: Number(data.standard_meterage),
        basePrice: Number(data.base_price),
        pricePerSquareMeter: data.price_per_square_meter,
        createdAt: new Date(data.created_at),
      };

      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error('Erro ao adicionar produto');
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          category: productData.category,
          standard_meterage: productData.standardMeterage,
          base_price: productData.basePrice,
          price_per_square_meter: productData.pricePerSquareMeter,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct: Product = {
        id: data.id,
        name: data.name,
        category: data.category as ProductCategory,
        standardMeterage: Number(data.standard_meterage),
        basePrice: Number(data.base_price),
        pricePerSquareMeter: data.price_per_square_meter,
        createdAt: new Date(data.created_at),
      };

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error('Erro ao atualizar produto');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
      throw error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
