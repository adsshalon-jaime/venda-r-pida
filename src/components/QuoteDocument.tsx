import { useRef } from 'react';
import { Quote } from '@/types';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Calendar, MapPin, Truck, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface QuoteDocumentProps {
  quote: Quote;
}

export function QuoteDocument({ quote }: QuoteDocumentProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!documentRef.current) return;

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Orcamento-${quote.quoteNumber}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const getStatusBadge = () => {
    const badges = {
      pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-300' },
      approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800 border-green-300' },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800 border-red-300' },
      converted: { label: 'Convertido', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    };
    return badges[quote.status];
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-4">
      {/* Botão de Impressão */}
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Documento */}
      <div
        ref={documentRef}
        className="bg-white p-8 sm:p-12 rounded-lg border border-slate-200 shadow-sm"
      >
        {/* Header com Logo e Dados da Empresa */}
        <div className="border-b-4 border-blue-900 pb-6 mb-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            {/* Logo da Empresa */}
            <div className="w-40 h-40 flex items-center justify-center bg-white rounded-lg border-2 border-slate-200 p-2">
              <img 
                src="/assets/images/logos/shalon-logo.png" 
                alt="Coberturas Shalon" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback: Logo SVG embutida se a imagem não carregar
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <svg viewBox="0 0 1024 600" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 50 100 Q 300 50 950 80" fill="none" stroke="#FFD700" stroke-width="40" stroke-linecap="round"/>
                        <path d="M 50 140 Q 300 90 950 120" fill="none" stroke="#FFFFFF" stroke-width="15" stroke-linecap="round"/>
                        <path d="M 50 170 Q 300 120 950 150" fill="none" stroke="#EF4444" stroke-width="40" stroke-linecap="round"/>
                        <path d="M 50 210 Q 300 160 950 190" fill="none" stroke="#FFFFFF" stroke-width="15" stroke-linecap="round"/>
                        <path d="M 50 240 Q 300 190 950 220" fill="none" stroke="#3B82F6" stroke-width="40" stroke-linecap="round"/>
                        <path d="M 50 280 Q 300 230 950 260" fill="none" stroke="#FFFFFF" stroke-width="15" stroke-linecap="round"/>
                        <path d="M 50 310 Q 300 260 950 290" fill="none" stroke="#4F46E5" stroke-width="40" stroke-linecap="round"/>
                        <text x="512" y="450" font-size="140" font-weight="bold" fill="#4F46E5" text-anchor="middle" font-family="Arial, sans-serif">SHALON</text>
                        <text x="512" y="550" font-size="60" fill="#4F46E5" text-anchor="middle" font-family="Arial, sans-serif">Tendas&Coberturas</text>
                      </svg>
                    `;
                  }
                }}
              />
            </div>

            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-lg border-2 ${statusBadge.color} font-semibold whitespace-nowrap`}>
              {statusBadge.label}
            </div>
          </div>

          {/* Dados da Empresa */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Razão Social:</span>{' '}
                <span className="text-slate-900">C R dos R Francisco LTDA</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">CNPJ:</span>{' '}
                <span className="text-slate-900">44.458.233/0001-08</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-slate-700">Endereço:</span>{' '}
                <span className="text-slate-900">Avenida Tocantins Com Av Ipanema, SN</span>
              </div>
            </div>
          </div>

          {/* Informações do Orçamento */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">ORÇAMENTO</h2>
              <p className="text-sm text-slate-600 font-mono">
                Nº {quote.quoteNumber}
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="mb-2">
                <span className="font-semibold text-slate-700">Emissão:</span>{' '}
                <span className="text-slate-900">{quote.createdAt.toLocaleDateString('pt-BR')}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Validade:</span>{' '}
                <span className="text-slate-900">{quote.validUntil.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dados do Cliente
          </h2>
          <div className="bg-slate-50 p-4 rounded-lg space-y-2">
            <div>
              <span className="font-semibold text-slate-700">Nome:</span>{' '}
              <span className="text-slate-900">{quote.customerName}</span>
            </div>
            {quote.customerEmail && (
              <div>
                <span className="font-semibold text-slate-700">E-mail:</span>{' '}
                <span className="text-slate-900">{quote.customerEmail}</span>
              </div>
            )}
            {quote.customerPhone && (
              <div>
                <span className="font-semibold text-slate-700">Telefone:</span>{' '}
                <span className="text-slate-900">{quote.customerPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Itens do Orçamento */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Discriminação dos Serviços</h2>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Descrição</th>
                  <th className="text-center p-3 text-sm font-semibold w-24">Qtd</th>
                  <th className="text-right p-3 text-sm font-semibold w-32">Valor Unit.</th>
                  <th className="text-right p-3 text-sm font-semibold w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quote.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-3 text-sm text-slate-900">{item.description}</td>
                    <td className="p-3 text-sm text-center text-slate-700">{item.quantity}</td>
                    <td className="p-3 text-sm text-right text-slate-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3 text-sm text-right font-semibold text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totais e Forma de Pagamento */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Totais */}
          <div className="bg-slate-50 p-6 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-700">Frete:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(quote.shippingCost)}
              </span>
            </div>
            <div className="border-t-2 border-slate-300 pt-3 flex justify-between">
              <span className="text-lg font-bold text-slate-900">TOTAL:</span>
              <span className="text-2xl font-bold text-emerald-600">
                {formatCurrency(quote.total)}
              </span>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">Forma de Pagamento</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">Método:</span>
                <span className="text-sm text-slate-900">
                  {quote.paymentInfo.method === 'pix' && 'PIX'}
                  {quote.paymentInfo.method === 'boleto' && 'Boleto Bancário'}
                  {quote.paymentInfo.method === 'transferencia' && 'Transferência Bancária'}
                  {quote.paymentInfo.method === 'cartao' && 'Cartão de Crédito'}
                </span>
              </div>
              {quote.paymentInfo.method === 'cartao' && quote.paymentInfo.installments && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">Parcelas:</span>
                  <span className="text-sm text-slate-900">
                    {quote.paymentInfo.installments}x de {formatCurrency(quote.total / quote.paymentInfo.installments)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações de Entrega */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Local de Entrega</h3>
            </div>
            <p className="text-sm text-blue-800">{quote.deliveryAddress}</p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-amber-900">Prazo de Entrega</h3>
            </div>
            <p className="text-sm text-amber-800">{quote.deliveryDeadline}</p>
          </div>
        </div>

        {/* Observações */}
        {quote.notes && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Observações</h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="border-t-2 border-slate-200 pt-6 mt-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600">
              Este orçamento tem validade até{' '}
              <span className="font-semibold text-slate-900">
                {quote.validUntil.toLocaleDateString('pt-BR')}
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Orçamento gerado em {quote.createdAt.toLocaleDateString('pt-BR')} às{' '}
              {quote.createdAt.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
