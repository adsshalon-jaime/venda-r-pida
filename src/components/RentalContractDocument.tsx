import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/utils/currency';

interface RentalItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface RentalContract {
  contractNumber: string;
  contractDate: Date;
  customerName: string;
  customerDocument: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerPhone: string;
  customerReference?: string;
  items: RentalItem[];
  rentalPeriod: 'day' | 'week' | 'month';
  rentalDuration: number;
  startDate: Date;
  endDate: Date;
  subtotal: number;
  shippingFee: number;
  assemblyFee: number;
  totalValue: number;
  paymentMethod: 'pix' | 'card' | 'cash';
  pixKey?: string;
}

interface RentalContractDocumentProps {
  contract: RentalContract;
}

export function RentalContractDocument({ contract }: RentalContractDocumentProps) {
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'day': return 'Diária';
      case 'week': return 'Semanal';
      case 'month': return 'Mensal';
      default: return period;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'card': return 'Cartão';
      case 'cash': return 'Dinheiro';
      default: return method;
    }
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="rental-contract-document">
      {/* Cabeçalho da Empresa */}
      <div className="border-b-4 border-primary pb-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Coberturas Shalon</h1>
            <p className="text-sm text-slate-600 font-medium">Tendas & Coberturas</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold">CNPJ: 00.000.000/0001-00</p>
            <p>Rua Exemplo, 123 - Centro</p>
            <p>Cidade - Estado - CEP 00000-000</p>
            <p>Tel: (00) 0000-0000</p>
            <p>contato@coberturasshalon.com.br</p>
          </div>
        </div>
      </div>

      {/* Título do Contrato */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          CONTRATO DE LOCAÇÃO DE TENDAS E COBERTURAS
        </h2>
        <div className="flex justify-center gap-8 text-sm text-slate-600">
          <p>
            <span className="font-semibold">Nº do Contrato:</span> {contract.contractNumber}
          </p>
          <p>
            <span className="font-semibold">Data:</span>{' '}
            {format(contract.contractDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-300 pb-2">
          DADOS DO LOCATÁRIO
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 font-medium">Nome/Razão Social:</p>
            <p className="font-semibold text-slate-800">{contract.customerName}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">CPF/CNPJ:</p>
            <p className="font-semibold text-slate-800">{contract.customerDocument}</p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500 font-medium">Endereço:</p>
            <p className="font-semibold text-slate-800">{contract.customerAddress}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Cidade/Estado:</p>
            <p className="font-semibold text-slate-800">
              {contract.customerCity} - {contract.customerState}
            </p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Telefone:</p>
            <p className="font-semibold text-slate-800">{contract.customerPhone}</p>
          </div>
          {contract.customerReference && (
            <div className="col-span-2">
              <p className="text-slate-500 font-medium">Ponto de Referência:</p>
              <p className="font-semibold text-slate-800">{contract.customerReference}</p>
            </div>
          )}
        </div>
      </div>

      {/* Período de Locação */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-blue-300 pb-2">
          PERÍODO DE LOCAÇÃO
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 font-medium">Tipo de Locação:</p>
            <p className="font-semibold text-slate-800">
              {getPeriodLabel(contract.rentalPeriod)} ({contract.rentalDuration}{' '}
              {contract.rentalPeriod === 'day'
                ? contract.rentalDuration > 1
                  ? 'dias'
                  : 'dia'
                : contract.rentalPeriod === 'week'
                ? contract.rentalDuration > 1
                  ? 'semanas'
                  : 'semana'
                : contract.rentalDuration > 1
                ? 'meses'
                : 'mês'}
              )
            </p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Data de Início:</p>
            <p className="font-semibold text-slate-800">
              {format(contract.startDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Data de Término:</p>
            <p className="font-semibold text-slate-800">
              {format(contract.endDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      {/* Itens Locados */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-slate-300 pb-2">
          ITENS LOCADOS
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="text-left p-3 font-semibold text-slate-700">Descrição</th>
              <th className="text-center p-3 font-semibold text-slate-700">Qtd</th>
              <th className="text-right p-3 font-semibold text-slate-700">Valor Unit.</th>
              <th className="text-right p-3 font-semibold text-slate-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {contract.items.map((item, index) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="p-3 text-slate-800">{item.name}</td>
                <td className="p-3 text-center text-slate-800">{item.quantity}</td>
                <td className="p-3 text-right text-slate-800">{formatCurrency(item.unitPrice)}</td>
                <td className="p-3 text-right font-semibold text-slate-800">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Valores */}
      <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-300 pb-2">
          VALORES
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal dos Itens:</span>
            <span className="font-semibold text-slate-800">{formatCurrency(contract.subtotal)}</span>
          </div>
          {contract.shippingFee > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Taxa de Frete:</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(contract.shippingFee)}
              </span>
            </div>
          )}
          {contract.assemblyFee > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Taxa de Montagem:</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(contract.assemblyFee)}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t-2 border-slate-300">
            <span className="text-lg font-bold text-slate-800">VALOR TOTAL:</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(contract.totalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="mb-8 bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-green-300 pb-2">
          FORMA DE PAGAMENTO
        </h3>
        <div className="text-sm">
          <p className="mb-2">
            <span className="text-slate-600">Método de Pagamento:</span>{' '}
            <span className="font-bold text-slate-800">
              {getPaymentMethodLabel(contract.paymentMethod)}
            </span>
          </p>
          {contract.paymentMethod === 'pix' && contract.pixKey && (
            <div className="mt-4 bg-white p-4 rounded border border-green-300">
              <p className="text-slate-600 mb-2">Chave PIX para pagamento:</p>
              <p className="font-mono font-bold text-lg text-primary break-all">{contract.pixKey}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cláusulas do Contrato */}
      <div className="mb-8 text-xs text-slate-700 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-slate-300 pb-2">
          CLÁUSULAS CONTRATUAIS
        </h3>
        <div className="space-y-3">
          <p>
            <strong>CLÁUSULA 1ª - DO OBJETO:</strong> O presente contrato tem por objeto a locação dos
            itens descritos acima, pelo período estabelecido.
          </p>
          <p>
            <strong>CLÁUSULA 2ª - DA RESPONSABILIDADE:</strong> O LOCATÁRIO se responsabiliza pela
            guarda e conservação dos itens locados, devendo devolvê-los nas mesmas condições em que os
            recebeu.
          </p>
          <p>
            <strong>CLÁUSULA 3ª - DOS DANOS:</strong> Qualquer dano causado aos itens locados será de
            responsabilidade do LOCATÁRIO, que deverá arcar com os custos de reparo ou reposição.
          </p>
          <p>
            <strong>CLÁUSULA 4ª - DA DEVOLUÇÃO:</strong> Os itens deverão ser devolvidos na data
            estabelecida. O atraso na devolução implicará em cobrança proporcional ao período excedente.
          </p>
          <p>
            <strong>CLÁUSULA 5ª - DO PAGAMENTO:</strong> O pagamento deverá ser efetuado conforme a
            forma estabelecida neste contrato, sendo condição essencial para a retirada dos itens.
          </p>
        </div>
      </div>

      {/* Assinaturas */}
      <div className="mt-12 pt-8 border-t-2 border-slate-300">
        <div className="grid grid-cols-2 gap-12 text-center">
          <div>
            <div className="border-t-2 border-slate-400 pt-2 mt-16">
              <p className="font-bold text-slate-800">Coberturas Shalon</p>
              <p className="text-xs text-slate-600">LOCADOR</p>
            </div>
          </div>
          <div>
            <div className="border-t-2 border-slate-400 pt-2 mt-16">
              <p className="font-bold text-slate-800">{contract.customerName}</p>
              <p className="text-xs text-slate-600">LOCATÁRIO</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>
          Este contrato foi gerado eletronicamente e é válido sem assinaturas digitais conforme
          legislação vigente.
        </p>
        <p className="mt-1">
          Coberturas Shalon - Tendas & Coberturas | CNPJ: 00.000.000/0001-00
        </p>
      </div>
    </div>
  );
}
