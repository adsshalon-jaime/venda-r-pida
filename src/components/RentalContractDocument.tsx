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
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.8cm 1.2cm;
          }
          
          * {
            print-color-adjust: economy !important;
            -webkit-print-color-adjust: economy !important;
            color-adjust: economy !important;
            box-shadow: none !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          
          /* Ocultar elementos específicos da UI */
          nav,
          aside,
          header:not(#rental-contract-document header),
          .print\\:hidden,
          [data-radix-dialog-overlay] {
            display: none !important;
          }
          
          /* Ajustar modal para impressão */
          [role="dialog"] {
            position: static !important;
            max-width: 100% !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            overflow: visible !important;
          }
          
          #rental-contract-document {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 8.5pt !important;
            line-height: 1.25 !important;
            background: white !important;
          }
          
          .print-section {
            page-break-inside: auto;
            break-inside: auto;
          }
          
          .print-page-break {
            page-break-after: always;
            break-after: always;
          }
          
          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
            orphans: 3;
            widows: 3;
          }
          
          h1, h2, h3 {
            page-break-after: avoid;
            break-after: avoid;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          /* Reduzir tamanhos de fonte para impressão */
          h1 { font-size: 14pt !important; margin-bottom: 0.15cm !important; }
          h2 { font-size: 12pt !important; margin-bottom: 0.12cm !important; }
          h3 { font-size: 10pt !important; margin-bottom: 0.1cm !important; }
          p, td, th, li { font-size: 8.5pt !important; line-height: 1.25 !important; }
          .text-xs { font-size: 7pt !important; }
          .text-sm { font-size: 7.5pt !important; }
          .text-lg { font-size: 9pt !important; }
          .text-xl { font-size: 10pt !important; }
          .text-2xl { font-size: 11pt !important; }
          .text-3xl { font-size: 13pt !important; }
          
          /* Reduzir espaçamentos drasticamente */
          .mb-8 { margin-bottom: 0.25cm !important; }
          .mb-6 { margin-bottom: 0.2cm !important; }
          .mb-4 { margin-bottom: 0.15cm !important; }
          .mb-2 { margin-bottom: 0.1cm !important; }
          .mt-8 { margin-top: 0.25cm !important; }
          .mt-12 { margin-top: 0.3cm !important; }
          .mt-16 { margin-top: 0.4cm !important; }
          .pt-8 { padding-top: 0.25cm !important; }
          .pb-6 { padding-bottom: 0.2cm !important; }
          .p-6 { padding: 0.2cm !important; }
          .p-8 { padding: 0 !important; }
          .p-3 { padding: 0.1cm !important; }
          .p-4 { padding: 0.15cm !important; }
          .gap-4 { gap: 0.15cm !important; }
          .gap-8 { gap: 0.2cm !important; }
          .gap-12 { gap: 0.3cm !important; }
          .space-y-4 > * + * { margin-top: 0.15cm !important; }
          .space-y-3 > * + * { margin-top: 0.12cm !important; }
          .space-y-2 > * + * { margin-top: 0.1cm !important; }
          
          /* Remover TODAS as bordas coloridas */
          .border-b-4,
          .border-t-2,
          .border-b-2,
          .border-t,
          .border-b,
          .border-l,
          .border-r,
          .border,
          .border-primary,
          .border-slate-200,
          .border-slate-300,
          .border-blue-200,
          .border-blue-300,
          .border-green-200,
          .border-green-300 {
            border-color: #d1d5db !important;
            border-width: 0.5pt !important;
          }
          
          /* Forçar TODOS os backgrounds a serem brancos */
          div[class*="bg-"],
          .bg-slate-50,
          .bg-blue-50,
          .bg-green-50,
          .bg-slate-100,
          .bg-primary,
          .bg-white,
          .bg-muted {
            background-color: white !important;
            background-image: none !important;
            background: white !important;
          }
          
          /* Simplificar TODAS as cores de texto */
          * {
            color: black !important;
          }
          
          .text-primary,
          .text-slate-600,
          .text-slate-700,
          .text-slate-800,
          .text-slate-500,
          .text-muted-foreground {
            color: black !important;
          }
          
          /* Remover arredondamentos */
          .rounded-lg,
          .rounded-xl { border-radius: 0 !important; }
          
          /* Ocultar elementos desnecessários */
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
      <div className="bg-white p-8 max-w-4xl mx-auto" id="rental-contract-document">
      {/* Cabeçalho da Empresa */}
      <div className="border-b-4 border-primary pb-6 mb-8 print-avoid-break">
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
      <div className="text-center mb-8 print-avoid-break">
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
      <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 print-avoid-break">
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
      <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200 print-avoid-break">
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
      <div className="mb-8 print-section">
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
      <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 print-avoid-break">
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
      <div className="mb-8 bg-green-50 p-6 rounded-lg border border-green-200 print-avoid-break">
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
      <div className="mb-8 text-xs text-slate-700 leading-relaxed print-section">
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
      <div className="mt-8 mb-4 text-center text-sm print-avoid-break">
        <p>Palmas/TO, {format(contract.contractDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>

      {/* Assinaturas */}
      <div className="mt-12 pt-8 border-t-2 border-slate-300 print-avoid-break">
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
      <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500 print-avoid-break">
        <p>
          Este contrato foi gerado eletronicamente e é válido sem assinaturas digitais conforme
          legislação vigente.
        </p>
        <p className="mt-1">
          {contract.companyData.name} - Tendas & Coberturas | CNPJ: {contract.companyData.cnpj}
        </p>
      </div>
    </div>
    </>
  );
}
