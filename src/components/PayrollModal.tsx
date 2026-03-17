import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/types';
import { getCurrentReferenceDate, formatCurrency } from '@/utils/payrollCalculations';
import { calculatePayroll } from '@/utils/payrollCalculations';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Receipt, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/hooks/useSettings';

const payrollSchema = z.object({
  month: z.string().min(2, 'Mês é obrigatório'),
  year: z.number().min(2020).max(2030, 'Ano inválido'),
  overtime: z.number().min(0, 'Valor deve ser positivo'),
  bonuses: z.number().min(0, 'Valor deve ser positivo'),
  vacation: z.number().min(0, 'Valor deve ser positivo'),
  thirteenth: z.number().min(0, 'Valor deve ser positivo'),
  otherAdditions: z.number().min(0, 'Valor deve ser positivo'),
  inss: z.number().min(0, 'Valor deve ser positivo'),
  fgts: z.number().min(0, 'Valor deve ser positivo'),
  irrf: z.number().min(0, 'Valor deve ser positivo'),
  mealVoucher: z.number().min(0, 'Valor deve ser positivo'),
  transportVoucher: z.number().min(0, 'Valor deve ser positivo'),
  salaryAdvance: z.number().min(0, 'Valor deve ser positivo'),
  otherDeductions: z.number().min(0, 'Valor deve ser positivo'),
  employerName: z.string().min(1, 'Nome da empresa é obrigatório'),
  employerDocument: z.string().min(1, 'Documento da empresa é obrigatório'),
  employerAddress: z.string().min(1, 'Endereço da empresa é obrigatório'),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface PayrollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSave: (data: any) => void;
  editingPayroll?: any;
}

export function PayrollModal({ open, onOpenChange, employee, onSave, editingPayroll }: PayrollModalProps) {
  const [preview, setPreview] = useState<any>(null);
  const [advanceWarning, setAdvanceWarning] = useState<string>('');
  const { month, year } = getCurrentReferenceDate();
  const { settings } = useSettings();
  
  const form = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      month: editingPayroll?.referenceMonth || month,
      year: editingPayroll?.referenceYear || year,
      overtime: editingPayroll?.additions?.overtime || 0,
      bonuses: editingPayroll?.additions?.bonuses || 0,
      vacation: editingPayroll?.additions?.vacation || 0,
      thirteenth: editingPayroll?.additions?.thirteenth || 0,
      otherAdditions: editingPayroll?.additions?.other || 0,
      inss: editingPayroll?.deductions?.inss || 0,
      fgts: editingPayroll?.deductions?.fgts || 0,
      irrf: editingPayroll?.deductions?.irrf || 0,
      mealVoucher: 0,
      transportVoucher: 0,
      salaryAdvance: 0,
      otherDeductions: editingPayroll?.deductions?.other || 0,
      employerName: editingPayroll?.employerName || settings?.company_name || 'Empresa S/A',
      employerDocument: editingPayroll?.employerDocument || settings?.cnpj || '00.000.000/0001-00',
      employerAddress: editingPayroll?.employerAddress || (settings as any)?.address || 'Rua das Empresas, 123 - Centro, São Paulo - SP',
    },
  });

  // Atualizar dados da empresa quando as configurações mudarem (apenas se não estiver editando)
  useEffect(() => {
    if (settings && !editingPayroll) {
      form.setValue('employerName', settings.company_name || 'Empresa S/A');
      form.setValue('employerDocument', settings.cnpj || '00.000.000/0001-00');
      form.setValue('employerAddress', (settings as any).address || 'Rua das Empresas, 123 - Centro, São Paulo - SP');
    }
  }, [settings, form, editingPayroll]);

  // Preencher formulário quando entrar em modo de edição
  useEffect(() => {
    if (editingPayroll && open) {
      form.reset({
        month: editingPayroll.referenceMonth,
        year: editingPayroll.referenceYear,
        overtime: editingPayroll.additions?.overtime || 0,
        bonuses: editingPayroll.additions?.bonuses || 0,
        vacation: editingPayroll.additions?.vacation || 0,
        thirteenth: editingPayroll.additions?.thirteenth || 0,
        otherAdditions: editingPayroll.additions?.other || 0,
        inss: editingPayroll.deductions?.inss || 0,
        fgts: editingPayroll.deductions?.fgts || 0,
        irrf: editingPayroll.deductions?.irrf || 0,
        mealVoucher: 0,
        transportVoucher: 0,
        salaryAdvance: 0,
        otherDeductions: editingPayroll.deductions?.other || 0,
        employerName: editingPayroll.employerName,
        employerDocument: editingPayroll.employerDocument,
        employerAddress: editingPayroll.employerAddress,
      });
    }
  }, [editingPayroll, open, form]);

  const watchedValues = form.watch();

  // Validar adiantamento salarial (máximo 40%)
  useEffect(() => {
    if (employee && watchedValues.salaryAdvance > 0) {
      const maxAdvance = employee.salary * 0.4;
      if (watchedValues.salaryAdvance > maxAdvance) {
        setAdvanceWarning(`Adiantamento excede 40% do salário bruto (máximo: ${formatCurrency(maxAdvance)})`);
        form.setValue('salaryAdvance', maxAdvance);
      } else {
        setAdvanceWarning('');
      }
    }
  }, [watchedValues.salaryAdvance, employee]);

  const calculatePreview = () => {
    if (!employee) return null;
    
    const totalOtherDeductions = 
      watchedValues.mealVoucher + 
      watchedValues.transportVoucher + 
      watchedValues.salaryAdvance + 
      watchedValues.otherDeductions;
    
    const calculation = calculatePayroll(
      employee.salary,
      {
        overtime: watchedValues.overtime,
        bonuses: watchedValues.bonuses,
        vacation: watchedValues.vacation,
        thirteenth: watchedValues.thirteenth,
        other: watchedValues.otherAdditions,
      },
      {
        inss: watchedValues.inss,
        fgts: watchedValues.fgts,
        irrf: watchedValues.irrf,
        other: totalOtherDeductions,
      }
    );
    
    return calculation;
  };

  const updatePreview = () => {
    const calculation = calculatePreview();
    setPreview(calculation);
  };

  const handleSubmit = (data: PayrollFormData) => {
    if (!employee) return;
    
    const totalOtherDeductions = 
      data.mealVoucher + 
      data.transportVoucher + 
      data.salaryAdvance + 
      data.otherDeductions;
    
    const payrollData = {
      employee,
      month: data.month,
      year: data.year,
      additions: {
        overtime: data.overtime,
        bonuses: data.bonuses,
        vacation: data.vacation,
        thirteenth: data.thirteenth,
        other: data.otherAdditions,
      },
      deductions: {
        inss: data.inss,
        fgts: data.fgts,
        irrf: data.irrf,
        other: totalOtherDeductions,
      },
      specificDeductions: {
        mealVoucher: data.mealVoucher,
        transportVoucher: data.transportVoucher,
        salaryAdvance: data.salaryAdvance,
        otherDeductions: data.otherDeductions,
      },
      employerData: {
        name: data.employerName,
        document: data.employerDocument,
        address: data.employerAddress,
      },
    };
    
    onSave(payrollData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                {editingPayroll ? 'Editar Holerite' : 'Gerar Holerite'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {employee?.name} • {formatCurrency(employee?.salary || 0)}/mês
                {editingPayroll && <span className="ml-2 text-orange-600 font-semibold">• Modo Edição</span>}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Dados do Período */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Período de Referência</h3>
                </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mês</FormLabel>
                      <FormControl>
                        <select {...field} className="w-full p-2 border rounded">
                          <option value="01">Janeiro</option>
                          <option value="02">Fevereiro</option>
                          <option value="03">Março</option>
                          <option value="04">Abril</option>
                          <option value="05">Maio</option>
                          <option value="06">Junho</option>
                          <option value="07">Julho</option>
                          <option value="08">Agosto</option>
                          <option value="09">Setembro</option>
                          <option value="10">Outubro</option>
                          <option value="11">Novembro</option>
                          <option value="12">Dezembro</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </CardContent>
            </Card>

            {/* Adicionais */}
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Proventos / Adicionais</h3>
                  <Badge variant="outline" className="ml-auto">
                    Total: {formatCurrency(
                      watchedValues.overtime + 
                      watchedValues.bonuses + 
                      watchedValues.vacation + 
                      watchedValues.thirteenth + 
                      watchedValues.otherAdditions
                    )}
                  </Badge>
                </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="overtime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas Extras</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            updatePreview();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bonuses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonificações</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            updatePreview();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vacation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Férias</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            updatePreview();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thirteenth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>13º Salário</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            updatePreview();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherAdditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outros Adicionais</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            updatePreview();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </CardContent>
            </Card>

            {/* Deduções Padrão */}
            <Card className="border-2 border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Deduções Obrigatórias</h3>
                  <Badge variant="outline" className="ml-auto">
                    Total: {formatCurrency(
                      watchedValues.inss + 
                      watchedValues.fgts + 
                      watchedValues.irrf
                    )}
                  </Badge>
                </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="inss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>INSS</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            updatePreview();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fgts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FGTS</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            updatePreview();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="irrf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IRRF</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            updatePreview();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </CardContent>
            </Card>

            {/* Deduções Específicas */}
            <Card className="border-2 border-orange-200 bg-orange-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">Deduções Específicas</h3>
                  <Badge variant="outline" className="ml-auto">
                    Total: {formatCurrency(
                      watchedValues.mealVoucher + 
                      watchedValues.transportVoucher + 
                      watchedValues.salaryAdvance + 
                      watchedValues.otherDeductions
                    )}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="mealVoucher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vale Refeição</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              updatePreview();
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Desconto do vale refeição
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transportVoucher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vale Transporte</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              updatePreview();
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Desconto do vale transporte
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salaryAdvance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adiantamento Salarial</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              updatePreview();
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Máximo: {employee ? formatCurrency(employee.salary * 0.4) : 'R$ 0,00'} (40%)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherDeductions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outras Deduções</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value) || 0);
                              updatePreview();
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Outras deduções diversas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {advanceWarning && (
                  <Alert className="mt-4 border-orange-300 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      {advanceWarning}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            <Separator className="my-6" />

            {/* Dados do Empregador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Dados do Empregador</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social/Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Empresa S/A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employerDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ/CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0001-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employerAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua das Empresas, 123 - Centro, São Paulo - SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Preview */}
            {employee && preview && (
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-900">💰 Prévia do Cálculo</h3>
                
                <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Salário Base</div>
                      <div className="font-semibold">{formatCurrency(employee.salary)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Adicionais</div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(preview.additions.total)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Deduções</div>
                      <div className="font-semibold text-red-600">
                        {formatCurrency(preview.totalDeductions)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Salário Líquido</div>
                      <div className="font-bold text-lg text-blue-600">
                        {formatCurrency(preview.netSalary)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <div className="text-gray-600">INSS</div>
                        <div>{formatCurrency(preview?.deductions?.inss || 0)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">FGTS</div>
                        <div>{formatCurrency(preview?.deductions?.fgts || 0)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">IRRF</div>
                        <div>{formatCurrency(preview?.deductions?.irrf || 0)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Outras</div>
                        <div>{formatCurrency(preview?.deductions?.other || 0)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Gerar Holerite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
