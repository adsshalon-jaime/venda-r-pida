import { useState } from 'react';
import { Plus, FileText, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { RentalContractModal } from '@/components/RentalContractModal';
import { useCustomers } from '@/hooks/useCustomers';

export default function Contracts() {
  const { customers, loading: customersLoading } = useCustomers();
  const [contractModalOpen, setContractModalOpen] = useState(false);

  if (customersLoading) {
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

        {/* Cards informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>
    </Layout>
  );
}
