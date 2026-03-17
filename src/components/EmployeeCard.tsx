import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Building
} from 'lucide-react';
import { useState } from 'react';
import { EmployeeViewModal } from './EmployeeViewModal';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employeeId: string) => void;
  index: number;
}

export function EmployeeCard({ employee, onEdit, onDelete, index }: EmployeeCardProps) {
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const isActive = !employee.exitDate;

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
    <>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 hover:scale-[1.02] animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isActive 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                  {employee.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={isActive ? "default" : "secondary"}
                    className={isActive ? "bg-green-100 text-green-700" : ""}
                  >
                    {isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <span className="text-sm text-gray-500 font-mono">
                    {employee.cpf}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setViewModalOpen(true)}
                title="Visualizar"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => onEdit(employee)}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(employee.id)}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Informações Principais */}
          <div className="space-y-3">
            {/* Telefone */}
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{employee.phone}</span>
              {employee.backupPhone && (
                <span className="text-gray-500 text-xs">
                  (Rec: {employee.backupPhone})
                </span>
              )}
            </div>

            {/* Endereço Resumido */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700 truncate">
                {employee.address.city} - {employee.address.state}
              </span>
            </div>

            {/* Salário e Data */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-green-600">
                  {formatCurrency(employee.salary)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {formatDate(employee.entryDate)}
                </span>
              </div>
            </div>

            {/* Horários */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{employee.workHours}</span>
              {employee.lunchBreak && employee.lunchBreak !== 'Não aplicável' && (
                <span className="text-gray-500 text-xs">
                  | Almoço: {employee.lunchBreak}
                </span>
              )}
            </div>

            {/* Dias de Trabalho */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Dias de trabalho:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {employee.workSchedule.slice(0, 5).map((day) => (
                  <Badge 
                    key={day} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {dayLabels[day] || day}
                  </Badge>
                ))}
                {employee.workSchedule.length > 5 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{employee.workSchedule.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <EmployeeViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        employee={employee}
      />
    </>
  );
}
