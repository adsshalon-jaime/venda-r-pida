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
import { Checkbox } from '@/components/ui/checkbox';
import { Employee } from '@/types';
import { Clock, Calendar } from 'lucide-react';

const employeeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(14, 'CPF inválido'),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    neighborhood: z.string().optional(),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado deve ter 2 caracteres').max(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().min(8, 'CEP deve ter 8 dígitos').max(9, 'CEP inválido'),
  }),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  backupPhone: z.string().optional(),
  entryDate: z.string().min(1, 'Data de entrada é obrigatória'),
  exitDate: z.string().optional(),
  workHours: z.string().min(1, 'Horário de trabalho é obrigatório'),
  lunchBreak: z.string().min(1, 'Horário de almoço é obrigatório'),
  salary: z.number().min(0, 'Salário deve ser positivo'),
  workSchedule: z.array(z.string()).min(1, 'Selecione pelo menos um dia de trabalho'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const weekDays = [
  { id: 'segunda', label: 'Segunda-feira', short: 'Seg' },
  { id: 'terca', label: 'Terça-feira', short: 'Ter' },
  { id: 'quarta', label: 'Quarta-feira', short: 'Qua' },
  { id: 'quinta', label: 'Quinta-feira', short: 'Qui' },
  { id: 'sexta', label: 'Sexta-feira', short: 'Sex' },
  { id: 'sabado', label: 'Sábado', short: 'Sáb' },
  { id: 'domingo', label: 'Domingo', short: 'Dom' },
];

const workScheduleOptions = [
  { id: 'manha', label: 'Manhã', hours: '06:00 - 12:00', icon: '🌅' },
  { id: 'tarde', label: 'Tarde', hours: '13:00 - 18:00', icon: '🌆' },
  { id: 'noite', label: 'Noite', hours: '18:00 - 23:00', icon: '🌙' },
  { id: 'integral', label: 'Integral', hours: '08:00 - 17:00', icon: '⏰' },
  { id: 'personalizado', label: 'Personalizado', hours: 'Definir manualmente', icon: '✏️' },
];

interface EmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (data: Omit<Employee, 'id'>) => void;
}

export function EmployeeModal({ open, onOpenChange, employee, onSave }: EmployeeModalProps) {
  const [selectedScheduleType, setSelectedScheduleType] = useState('personalizado');
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      cpf: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
      },
      phone: '',
      backupPhone: '',
      entryDate: '',
      exitDate: '',
      workHours: '',
      lunchBreak: '',
      salary: 0,
      workSchedule: [],
    },
  });

  const handleScheduleTypeChange = (type: string) => {
    setSelectedScheduleType(type);
    
    const schedule = workScheduleOptions.find(opt => opt.id === type);
    if (schedule && schedule.id !== 'personalizado') {
      form.setValue('workHours', schedule.hours);
      
      // Definir horário de almoço padrão baseado no tipo
      if (type === 'integral') {
        form.setValue('lunchBreak', '12:00 - 13:00');
      } else if (type === 'manha' || type === 'tarde') {
        form.setValue('lunchBreak', 'Não aplicável');
      } else if (type === 'noite') {
        form.setValue('lunchBreak', '20:00 - 20:30');
      }
    }
  };

  const handleQuickDaySelection = (pattern: 'weekdays' | 'weekends' | 'all' | 'clear') => {
    const currentDays = form.getValues('workSchedule');
    
    switch (pattern) {
      case 'weekdays':
        form.setValue('workSchedule', ['segunda', 'terca', 'quarta', 'quinta', 'sexta']);
        break;
      case 'weekends':
        form.setValue('workSchedule', ['sabado', 'domingo']);
        break;
      case 'all':
        form.setValue('workSchedule', weekDays.map(day => day.id));
        break;
      case 'clear':
        form.setValue('workSchedule', []);
        break;
    }
  };

  const handleSubmit = (data: EmployeeFormData) => {
    onSave(data);
    onOpenChange(false);
  };

  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        cpf: employee.cpf,
        address: {
          street: employee.address.street,
          number: employee.address.number,
          neighborhood: employee.address.neighborhood || '',
          city: employee.address.city,
          state: employee.address.state,
          zipCode: employee.address.zipCode,
        },
        phone: employee.phone,
        backupPhone: employee.backupPhone || '',
        entryDate: employee.entryDate,
        exitDate: employee.exitDate || '',
        workHours: employee.workHours,
        lunchBreak: employee.lunchBreak,
        salary: employee.salary,
        workSchedule: employee.workSchedule,
      });
    } else {
      form.reset();
    }
  }, [employee, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do funcionário abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Pessoais</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="123.456.789-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backupPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone de Recado (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Endereço</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua das Flores" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="12345-678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dados Profissionais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Profissionais</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Entrada</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Saída (Opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Trabalho</FormLabel>
                      <FormControl>
                        <Input placeholder="08:00 - 17:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lunchBreak"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de Almoço</FormLabel>
                      <FormControl>
                        <Input placeholder="12:00 - 13:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1500.00"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de Escala de Trabalho */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipo de Escala</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {workScheduleOptions.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedScheduleType === schedule.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleScheduleTypeChange(schedule.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{schedule.icon}</span>
                        <div>
                          <div className="font-medium">{schedule.label}</div>
                          <div className="text-xs text-muted-foreground">{schedule.hours}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dias de Trabalho */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Dias de Trabalho</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDaySelection('weekdays')}
                    >
                      Dias Úteis
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDaySelection('weekends')}
                    >
                      Fim de Semana
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDaySelection('all')}
                    >
                      Todos
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickDaySelection('clear')}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="workSchedule"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name="workSchedule"
                            render={({ field }) => {
                              return (
                                <FormItem className="flex flex-col items-center space-y-2">
                                  <FormControl>
                                    <div
                                      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                                        field.value?.includes(day.id)
                                          ? 'border-primary bg-primary text-primary-foreground'
                                          : 'border-border hover:border-primary/50'
                                      }`}
                                      onClick={() => {
                                        const isChecked = field.value?.includes(day.id);
                                        return isChecked
                                          ? field.onChange(
                                              field.value?.filter((value) => value !== day.id)
                                            )
                                          : field.onChange([...(field.value || []), day.id]);
                                      }}
                                    >
                                      <span className="text-xs font-medium">{day.short}</span>
                                    </div>
                                  </FormControl>
                                  <FormLabel className="text-xs text-center text-muted-foreground">
                                    {day.short}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {employee ? 'Atualizar' : 'Cadastrar'} Funcionário
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
