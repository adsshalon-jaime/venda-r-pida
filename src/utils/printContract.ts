import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContractItem {
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

interface PrintContractData {
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
  items: ContractItem[];
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getPeriodLabel(period: string, duration: number): string {
  if (period === 'day') return `${duration} ${duration > 1 ? 'dias' : 'dia'}`;
  if (period === 'week') return `${duration} ${duration > 1 ? 'semanas' : 'semana'}`;
  return `${duration} ${duration > 1 ? 'meses' : 'mês'}`;
}

function getPaymentLabel(method: string): string {
  if (method === 'pix') return 'PIX';
  if (method === 'card') return 'Cartão';
  return 'Dinheiro';
}

export function printContract(contract: PrintContractData) {
  const itemsRows = contract.items.map(item => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato ${contract.contractNumber}</title>
  <style>
    @page { size: A4; margin: 1.5cm 1.8cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #111; background: white; line-height: 1.4; }
    .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start; }
    .company-name { font-size: 18pt; font-weight: bold; color: #111; }
    .company-sub { font-size: 9pt; color: #555; margin-top: 2px; }
    .company-info { text-align: right; font-size: 8.5pt; color: #444; line-height: 1.5; }
    .contract-title { text-align: center; margin-bottom: 14px; }
    .contract-title h2 { font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; }
    .contract-meta { display: flex; justify-content: center; gap: 30px; font-size: 8.5pt; color: #444; margin-top: 4px; }
    .section { border: 1px solid #d1d5db; padding: 10px 12px; margin-bottom: 10px; }
    .section-title { font-size: 9.5pt; font-weight: bold; border-bottom: 1px solid #d1d5db; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
    .field-label { font-size: 7.5pt; color: #666; }
    .field-value { font-size: 9pt; font-weight: 600; color: #111; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f3f4f6; }
    th { padding: 6px 8px; text-align: left; font-size: 8.5pt; font-weight: bold; border-bottom: 2px solid #d1d5db; }
    th:last-child, td:last-child { text-align: right; }
    th:nth-child(2), td:nth-child(2) { text-align: center; }
    .total-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 9pt; }
    .total-final { display: flex; justify-content: space-between; padding: 8px 0 3px; border-top: 2px solid #333; margin-top: 4px; }
    .total-final span:first-child { font-size: 11pt; font-weight: bold; }
    .total-final span:last-child { font-size: 13pt; font-weight: bold; color: #111; }
    .clauses { font-size: 8pt; line-height: 1.45; margin-bottom: 10px; }
    .clause-title { font-weight: bold; margin-top: 8px; margin-bottom: 2px; font-size: 8.5pt; }
    .clause-sub { font-weight: bold; margin-top: 5px; margin-bottom: 2px; }
    ul { padding-left: 14px; }
    li { margin-bottom: 2px; }
    .location-date { text-align: center; margin: 12px 0 8px; font-size: 9pt; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
    .sig-line { border-top: 1px solid #333; padding-top: 4px; text-align: center; }
    .sig-name { font-weight: bold; font-size: 9pt; }
    .sig-role { font-size: 8pt; color: #555; }
    .footer { border-top: 1px solid #d1d5db; margin-top: 14px; padding-top: 6px; text-align: center; font-size: 7.5pt; color: #666; }
  </style>
</head>
<body>
  <!-- Cabeçalho -->
  <div class="header">
    <div>
      <div class="company-name">${contract.companyData.name}</div>
      <div class="company-sub">Tendas &amp; Coberturas</div>
    </div>
    <div class="company-info">
      <div><strong>CNPJ:</strong> ${contract.companyData.cnpj}</div>
      <div>${contract.companyData.address}</div>
      <div><strong>Tel:</strong> ${contract.companyData.phone}</div>
      ${contract.companyData.email ? `<div>${contract.companyData.email}</div>` : ''}
    </div>
  </div>

  <!-- Título -->
  <div class="contract-title">
    <h2>Contrato de Locação de Tendas e Coberturas</h2>
    <div class="contract-meta">
      <span><strong>Nº do Contrato:</strong> ${contract.contractNumber}</span>
      <span><strong>Data:</strong> ${format(contract.contractDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
    </div>
  </div>

  <!-- Dados do Cliente -->
  <div class="section">
    <div class="section-title">Dados do Locatário</div>
    <div class="grid-2">
      <div><div class="field-label">Nome / Razão Social</div><div class="field-value">${contract.customerName}</div></div>
      <div><div class="field-label">CPF / CNPJ</div><div class="field-value">${contract.customerDocument}</div></div>
      <div><div class="field-label">Endereço</div><div class="field-value">${contract.customerAddress}</div></div>
      <div><div class="field-label">Cidade / Estado</div><div class="field-value">${contract.customerCity} / ${contract.customerState}</div></div>
      <div><div class="field-label">Telefone</div><div class="field-value">${contract.customerPhone}</div></div>
      ${contract.customerReference ? `<div><div class="field-label">Ponto de Referência</div><div class="field-value">${contract.customerReference}</div></div>` : ''}
    </div>
  </div>

  <!-- Período -->
  <div class="section">
    <div class="section-title">Período de Locação</div>
    <div class="grid-3">
      <div><div class="field-label">Tipo / Duração</div><div class="field-value">${getPeriodLabel(contract.rentalPeriod, contract.rentalDuration)}</div></div>
      <div><div class="field-label">Data de Início</div><div class="field-value">${format(contract.startDate, 'dd/MM/yyyy', { locale: ptBR })}</div></div>
      <div><div class="field-label">Data de Término</div><div class="field-value">${format(contract.endDate, 'dd/MM/yyyy', { locale: ptBR })}</div></div>
    </div>
  </div>

  <!-- Itens -->
  <div class="section">
    <div class="section-title">Itens Locados</div>
    <table>
      <thead><tr>
        <th>Descrição</th><th style="text-align:center;">Qtd</th><th style="text-align:right;">Valor Unit.</th><th style="text-align:right;">Total</th>
      </tr></thead>
      <tbody>${itemsRows}</tbody>
    </table>
  </div>

  <!-- Valores e Pagamento lado a lado -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
    <div class="section" style="margin-bottom:0;">
      <div class="section-title">Valores</div>
      <div class="total-row"><span>Subtotal dos Itens:</span><span>${formatCurrency(contract.subtotal)}</span></div>
      ${contract.shippingFee > 0 ? `<div class="total-row"><span>Frete:</span><span>${formatCurrency(contract.shippingFee)}</span></div>` : ''}
      ${contract.assemblyFee > 0 ? `<div class="total-row"><span>Montagem:</span><span>${formatCurrency(contract.assemblyFee)}</span></div>` : ''}
      <div class="total-final"><span>TOTAL:</span><span>${formatCurrency(contract.totalValue)}</span></div>
    </div>
    <div class="section" style="margin-bottom:0;">
      <div class="section-title">Forma de Pagamento</div>
      <div class="total-row"><span>Método:</span><span><strong>${getPaymentLabel(contract.paymentMethod)}</strong></span></div>
      ${contract.paymentMethod === 'pix' && contract.pixKey ? `<div style="margin-top:6px;"><div class="field-label">Chave PIX:</div><div style="font-family:monospace;font-weight:bold;font-size:9pt;word-break:break-all;">${contract.pixKey}</div></div>` : ''}
    </div>
  </div>

  <!-- Cláusulas -->
  <div class="clauses">
    <div class="section-title" style="border-bottom:2px solid #333;margin-bottom:6px;">Cláusulas Contratuais</div>

    <div class="clause-title">1. DO OBJETO</div>
    <p>O presente contrato tem por objeto a locação dos itens descritos acima, pelo período estabelecido.</p>

    <div class="clause-title">2. DO PRAZO</div>
    <p>O prazo de locação é de ${getPeriodLabel(contract.rentalPeriod, contract.rentalDuration)}, com início em ${format(contract.startDate, "dd/MM/yyyy")} e término em ${format(contract.endDate, "dd/MM/yyyy")}.</p>

    <div class="clause-title">3. DO PAGAMENTO</div>
    <p>O valor total da locação é de ${formatCurrency(contract.totalValue)}, a ser pago via ${getPaymentLabel(contract.paymentMethod)}.</p>

    <div class="clause-title">4. OBRIGAÇÕES DA CONTRATADA</div>
    <ul>
      <li>Fornecer as tendas conforme especificações acordadas;</li>
      <li>Realizar a montagem e desmontagem das tendas no local indicado;</li>
      <li>Entregar o material em perfeitas condições de uso;</li>
      <li>Utilizar materiais adequados e mão de obra qualificada.</li>
    </ul>

    <div class="clause-title">5. OBRIGAÇÕES DA CONTRATANTE</div>
    <ul>
      <li>Disponibilizar local adequado para instalação;</li>
      <li>Zelar pela conservação das tendas durante o período de locação;</li>
      <li>Não modificar a estrutura sem autorização prévia da contratada;</li>
      <li>Responsabilizar-se por danos causados por terceiros ou mau uso.</li>
    </ul>

    <div class="clause-title">6. RESPONSABILIDADE POR DANOS</div>

    <div class="clause-sub">6.1 Intempéries e Caso Fortuito / Força Maior</div>
    <p>A CONTRATANTE assume total responsabilidade por danos causados por eventos climáticos extremos, incluindo tempestades, vendavais, chuvas intensas, granizo, enchentes, descargas elétricas e quedas de árvores ou objetos sobre as tendas.</p>

    <div class="clause-sub">6.2 Furto, Roubo, Vandalismo ou Mau Uso</div>
    <p>A CONTRATANTE é integralmente responsável por quaisquer perdas ou danos resultantes de furto, roubo, vandalismo, incêndio ou mau uso dos equipamentos.</p>

    <div class="clause-sub">6.3 Danos Estruturais ou Necessidade de Reparo</div>
    <p>A CONTRATANTE deverá comunicar imediatamente qualquer dano estrutural. Custos de reparo são de responsabilidade da CONTRATANTE quando causados por mau uso ou negligência.</p>

    <div class="clause-sub">6.4 Manutenção Técnica e Deslocamento</div>
    <p>Visitas técnicas emergenciais gerarão custos adicionais de transporte, alimentação e despesas operacionais, a serem suportados pela CONTRATANTE.</p>

    <div class="clause-sub">6.5 Recomendações Técnicas</div>
    <p>A CONTRATANTE se compromete a respeitar as orientações técnicas e evacuar as tendas preventivamente em condições climáticas adversas.</p>

    <div class="clause-sub">6.6 Ressarcimento</div>
    <p>O ressarcimento por danos será realizado mediante relatório técnico elaborado pela CONTRATADA.</p>

    <div class="clause-title">7. RESCISÃO</div>
    <p>O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio, respeitando as penalidades previstas.</p>

    <div class="clause-title">8. DISPOSIÇÕES GERAIS</div>
    <p>O presente instrumento substitui todos os acordos anteriores, verbais ou escritos, entre as partes sobre o objeto deste contrato.</p>

    <div class="clause-title">9. FORO</div>
    <p>Fica eleito o foro da comarca de Palmas/TO para dirimir quaisquer dúvidas oriundas deste contrato.</p>

    <p style="text-align:center;margin-top:10px;font-weight:600;">E, por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor.</p>
  </div>

  <!-- Data -->
  <div class="location-date">
    Palmas/TO, ${format(contract.contractDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
  </div>

  <!-- Assinaturas -->
  <div class="signatures">
    <div class="sig-line">
      <div class="sig-name">${contract.companyData.name}</div>
      <div class="sig-role">LOCADORA (CONTRATADA)</div>
    </div>
    <div class="sig-line">
      <div class="sig-name">${contract.customerName}</div>
      <div class="sig-role">LOCATÁRIA (CONTRATANTE)</div>
    </div>
  </div>

  <!-- Rodapé -->
  <div class="footer">
    <p>${contract.companyData.name} — Tendas &amp; Coberturas | CNPJ: ${contract.companyData.cnpj}</p>
    <p>Este contrato foi gerado eletronicamente e é válido conforme legislação vigente.</p>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Permita popups para imprimir o contrato.');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
