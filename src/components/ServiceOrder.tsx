import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';

interface ServiceOrderProps {
  sale: Sale;
}

export function ServiceOrder({ sale }: ServiceOrderProps) {
  const handlePrint = async () => {
    const element = document.getElementById('service-order');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`OS_${sale.rentalInfo?.serviceOrderNumber}_${sale.customerName}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg flex items-center gap-2"
        >
          🖨️ Imprimir Ordem de Serviço
        </button>
      </div>

      <div 
        id="service-order"
        className="bg-white p-8 max-w-4xl mx-auto border-2 border-blue-300 rounded-lg shadow-lg"
        style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Cabeçalho */}
        <div className="text-center mb-6 border-b-2 border-blue-600 pb-4">
          <h1 className="text-3xl font-bold text-blue-700">ORDEM DE SERVIÇO</h1>
          <div className="text-lg font-semibold text-gray-700 mt-2">
            Nº {sale.rentalInfo?.serviceOrderNumber || 'N/A'}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Data de Emissão: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h2 className="font-bold text-lg mb-3 text-blue-700 border-b border-blue-300 pb-2">
            DADOS DO CLIENTE
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Nome:</strong> {sale.customerName || 'Não informado'}
            </div>
            <div>
              <strong>Data da Venda:</strong> {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Endereço de Montagem */}
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <h2 className="font-bold text-lg mb-3 text-yellow-800">
            📍 ENDEREÇO DE MONTAGEM
          </h2>
          <div className="text-sm text-gray-800 font-semibold">
            {sale.rentalInfo?.installationAddress || 'Não informado'}
          </div>
        </div>

        {/* Detalhes do Produto */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3 text-blue-700 border-b border-blue-300 pb-2">
            PRODUTO/SERVIÇO
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tipo:</strong> {sale.productName}
              </div>
              <div>
                <strong>Categoria:</strong> {sale.category.toUpperCase()}
              </div>
              {sale.quantity && (
                <div>
                  <strong>Quantidade:</strong> {sale.quantity}
                </div>
              )}
              {sale.width && sale.length && (
                <div>
                  <strong>Dimensões:</strong> {sale.width}m x {sale.length}m
                </div>
              )}
              <div>
                <strong>Valor Total:</strong> <span className="text-lg font-bold text-green-600">{formatCurrency(sale.totalValue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Programação de Entrega e Remoção */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-3 text-blue-700 border-b border-blue-300 pb-2">
            PROGRAMAÇÃO
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Entrega */}
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
              <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                ✅ MONTAGEM/ENTREGA
              </h3>
              <div className="text-sm space-y-1">
                <div>
                  <strong>Data:</strong> {sale.rentalInfo?.deliveryDate ? new Date(sale.rentalInfo.deliveryDate).toLocaleDateString('pt-BR') : 'N/A'}
                </div>
                <div>
                  <strong>Horário:</strong> {sale.rentalInfo?.deliveryTime || 'Não informado'}
                </div>
              </div>
            </div>

            {/* Remoção */}
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                🔴 DESMONTAGEM/REMOÇÃO
              </h3>
              <div className="text-sm space-y-1">
                <div>
                  <strong>Data:</strong> {sale.rentalInfo?.removalDate ? new Date(sale.rentalInfo.removalDate).toLocaleDateString('pt-BR') : 'N/A'}
                </div>
                <div className="text-xs text-red-600 mt-2">
                  ⚠️ Atenção: Cumprir rigorosamente o prazo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="font-bold text-lg mb-3 text-gray-700">
            OBSERVAÇÕES
          </h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Verificar condições do local antes da montagem</p>
            <p>• Conferir todos os materiais e acessórios</p>
            <p>• Tirar fotos após a montagem</p>
            <p>• Solicitar assinatura do cliente no recebimento</p>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="mt-8 pt-6 border-t-2 border-blue-600">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-b-2 border-black mb-2 pb-12"></div>
              <div className="text-sm font-semibold">Responsável pela Montagem</div>
              <div className="text-xs text-gray-600 mt-1">Nome e Assinatura</div>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-black mb-2 pb-12"></div>
              <div className="text-sm font-semibold">Cliente</div>
              <div className="text-xs text-gray-600 mt-1">
                {sale.customerName || 'Nome e Assinatura'}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
          <div className="font-bold text-blue-600">
            OS Nº {sale.rentalInfo?.serviceOrderNumber} - {new Date().toLocaleDateString('pt-BR')}
          </div>
          <div className="mt-1 text-gray-500">
            Este documento é válido como comprovante de serviço
          </div>
        </div>
      </div>
    </div>
  );
}
