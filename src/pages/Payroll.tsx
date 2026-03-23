import { useState } from 'react';
import { Plus, Search, FileText, Users, Calendar, DollarSign, Eye, Trash2, Download, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/Layout';
import { useEmployees } from '@/hooks/useEmployees';
import { usePayroll } from '@/hooks/usePayroll';
import { useSalaryAdvances } from '@/hooks/useSalaryAdvances';
import { Employee, Payroll } from '@/types';
import { PayrollModal } from '@/components/PayrollModal';
import { PayrollSlip } from '@/components/PayrollSlip';
import { SalaryAdvanceModal } from '@/components/SalaryAdvanceModal';
import { SalaryAdvanceSlip } from '@/components/SalaryAdvanceSlip';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
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

export default function PayrollPage() {
  const { employees } = useEmployees();
  const { payrolls, loading, generatePayroll, deletePayroll, updatePayroll } = usePayroll();
  const { advances, loading: advancesLoading, generateAdvance, deleteAdvance } = useSalaryAdvances();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewingPayroll, setViewingPayroll] = useState<Payroll | null>(null);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  
  // Estados para adiantamentos
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [selectedEmployeeForAdvance, setSelectedEmployeeForAdvance] = useState<Employee | null>(null);
  const [viewingAdvance, setViewingAdvance] = useState<any>(null);

  const filteredPayrolls = payrolls.filter((payroll) =>
    payroll.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payroll.employee.cpf?.includes(searchQuery) ||
    payroll.referenceMonth.includes(searchQuery) ||
    payroll.referenceYear.toString().includes(searchQuery)
  );

  // Combinar holerites e adiantamentos para exibição na aba Holerites
  const allReceipts = [
    ...filteredPayrolls.map(p => ({ ...p, type: 'payroll' as const })),
    ...advances.map(a => ({ ...a, type: 'advance' as const }))
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.paymentDate);
    const dateB = new Date(b.createdAt || b.paymentDate);
    return dateB.getTime() - dateA.getTime();
  });

  const handleGeneratePayroll = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleSavePayroll = async (payrollData: any) => {
    try {
      if (editingPayroll) {
        // Modo edição
        await updatePayroll(editingPayroll.id, editingPayroll.employee, payrollData);
        toast.success('Holerite atualizado com sucesso!');
        setEditingPayroll(null);
      } else {
        // Modo criação
        if (!selectedEmployee) return;
        await generatePayroll(selectedEmployee, payrollData);
        toast.success('Holerite gerado com sucesso!');
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.error('Error saving payroll:', error);
      toast.error(editingPayroll ? 'Erro ao atualizar holerite' : 'Erro ao gerar holerite');
    }
  };

  const handleEditPayroll = (payroll: Payroll) => {
    setEditingPayroll(payroll);
    setSelectedEmployee(payroll.employee);
    setModalOpen(true);
  };

  const handleDeletePayroll = async (payrollId: string) => {
    try {
      await deletePayroll(payrollId);
      toast.success('Holerite excluído');
    } catch (error) {
      console.error('Error deleting payroll:', error);
      toast.error('Erro ao excluir holerite');
    }
  };

  // Funções para adiantamentos
  const handleGenerateAdvance = (employee: Employee) => {
    setSelectedEmployeeForAdvance(employee);
    setAdvanceModalOpen(true);
  };

  const handleSaveAdvance = async (advanceData: any) => {
    try {
      if (!selectedEmployeeForAdvance) return;
      
      // Salvar no banco de dados usando o hook
      await generateAdvance(selectedEmployeeForAdvance, advanceData);
      
      toast.success('Recibo de adiantamento gerado e salvo com sucesso!');
      setAdvanceModalOpen(false);
      setSelectedEmployeeForAdvance(null);
    } catch (error) {
      console.error('Error generating advance:', error);
      toast.error('Erro ao gerar recibo de adiantamento');
    }
  };

  const handleDeleteAdvance = async (advanceId: string) => {
    try {
      await deleteAdvance(advanceId);
      toast.success('Recibo de adiantamento excluído');
    } catch (error) {
      console.error('Error deleting advance:', error);
      toast.error('Erro ao excluir recibo');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMonthName = (month: string) => {
    const months: { [key: string]: string } = {
      '01': 'Janeiro',
      '02': 'Fevereiro',
      '03': 'Março',
      '04': 'Abril',
      '05': 'Maio',
      '06': 'Junho',
      '07': 'Julho',
      '08': 'Agosto',
      '09': 'Setembro',
      '10': 'Outubro',
      '11': 'Novembro',
      '12': 'Dezembro',
    };
    return months[month] || month;
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Holerites e Adiantamentos
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os recibos de pagamento e adiantamentos salariais
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="holerites" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="holerites" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Holerites
            </TabsTrigger>
            <TabsTrigger value="adiantamentos" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Adiantamentos
            </TabsTrigger>
          </TabsList>

          {/* ABA DE HOLERITES */}
          <TabsContent value="holerites">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Holerites Gerados</h2>
              <Button 
                onClick={() => setModalOpen(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Holerite
              </Button>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total de Holerites</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{payrolls.length}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Funcionários</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{employees.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Pago</p>
                  <p className="text-xl font-bold text-purple-900 mt-1">
                    {formatCurrency(payrolls.reduce((sum, p) => sum + p.netSalary, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Mês Atual</p>
                  <p className="text-xl font-bold text-orange-900 mt-1">
                    {payrolls.filter(p => {
                      const now = new Date();
                      return p.referenceMonth === String(now.getMonth() + 1).padStart(2, '0') && 
                             p.referenceYear === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar holerite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {/* Employee Selection for New Payroll */}
        {modalOpen && !selectedEmployee && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Selecione um Funcionário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <Card 
                  key={employee.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                  onClick={() => handleGeneratePayroll(employee)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{employee.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(employee.salary)}</p>
                        <p className="text-xs text-gray-500">{employee.cpf}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Payroll and Advances List */}
        {allReceipts.length === 0 && !modalOpen ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Nenhum recibo encontrado' : 'Nenhum recibo gerado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Tente ajustar sua busca' : 'Comece gerando holerites ou adiantamentos'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setModalOpen(true)} variant="outline" className="h-11">
                <Plus className="mr-2 h-4 w-4" />
                Gerar Primeiro Holerite
              </Button>
            )}
          </div>
        ) : !modalOpen && (
          <div className="space-y-4">
            {allReceipts.map((receipt) => receipt.type === 'payroll' ? (
              <Card key={`payroll-${receipt.id}`} className="hover:shadow-md transition-shadow border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge className="bg-green-600">Holerite</Badge>
                        <h3 className="text-lg font-semibold">{receipt.employee.name}</h3>
                        <Badge variant="outline">
                          {getMonthName(receipt.referenceMonth)}/{receipt.referenceYear}
                        </Badge>
                        <Badge variant="secondary">
                          {new Date(receipt.paymentDate).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Salário Bruto: </span>
                          <span className="font-medium">{formatCurrency(receipt.grossSalary)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Deduções: </span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(receipt.deductions.total)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Adicionais: </span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(receipt.additions.total)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Salário Líquido: </span>
                          <span className="font-bold text-blue-600 text-lg">
                            {formatCurrency(receipt.netSalary)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingPayroll(receipt)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPayroll(receipt)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este holerite? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePayroll(receipt.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={`advance-${receipt.id}`} className="hover:shadow-md transition-shadow border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge className="bg-purple-600">Adiantamento</Badge>
                        <h3 className="text-lg font-semibold">{receipt.employee.name}</h3>
                        <Badge variant="outline">
                          {getMonthName(receipt.referenceMonth)}/{receipt.referenceYear}
                        </Badge>
                        <Badge variant="secondary">
                          {new Date(receipt.paymentDate).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Salário Base: </span>
                          <span className="font-medium">{formatCurrency(receipt.grossSalary)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Porcentagem: </span>
                          <span className="font-medium text-purple-600">{receipt.advancePercentage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor Adiantado: </span>
                          <span className="font-bold text-purple-600 text-lg">
                            {formatCurrency(receipt.advanceAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingAdvance(receipt)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este recibo de adiantamento? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteAdvance(receipt.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

          {/* ABA DE ADIANTAMENTOS */}
          <TabsContent value="adiantamentos">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recibos de Adiantamento</h2>
              <Button 
                onClick={() => setAdvanceModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Adiantamento
              </Button>
            </div>

            {/* Employee Selection for Advance */}
            {advanceModalOpen && !selectedEmployeeForAdvance && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Selecione um Funcionário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map((employee) => (
                    <Card 
                      key={employee.id}
                      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-purple-200"
                      onClick={() => handleGenerateAdvance(employee)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{employee.name}</h4>
                            <p className="text-sm text-gray-600">{formatCurrency(employee.salary)}</p>
                            <p className="text-xs text-purple-600">Máx. adiantamento: {formatCurrency(employee.salary * 0.4)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setAdvanceModalOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Advances List */}
            {advances.length === 0 && !advanceModalOpen ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="h-12 w-12 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum adiantamento gerado
                </h3>
                <p className="text-gray-500 mb-6">
                  Comece gerando o primeiro recibo de adiantamento
                </p>
                <Button onClick={() => setAdvanceModalOpen(true)} variant="outline" className="h-11">
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar Primeiro Adiantamento
                </Button>
              </div>
            ) : !advanceModalOpen && (
              <div className="space-y-4">
                {advances.map((advance) => (
                  <Card key={advance.id} className="hover:shadow-md transition-shadow border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold">{advance.employee.name}</h3>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                              {getMonthName(advance.referenceMonth)}/{advance.referenceYear}
                            </Badge>
                            {advance.usedInPayroll ? (
                              <Badge variant="secondary" className="bg-gray-100">
                                Já descontado
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-green-700">
                                Pendente
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Salário Bruto: </span>
                              <span className="font-medium">{formatCurrency(advance.grossSalary)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Percentual: </span>
                              <span className="font-medium text-purple-600">
                                {advance.advancePercentage.toFixed(2)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Valor Adiantado: </span>
                              <span className="font-bold text-purple-700 text-lg">
                                {formatCurrency(advance.advanceAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingAdvance(advance)}
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Visualizar
                          </Button>
                          
                          {!advance.usedInPayroll && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Excluir
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir recibo de adiantamento?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O recibo será removido permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteAdvance(advance.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals de Holerite */}
        {selectedEmployee && (
          <PayrollModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            employee={selectedEmployee}
            onSave={handleSavePayroll}
            editingPayroll={editingPayroll}
          />
        )}

        {viewingPayroll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen px-4">
              <div className="flex justify-end py-4">
                <Button
                  variant="outline"
                  onClick={() => setViewingPayroll(null)}
                >
                  ✕ Fechar
                </Button>
              </div>
              <PayrollSlip payroll={viewingPayroll} />
              <div className="mt-8 flex justify-center gap-4 pb-8">
                <Button
                  variant="outline"
                  onClick={() => setViewingPayroll(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modals de Adiantamento */}
        {selectedEmployeeForAdvance && (
          <SalaryAdvanceModal
            open={advanceModalOpen}
            onOpenChange={setAdvanceModalOpen}
            employee={selectedEmployeeForAdvance}
            onSave={handleSaveAdvance}
          />
        )}

        {viewingAdvance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen px-4">
              <div className="flex justify-end py-4">
                <Button
                  variant="outline"
                  onClick={() => setViewingAdvance(null)}
                >
                  ✕ Fechar
                </Button>
              </div>
              <SalaryAdvanceSlip advance={viewingAdvance} />
              <div className="mt-8 flex justify-center gap-4 pb-8">
                <Button
                  variant="outline"
                  onClick={() => setViewingAdvance(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
