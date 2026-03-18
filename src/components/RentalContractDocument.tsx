import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/utils/currency';

interface RentalItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CompanyData {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email?: string;
}

interface RentalContract {
  contractNumber: string;
  contractDate: Date;
  companyData: CompanyData;
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
            <h1 className="text-3xl font-bold text-primary mb-2">{contract.companyData.name}</h1>
            <p className="text-sm text-slate-600 font-medium">Tendas & Coberturas</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-semibold">CNPJ: {contract.companyData.cnpj}</p>
            <p>{contract.companyData.address}</p>
            <p>Tel: {contract.companyData.phone}</p>
            {contract.companyData.email && <p>{contract.companyData.email}</p>}
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
        <div className="space-y-4">
          <div>
            <p className="font-bold text-sm mb-2">1. DO OBJETO</p>
            <p>O presente contrato tem por objeto a locação dos itens descritos acima, pelo período estabelecido.</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-2">2. DO PRAZO</p>
            <p>O prazo de locação será de {contract.rentalDuration} {contract.rentalPeriod === 'day' ? (contract.rentalDuration > 1 ? 'dias' : 'dia') : contract.rentalPeriod === 'week' ? (contract.rentalDuration > 1 ? 'semanas' : 'semana') : (contract.rentalDuration > 1 ? 'meses' : 'mês')}, com início em {format(contract.startDate, 'dd/MM/yyyy')} e término em {format(contract.endDate, 'dd/MM/yyyy')}.</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-2">3. DO PAGAMENTO</p>
            <p>O pagamento deverá ser efetuado conforme a forma estabelecida neste contrato ({getPaymentMethodLabel(contract.paymentMethod)}), sendo condição essencial para a retirada dos itens.</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-2">4. OBRIGAÇÕES DA CONTRATADA</p>
            <p className="mb-1">Compete à CONTRATADA:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Fornecer as tendas conforme especificações acordadas;</li>
              <li>Realizar a montagem e desmontagem (quando incluso);</li>
              <li>Entregar o material em boas condições de uso;</li>
              <li>Utilizar materiais adequados e mão de obra qualificada.</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-sm mb-2">5. OBRIGAÇÕES DA CONTRATANTE</p>
            <p className="mb-1">Compete à CONTRATANTE:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Disponibilizar local adequado para instalação da tenda;</li>
              <li>Zelar pela conservação do material durante a locação;</li>
              <li>Não modificar, desmontar ou transferir a tenda sem autorização;</li>
              <li>Responsabilizar-se por danos causados por mau uso, intempéries extremas ou terceiros.</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-sm mb-2">6. RESPONSABILIDADE POR DANOS</p>
            <p className="mb-2"><strong>CLÁUSULA – RESPONSABILIDADE POR INTEMPÉRIES, DANOS E MANUTENÇÃO</strong></p>
            <p className="mb-2">A LOCATÁRIA declara estar ciente de que as estruturas objeto deste contrato (tendas, galpões lonados ou similares) estão sujeitas a ações da natureza e a fatores externos imprevisíveis.</p>
            
            <p className="font-semibold mt-2 mb-1">6.1. Intempéries e Caso Fortuito / Força Maior</p>
            <p className="mb-2">A LOCATÁRIA assume integral responsabilidade por quaisquer danos decorrentes de eventos climáticos ou naturais ocorridos após a instalação da estrutura, tais como, mas não se limitando a: tempestades, vendavais, rajadas de vento acima do recomendado tecnicamente, chuvas intensas, granizo, enchentes, descargas elétricas, queda de árvores, deslizamentos, alagamentos ou quaisquer outros eventos caracterizados como caso fortuito ou força maior.</p>
            
            <p className="font-semibold mt-2 mb-1">6.2. Furto, Roubo, Vandalismo ou Mau Uso</p>
            <p className="mb-2">A LOCATÁRIA será integralmente responsável por perdas, danos, extravios, furtos, roubos, atos de vandalismo, incêndio ou qualquer dano causado por terceiros, funcionários, prepostos ou participantes do evento, obrigando-se a ressarcir a LOCADORA pelo valor de reposição ou reparo do material danificado.</p>
            
            <p className="font-semibold mt-2 mb-1">6.3. Danos Estruturais ou Necessidade de Reparo</p>
            <p className="mb-2">Constatado qualquer dano à estrutura, lona, ferragens ou acessórios durante o período de locação, a LOCATÁRIA deverá comunicar imediatamente a LOCADORA, ficando responsável pelo custo integral de reparo ou substituição das peças danificadas.</p>
            
            <p className="font-semibold mt-2 mb-1">6.4. Manutenção Técnica e Deslocamento</p>
            <p className="mb-2">Caso seja necessária visita técnica para manutenção corretiva, ajustes, reparos ou avaliação técnica durante o período de locação, por motivo não decorrente de defeito de fabricação ou falha comprovada de instalação, a LOCATÁRIA arcará com os custos de deslocamento da equipe técnica, incluindo transporte, alimentação e demais despesas operacionais, sendo o valor previamente acordado entre as partes.</p>
            
            <p className="font-semibold mt-2 mb-1">6.5. Recomendações Técnicas</p>
            <p className="mb-2">A LOCATÁRIA compromete-se a respeitar as orientações técnicas fornecidas pela LOCADORA quanto ao uso adequado da estrutura, especialmente no que se refere à capacidade de resistência a ventos e à necessidade de evacuação preventiva em condições climáticas adversas.</p>
            
            <p className="font-semibold mt-2 mb-1">6.6. Ressarcimento</p>
            <p>Eventuais valores devidos poderão ser cobrados imediatamente após constatação dos danos, mediante apresentação de relatório técnico e orçamento correspondente.</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-2">7. RESCISÃO</p>
            <p>Este contrato poderá ser rescindido por qualquer das partes mediante aviso prévio, respeitando os valores proporcionais já executados ou custos operacionais envolvidos.</p>
          </div>

          <div>
            <p className="font-bold text-sm mb-2">8. DISPOSIÇÕES GERAIS</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Este contrato é válido para todo o território nacional;</li>
              <li>O presente instrumento substitui quaisquer acordos verbais;</li>
              <li>As partes declaram estar de acordo com todas as cláusulas aqui descritas.</li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-sm mb-2">9. FORO</p>
            <p>Fica eleito o foro da comarca de Palmas/TO, renunciando a qualquer outro, por mais privilegiado que seja, para dirimir dúvidas oriundas deste contrato.</p>
          </div>

          <div className="mt-4">
            <p className="text-center font-semibold">E, por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor.</p>
          </div>
        </div>
      </div>

      {/* Local e Data */}
      <div className="mt-8 mb-4 text-center text-sm">
        <p>Palmas/TO, {format(contract.contractDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>

      {/* Assinaturas */}
      <div className="mt-12 pt-8 border-t-2 border-slate-300">
        <div className="grid grid-cols-2 gap-12 text-center">
          <div>
            <div className="border-t-2 border-slate-400 pt-2 mt-16">
              <p className="font-bold text-slate-800">{contract.companyData.name}</p>
              <p className="text-xs text-slate-600">LOCADORA (CONTRATADA)</p>
            </div>
          </div>
          <div>
            <div className="border-t-2 border-slate-400 pt-2 mt-16">
              <p className="font-bold text-slate-800">{contract.customerName}</p>
              <p className="text-xs text-slate-600">LOCATÁRIA (CONTRATANTE)</p>
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
          {contract.companyData.name} - Tendas & Coberturas | CNPJ: {contract.companyData.cnpj}
        </p>
      </div>
    </div>
  );
}
