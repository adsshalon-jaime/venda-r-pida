import { Employee } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Building,
  Mail,
  FileText
} from 'lucide-react';

interface EmployeeViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export function EmployeeViewModal({ open, onOpenChange, employee }: EmployeeViewModalProps) {
  if (!employee) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const dayLabels: { [key: string]: string } = {
    segunda: 'Seg',
    terca: 'Ter',
    quarta: 'Qua',
    quinta: 'Qui',
    sexta: 'Sex',
    sabado: 'Sáb',
    domingo: 'Dom'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold">{employee.name}</div>
              <div className="text-sm text-muted-foreground">Detalhes do Funcionário</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">CPF</div>
                      <div className="font-medium">{employee.cpf}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Telefone</div>
                      <div className="font-medium">{employee.phone}</div>
                    </div>
                  </div>
                  
                  {employee.backupPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Telefone de Recado</div>
                        <div className="font-medium">{employee.backupPhone}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Data de Entrada</div>
                      <div className="font-medium">{formatDate(employee.entryDate)}</div>
                    </div>
                  </div>
                  
                  {employee.exitDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Data de Saída</div>
                        <div className="font-medium">{formatDate(employee.exitDate)}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Salário</div>
                      <div className="font-medium">{formatCurrency(employee.salary)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {employee.address.street}, {employee.address.number}
                    {employee.address.neighborhood && ` - ${employee.address.neighborhood}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {employee.address.city} - {employee.address.state}, {employee.address.zipCode}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horários e Escala */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horários e Escala
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Horário de Trabalho</div>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {employee.workHours}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Horário de Almoço</div>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {employee.lunchBreak}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Dias de Trabalho</div>
                  <div className="flex flex-wrap gap-2">
                    {employee.workSchedule.map((day) => (
                      <Badge key={day} variant="default" className="px-3 py-1">
                        {dayLabels[day] || day}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
