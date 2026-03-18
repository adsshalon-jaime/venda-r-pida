import { useState } from 'react';
import { Plus, FileText, Calendar, User, Eye, Trash2, Search, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Layout } from '@/components/Layout';
import { RentalContractModal } from '@/components/RentalContractModal';
import { RentalContractDocument } from '@/components/RentalContractDocument';
import { useCustomers } from '@/hooks/useCustomers';
import { useRentalContracts } from '@/hooks/useRentalContracts';
import { useSettings } from '@/hooks/useSettings';
import { RentalContract } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/lib/utils';

export default function Contracts() {
  const { customers, loading: customersLoading } = useCustomers();
  const { contracts, loading: contractsLoading, deleteContract } = useRentalContracts();
  const { settings } = useSettings();
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingContract, setViewingContract] = useState<RentalContract | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleView = (contract: RentalContract) => {
    setViewingContract(contract);
    setViewModalOpen(true);
  };

  const handleDelete = async (contractId: string) => {
    await deleteContract(contractId);
  };

  const getPeriodLabel = (period: string, duration: number) => {
    const label = period === 'day' ? 'Diária' : period === 'week' ? 'Semanal' : 'Mensal';
    const unit = period === 'day' ? (duration > 1 ? 'dias' : 'dia') : period === 'week' ? (duration > 1 ? 'semanas' : 'semana') : (duration > 1 ? 'meses' : 'mês');
    return `${label} (${duration} ${unit})`;
  };

  if (customersLoading || contractsLoading) {
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
            <h1 className="text-3xl font-bold">Contratos de Locação</h1>
            <p className="text-muted-foreground mt-1">
              Gere contratos profissionais de locação de tendas
            </p>
          </div>
          <Button onClick={() => setContractModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        {/* Barra de Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número do contrato ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {filteredContracts.length} {filteredContracts.length === 1 ? 'contrato' : 'contratos'} encontrado{filteredContracts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tabela de Contratos */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl font-semibold mb-2">Nenhum contrato encontrado</p>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro contrato de locação'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setContractModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Contrato
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nº Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Término</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract, index) => (
                  <TableRow
                    key={contract.id}
                    className="animate-fade-in group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono font-semibold">
                      {contract.contractNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contract.customerName}</p>
                        {contract.customerPhone && (
                          <p className="text-xs text-muted-foreground">{contract.customerPhone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {getPeriodLabel(contract.rentalPeriod, contract.rentalDuration)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(contract.startDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(contract.endDate, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-lg text-primary">
                        {formatCurrency(contract.totalValue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(contract)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir contrato?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O contrato "{contract.contractNumber}" será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(contract.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Cards informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Contratos Profissionais</h3>
                <p className="text-sm text-slate-600">Documentos completos e legais</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Períodos Flexíveis</h3>
                <p className="text-sm text-slate-600">Diária, semanal ou mensal</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Dados Completos</h3>
                <p className="text-sm text-slate-600">Cliente e empresa detalhados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações sobre o contrato */}
        <div className="bg-white rounded-xl border p-8">
          <h2 className="text-xl font-bold mb-4">Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-primary mb-2">📋 Informações Incluídas</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Dados completos da empresa (CNPJ, endereço, telefone)</li>
                <li>✓ Dados completos do cliente (CPF/CNPJ, endereço, telefone)</li>
                <li>✓ Itens locados com quantidades e valores</li>
                <li>✓ Período de locação (diária, semanal ou mensal)</li>
                <li>✓ Valores de frete e montagem</li>
                <li>✓ Forma de pagamento (PIX, Cartão, Dinheiro)</li>
                <li>✓ Cláusulas contratuais completas</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">🎯 Recursos</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ Geração automática de número de contrato</li>
                <li>✓ Cálculo automático de datas de início e término</li>
                <li>✓ Layout profissional e moderno</li>
                <li>✓ Pronto para impressão em PDF</li>
                <li>✓ Chave PIX incluída quando aplicável</li>
                <li>✓ Assinaturas de locador e locatário</li>
                <li>✓ Válido legalmente</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-slate-700">
              <strong>💡 Dica:</strong> Certifique-se de que os dados do cliente estão completos no
              cadastro antes de gerar o contrato. Isso garante que todas as informações necessárias
              estarão presentes no documento.
            </p>
          </div>
        </div>

        <RentalContractModal
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
          customers={customers}
        />

        {/* Modal de Visualização */}
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto print:max-w-full print:max-h-full print:overflow-visible">
            <DialogHeader className="print:hidden">
              <DialogTitle className="flex items-center justify-between text-2xl">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Visualizar Contrato
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </DialogTitle>
            </DialogHeader>
            {viewingContract && settings && (
              <RentalContractDocument
                contract={{
                  contractNumber: viewingContract.contractNumber,
                  contractDate: viewingContract.contractDate,
                  companyData: {
                    name: settings.company_name || 'Coberturas Shalon',
                    cnpj: settings.cnpj || 'Não informado',
                    address: 'Palmas - TO',
                    phone: settings.phone || 'Não informado',
                    email: 'contato@coberturasshalon.com.br',
                  },
                  customerName: viewingContract.customerName,
                  customerDocument: viewingContract.customerDocument || 'Não informado',
                  customerAddress: viewingContract.customerAddress || 'Não informado',
                  customerCity: viewingContract.customerCity || 'Não informado',
                  customerState: viewingContract.customerState || 'Não informado',
                  customerPhone: viewingContract.customerPhone || 'Não informado',
                  customerReference: viewingContract.customerReference,
                  items: viewingContract.items,
                  rentalPeriod: viewingContract.rentalPeriod,
                  rentalDuration: viewingContract.rentalDuration,
                  startDate: viewingContract.startDate,
                  endDate: viewingContract.endDate,
                  subtotal: viewingContract.subtotal,
                  shippingFee: viewingContract.shippingFee,
                  assemblyFee: viewingContract.assemblyFee,
                  totalValue: viewingContract.totalValue,
                  paymentMethod: viewingContract.paymentMethod,
                  pixKey: viewingContract.pixKey,
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
