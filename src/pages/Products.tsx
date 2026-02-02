import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { ProductList } from '@/components/ProductList';
import { ProductModal } from '@/components/ProductModal';
import { ProductViewModal } from '@/components/ProductViewModal';
import { PrintableProductList } from '@/components/PrintableProductList';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';
import { toast } from 'sonner';

export default function Products() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const handleSave = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Produto atualizado!');
      } else {
        await addProduct(productData);
        toast.success('Produto cadastrado!');
      }
      setEditingProduct(null);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setViewModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success('Produto excluído');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleExport = () => {
    window.print();
  };

  const handleOpenModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seu catálogo de tendas e lonas
            </p>
          </div>
          <Button onClick={handleOpenModal}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onExport={handleExport}
        />

        <ProductModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          product={editingProduct}
          onSave={handleSave}
        />

        <ProductViewModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          product={viewingProduct}
        />

        <PrintableProductList products={products} />
      </div>
    </Layout>
  );
}
