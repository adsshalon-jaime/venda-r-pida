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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/types';
import { getCurrentReferenceDate, formatCurrency } from '@/utils/payrollCalculations';
import { DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSettings } from '@/hooks/useSettings';

const advanceSchema = z.object({
  month: z.string().min(2, 'Mês é obrigatório'),
  year: z.number().min(2020).max(2030, 'Ano inválido'),
  advancePercentage: z.number().min(1).max(40, 'Máximo 40%'),
  employerName: z.string().min(1, 'Nome da empresa é obrigatório'),
  employerDocument: z.string().min(1, 'Documento da empresa é obrigatório'),
  employerAddress: z.string().min(1, 'Endereço da empresa é obrigatório'),
});

type AdvanceFormData = z.infer<typeof advanceSchema>;

interface SalaryAdvanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSave: (data: any) => void;
}

export function SalaryAdvanceModal({ open, onOpenChange, employee, onSave }: SalaryAdvanceModalProps) {
  const [preview, setPreview] = useState<any>(null);
  const { month, year } = getCurrentReferenceDate();
  const { settings } = useSettings();
  
  const form = useForm<AdvanceFormData>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      month,
      year,
      advancePercentage: 40,
      employerName: settings?.company_name || 'Empresa S/A',
      employerDocument: settings?.cnpj || '00.000.000/0001-00',
      employerAddress: (settings as any)?.address || 'Rua das Empresas, 123 - Centro, São Paulo - SP',
    },
  });

  useEffect(() => {
    if (settings) {
      form.setValue('employerName', settings.company_name || 'Empresa S/A');
      form.setValue('employerDocument', settings.cnpj || '00.000.000/0001-00');
      form.setValue('employerAddress', (settings as any).address || 'Rua das Empresas, 123 - Centro, São Paulo - SP');
    }
  }, [settings, form]);

  const watchedValues = form.watch();

  const calculatePreview = () => {
    if (!employee) return null;
    
    const percentage = watchedValues.advancePercentage || 40;
    const advanceAmount = (employee.salary * percentage) / 100;

    return {
      grossSalary: employee.salary,
      percentage,
      advanceAmount,
    };
  };

  useEffect(() => {
    setPreview(calculatePreview());
  }, [watchedValues, employee]);

  const handleSubmit = (data: AdvanceFormData) => {
    const advanceData = {
      month: data.month,
      year: data.year,
      advancePercentage: data.advancePercentage,
      employerData: {
        name: data.employerName,
        document: data.employerDocument,
        address: data.employerAddress,
      },
    };
    
    onSave(advanceData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Gerar Recibo de Adiantamento</DialogTitle>
              <DialogDescription className="text-base">
                {employee?.name} • {formatCurrency(employee?.salary || 0)}/mês
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Dados do Período */}
            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-lg">Período de Referência</h3>
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
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Percentual do Adiantamento */}
            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-lg">Percentual do Adiantamento</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="advancePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentual (máximo 40%)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            min="1"
                            max="40"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            className="w-32"
                          />
                          <span className="text-lg font-semibold">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Este valor será automaticamente descontado no holerite final do mês
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Dados do Empregador */}
            <Card className="border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-lg">Dados do Empregador</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="employerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Prévia */}
            {preview && (
              <Card className="border-2 border-purple-300 bg-purple-50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 text-purple-700">Prévia do Adiantamento</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded">
                      <span className="text-gray-700">Salário Bruto:</span>
                      <span className="font-semibold">{formatCurrency(preview.grossSalary)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded">
                      <span className="text-gray-700">Percentual:</span>
                      <span className="font-semibold">{preview.percentage.toFixed(2)}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-purple-600 text-white rounded-lg">
                      <span className="text-lg font-bold">VALOR DO ADIANTAMENTO:</span>
                      <span className="text-2xl font-bold">{formatCurrency(preview.advanceAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Gerar Recibo de Adiantamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
