import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Edit2, Save, Trash2 } from 'lucide-react';

interface Deduction {
  id: string;
  name: string;
  value: number;
  description?: string;
}

interface DeductionsManagerProps {
  deductions: Deduction[];
  onChange: (deductions: Deduction[]) => void;
  title?: string;
  placeholder?: string;
}

export function DeductionsManager({ 
  deductions, 
  onChange, 
  title = "Deduções Personalizadas",
  placeholder = "Adicionar dedução..."
}: DeductionsManagerProps) {
  const [newDeduction, setNewDeduction] = useState({ name: '', value: 0, description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState(0);

  const addDeduction = () => {
    if (newDeduction.name && newDeduction.value > 0) {
      const deduction: Deduction = {
        id: Date.now().toString(),
        name: newDeduction.name,
        value: newDeduction.value,
        description: newDeduction.description,
      };
      onChange([...deductions, deduction]);
      setNewDeduction({ name: '', value: 0, description: '' });
    }
  };

  const removeDeduction = (id: string) => {
    onChange(deductions.filter(d => d.id !== id));
  };

  const startEditing = (deduction: Deduction) => {
    setEditingId(deduction.id);
    setEditingValue(deduction.value);
  };

  const saveEdit = (id: string) => {
    onChange(deductions.map(d => 
      d.id === id ? { ...d, value: editingValue } : d
    ));
    setEditingId(null);
    setEditingValue(0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue(0);
  };

  const totalDeductions = deductions.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline" className="text-sm">
          Total: {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(totalDeductions)}
        </Badge>
      </div>

      {/* Lista de Deduções Existentes */}
      {deductions.length > 0 && (
        <div className="space-y-2">
          {deductions.map((deduction) => (
            <Card key={deduction.id} className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{deduction.name}</div>
                    {deduction.description && (
                      <div className="text-xs text-gray-500">{deduction.description}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingId === deduction.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={editingValue}
                          onChange={(e) => setEditingValue(parseFloat(e.target.value) || 0)}
                          className="w-24 h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveEdit(deduction.id)}
                          className="h-8 w-8 p-0 text-green-600"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-8 w-8 p-0 text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-red-600 min-w-[80px] text-right">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(deduction.value)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(deduction)}
                          className="h-8 w-8 p-0 text-blue-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeDeduction(deduction.id)}
                          className="h-8 w-8 p-0 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Adicionar Nova Dedução */}
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Nome da dedução"
                value={newDeduction.name}
                onChange={(e) => setNewDeduction({ ...newDeduction, name: e.target.value })}
                className="text-sm"
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Valor"
                value={newDeduction.value || ''}
                onChange={(e) => setNewDeduction({ ...newDeduction, value: parseFloat(e.target.value) || 0 })}
                className="text-sm"
              />
              <Input
                placeholder="Descrição (opcional)"
                value={newDeduction.description}
                onChange={(e) => setNewDeduction({ ...newDeduction, description: e.target.value })}
                className="text-sm"
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={addDeduction}
                disabled={!newDeduction.name || newDeduction.value <= 0}
                size="sm"
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Adicionar Dedução
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deduções Comuns (Sugestões) */}
      <div className="space-y-2">
        <div className="text-sm text-gray-600 font-medium">Deduções comuns:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Plano de Saúde', description: 'Plano médico particular' },
            { name: 'Vale Transporte', description: 'Auxílio transporte' },
            { name: 'Vale Refeição', description: 'Auxílio alimentação' },
            { name: 'Empréstimo', description: 'Desconto de empréstimo' },
            { name: 'Pensão Alimentícia', description: 'Pensão judicial' },
            { name: 'Convênio Farmácia', description: 'Plano farmacêutico' },
            { name: 'Clube', description: 'Mensalidade de clube' },
            { name: 'Outros', description: 'Outras deduções' },
          ].map((suggestion) => (
            <Badge
              key={suggestion.name}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100 text-xs"
              onClick={() => setNewDeduction({ 
                name: suggestion.name, 
                value: 0, 
                description: suggestion.description 
              })}
            >
              {suggestion.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
