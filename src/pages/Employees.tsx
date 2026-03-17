import { useState } from 'react';
import { Plus, Search, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/Layout';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee } from '@/types';
import { EmployeeModal } from '@/components/EmployeeModal';
import { EmployeeCard } from '@/components/EmployeeCard';
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
import { Badge } from '@/components/ui/badge';

export default function Employees() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.cpf?.includes(searchQuery) ||
      employee.phone?.includes(searchQuery) ||
      employee.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.address?.state?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !employee.exitDate) ||
      (filterStatus === 'inactive' && employee.exitDate);
    
    return matchesSearch && matchesFilter;
  });

  const activeCount = employees.filter(emp => !emp.exitDate).length;
  const inactiveCount = employees.filter(emp => emp.exitDate).length;

  const handleSave = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employeeData);
        toast.success('Funcionário atualizado!');
      } else {
        await addEmployee(employeeData);
        toast.success('Funcionário cadastrado!');
      }
      setEditingEmployee(null);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId);
      toast.success('Funcionário excluído');
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleOpenModal = () => {
    setEditingEmployee(null);
    setModalOpen(true);
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Funcionários
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie a equipe da sua empresa
            </p>
          </div>
          <Button onClick={handleOpenModal} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total de Funcionários</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Funcionários Ativos</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{activeCount}</p>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Funcionários Inativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{inactiveCount}</p>
              </div>
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">○</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funcionário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="h-11"
            >
              Todos ({employees.length})
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="h-11"
            >
              Ativos ({activeCount})
            </Button>
            <Button
              variant={filterStatus === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('inactive')}
              className="h-11"
            >
              Inativos ({inactiveCount})
            </Button>
          </div>
        </div>

        {/* Employee Grid */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Tente ajustar sua busca ou filtros'
                : 'Comece cadastrando seu primeiro funcionário'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={handleOpenModal} variant="outline" className="h-11">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar primeiro funcionário
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee, index) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <EmployeeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          employee={editingEmployee}
          onSave={handleSave}
        />
      </div>
    </Layout>
  );
}
