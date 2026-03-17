import { Product } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrintableProductListProps {
  products: Product[];
}

export function PrintableProductList({ products }: PrintableProductListProps) {
  return (
    <div className="print-only hidden p-8 bg-white text-black">
      <div className="print-header">
        <h1 className="text-2xl font-bold mb-2">Sistema de Vendas</h1>
        <p className="text-gray-600">Catálogo de Produtos</p>
        <p className="text-sm text-gray-500 mt-2">
          Gerado em: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      <table className="print-table mt-6">
        <thead>
          <tr className="bg-gray-100">
            <th>Nome do Produto</th>
            <th>Categoria</th>
            <th className="text-right">Metragem</th>
            <th className="text-right">Preço</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="font-medium">{product.name}</td>
              <td>{product.category === 'lona' ? 'Lona' : 'Tenda'}</td>
              <td className="text-right">{product.standardMeterage} m²</td>
              <td className="text-right">
                R$ {product.basePrice.toFixed(2)}
                {product.pricePerSquareMeter ? '/m²' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
        <p>Tendas & Lonas - Qualidade e Confiança</p>
      </div>
    </div>
  );
}
