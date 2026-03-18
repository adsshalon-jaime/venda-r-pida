import { useState, useMemo } from 'react';
import { Plus, Search, Grid3x3, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/Layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'lona' | 'tenda' | 'ferragem'>('all');
  const [rentalFilter, setRentalFilter] = useState<'all' | 'rental' | 'sale'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesRental = rentalFilter === 'all' || 
        (rentalFilter === 'rental' && product.isRental) ||
        (rentalFilter === 'sale' && !product.isRental);
      return matchesSearch && matchesCategory && matchesRental;
    });
  }, [products, searchTerm, categoryFilter, rentalFilter]);

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
            <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
            <p className="text-sm text-slate-600 mt-1">Gerencie seu catálogo de produtos e lonas</p>
          </div>
          <Button onClick={handleOpenModal}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Categoria */}
            <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="lona">Lona</SelectItem>
                <SelectItem value="tenda">Tenda</SelectItem>
                <SelectItem value="ferragem">Ferragem</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de Tipo */}
            <Select value={rentalFilter} onValueChange={(value: any) => setRentalFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="sale">Venda</SelectItem>
                <SelectItem value="rental">Locação</SelectItem>
              </SelectContent>
            </Select>

            {/* Toggle de Visualização */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                title="Visualização em Grade"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                title="Visualização em Lista"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contador de Resultados */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            {(searchTerm || categoryFilter !== 'all' || rentalFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setRentalFilter('all');
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </div>

        <ProductList
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onExport={handleExport}
          viewMode={viewMode}
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
