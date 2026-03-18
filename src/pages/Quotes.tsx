import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NewQuoteModal } from '@/components/NewQuoteModal';
import { EditQuoteModal } from '@/components/EditQuoteModal';
import { QuoteDocument } from '@/components/QuoteDocument';
import { RemovalTracker } from '@/components/RemovalTracker';
import { useQuotes } from '@/hooks/useQuotes';
import { useCustomers } from '@/hooks/useCustomers';
import { useSales } from '@/hooks/useSales';
import { Quote, Sale } from '@/types';
import { formatCurrency } from '@/utils/currency';
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Trash2,
  FileText,
  Clock,
  TrendingUp,
  Calendar,
  Edit,
  Ban,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Quotes() {
  const [newQuoteModalOpen, setNewQuoteModalOpen] = useState(false);
  const [editQuoteModalOpen, setEditQuoteModalOpen] = useState(false);
  const [viewQuoteModalOpen, setViewQuoteModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'converted'>('all');

  const { quotes, loading, addQuote, updateQuote, updateQuoteStatus, deleteQuote, getQuotesMetrics } = useQuotes();
  const { customers } = useCustomers();
  const { sales, addSale, markAsRemoved } = useSales();

  const metrics = getQuotesMetrics();

  const handleQuoteComplete = async (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'quoteNumber'>) => {
    await addQuote(quoteData);
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setViewQuoteModalOpen(true);
  };

  const handleApproveQuote = async (quoteId: string) => {
    await updateQuoteStatus(quoteId, 'approved');
  };

  const handleRejectQuote = async (quoteId: string) => {
    await updateQuoteStatus(quoteId, 'rejected');
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setEditQuoteModalOpen(true);
  };

  const handleQuoteUpdate = async (quoteId: string, updates: Partial<Quote>) => {
    await updateQuote(quoteId, updates);
  };

  const handleCancelQuote = async (quoteId: string) => {
    if (confirm('Tem certeza que deseja cancelar este orçamento?')) {
      await updateQuoteStatus(quoteId, 'rejected');
    }
  };

  const handleConvertToSale = async (quote: Quote) => {
    try {
      // Criar venda a partir do orçamento
      const saleData: Omit<Sale, 'id' | 'createdAt'> = {
        productId: '',
        productName: quote.items.map(item => item.description).join(', '),
        category: 'tenda',
        totalValue: quote.total,
        customerId: quote.customerId,
        customerName: quote.customerName,
        saleDate: new Date(),
        isRental: false,
        paymentInfo: {
          method: 'dinheiro',
        },
      };

      const newSale = await addSale(saleData);
      
      // Atualizar status do orçamento para convertido
      await updateQuoteStatus(quote.id, 'converted', newSale.id);
      
      toast.success('Orçamento convertido em venda com sucesso!');
    } catch (error) {
      console.error('Erro ao converter orçamento:', error);
      toast.error('Erro ao converter orçamento em venda');
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.')) {
      await deleteQuote(quoteId);
    }
  };

  const filteredQuotes = quotes.filter((quote) => {
    if (filterStatus === 'all') return true;
    return quote.status === filterStatus;
  });

  const getStatusBadge = (status: Quote['status']) => {
    const badges = {
      pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-300' },
      approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800 border-green-300' },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800 border-red-300' },
      converted: { label: 'Convertido', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    };
    return badges[status];
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              Orçamentos
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Gerencie e acompanhe seus orçamentos
            </p>
          </div>
          <Button onClick={() => setNewQuoteModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total</span>
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Orçamentos</h1>
            <p className="text-2xl font-bold text-slate-900">{metrics.totalQuotes}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-600 uppercase">Pendentes</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-900">{metrics.pendingCount}</p>
            <p className="text-xs text-amber-700 mt-1">{formatCurrency(metrics.totalPendingValue)}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-green-600 uppercase">Aprovados</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{metrics.approvedCount}</p>
            <p className="text-xs text-green-700 mt-1">{formatCurrency(metrics.totalApprovedValue)}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-600 uppercase">Convertidos</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{metrics.convertedCount}</p>
            <p className="text-xs text-blue-700 mt-1">{formatCurrency(metrics.totalConvertedValue)}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Todos ({quotes.length})
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            Pendentes ({metrics.pendingCount})
          </Button>
          <Button
            variant={filterStatus === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('approved')}
          >
            Aprovados ({metrics.approvedCount})
          </Button>
          <Button
            variant={filterStatus === 'converted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('converted')}
          >
            Convertidos ({metrics.convertedCount})
          </Button>
        </div>

        {/* Acompanhamento de Remoções */}
        <div className="mb-6">
          <RemovalTracker
            sales={sales}
            onMarkAsRemoved={markAsRemoved}
          />
        </div>

        {/* Lista de Orçamentos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando orçamentos...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mt-1">Gerencie seus orçamentos</p>
              <p className="text-xs text-slate-400 mt-1">
                Clique em "Novo Orçamento" para começar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-slate-700">Número</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-700">Cliente</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-700">Valor</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-700">Validade</th>
                    <th className="text-left p-4 text-xs font-semibold text-slate-700">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotes.map((quote) => {
                    const badge = getStatusBadge(quote.status);
                    const isExpired = new Date(quote.validUntil) < new Date();

                    return (
                      <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-sm font-semibold text-slate-900">
                            {quote.quoteNumber}
                          </div>
                          <div className="text-xs text-slate-500">
                            {quote.createdAt.toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-slate-900">
                            {quote.customerName}
                          </div>
                          {quote.customerPhone && (
                            <div className="text-xs text-slate-500">{quote.customerPhone}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-semibold text-slate-900">
                            {formatCurrency(quote.total)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {quote.items.length} {quote.items.length === 1 ? 'item' : 'itens'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : 'text-slate-700'}`}>
                            {quote.validUntil.toLocaleDateString('pt-BR')}
                          </div>
                          {isExpired && (
                            <div className="text-xs text-red-500">Expirado</div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewQuote(quote)}
                              className="h-8 w-8 p-0"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {(quote.status === 'pending' || quote.status === 'approved') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditQuote(quote)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}

                            {quote.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApproveQuote(quote.id)}
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Aprovar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelQuote(quote.id)}
                                  className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  title="Cancelar"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {quote.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConvertToSale(quote)}
                                className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                                title="Converter em Venda"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                <span className="text-xs font-semibold">Converter</span>
                              </Button>
                            )}

                            {quote.status !== 'converted' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteQuote(quote.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Novo Orçamento */}
      <NewQuoteModal
        open={newQuoteModalOpen}
        onOpenChange={setNewQuoteModalOpen}
        customers={customers}
        onQuoteComplete={handleQuoteComplete}
      />

      {/* Modal de Edição */}
      <EditQuoteModal
        open={editQuoteModalOpen}
        onOpenChange={setEditQuoteModalOpen}
        quote={selectedQuote}
        customers={customers}
        onQuoteUpdate={handleQuoteUpdate}
      />

      {/* Modal de Visualização */}
      <Dialog open={viewQuoteModalOpen} onOpenChange={setViewQuoteModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Visualizar Orçamento</DialogTitle>
          </DialogHeader>
          {selectedQuote && <QuoteDocument quote={selectedQuote} />}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
