import { Payroll } from '@/types';
import { formatCurrency, getMonthName } from '@/utils/payrollCalculations';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PayrollSlipProps {
  payroll: Payroll;
  isDuplicate?: boolean;
}

export function PayrollSlip({ payroll, isDuplicate = false }: PayrollSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    const slip1 = document.getElementById('via-empregador');
    const slip2 = document.getElementById('via-empregado');
    
    if (!slip1 || !slip2) return;

    try {
      // Capturar 1ª via (Empregador)
      const canvas1 = await html2canvas(slip1, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Capturar 2ª via (Empregado)
      const canvas2 = await html2canvas(slip2, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;

      // Adicionar 1ª via
      const imgHeight1 = (canvas1.height * imgWidth) / canvas1.width;
      const imgData1 = canvas1.toDataURL('image/png');
      pdf.addImage(imgData1, 'PNG', 0, 0, imgWidth, imgHeight1);

      // Adicionar 2ª via em nova página
      pdf.addPage();
      const imgHeight2 = (canvas2.height * imgWidth) / canvas2.width;
      const imgData2 = canvas2.toDataURL('image/png');
      pdf.addImage(imgData2, 'PNG', 0, 0, imgWidth, imgHeight2);

      pdf.save(`holerite_2vias_${payroll.employee.name}_${payroll.referenceMonth}_${payroll.referenceYear}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg flex items-center gap-2"
        >
          🖨️ Imprimir 2 Vias (Empregador + Empregado)
        </button>
      </div>
      
      {/* 1ª VIA - EMPREGADOR */}
      <div 
        id="via-empregador"
        className="bg-white p-8 max-w-4xl mx-auto mb-8 border-2 border-gray-300 rounded-lg shadow-lg"
        style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Cabeçalho */}
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold mb-2">HOLERITE / RECIBO DE PAGAMENTO</h1>
          <div className="text-sm text-gray-600">
            {isDuplicate && <span className="text-red-600 font-bold">2ª VIA - </span>}
            Mês de Referência: {getMonthName(payroll.referenceMonth)} / {payroll.referenceYear}
          </div>
        </div>

        {/* Dados do Empregador */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">DADOS DO EMPREGADOR</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Razão Social:</strong> {payroll.employerName}</div>
            <div><strong>CNPJ/CPF:</strong> {payroll.employerDocument}</div>
            <div className="col-span-2"><strong>Endereço:</strong> {payroll.employerAddress}</div>
          </div>
        </div>

        {/* Dados do Empregado */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">DADOS DO EMPREGADO</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Nome:</strong> {payroll.employee.name}</div>
            <div><strong>CPF:</strong> {payroll.employee.cpf}</div>
            <div><strong>Endereço:</strong> {payroll.employee.address.street}, {payroll.employee.address.number}</div>
            <div><strong>Cidade/UF:</strong> {payroll.employee.address.city} - {payroll.employee.address.state}</div>
          </div>
        </div>

        {/* Cálculos */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">CÁLCULOS</h2>
          
          {/* Proventos */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">PROVENTOS</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1">Descrição</th>
                  <th className="text-right py-1">Referência</th>
                  <th className="text-right py-1">Vencimentos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1">Salário Base</td>
                  <td className="text-right">Mensal</td>
                  <td className="text-right">{formatCurrency(payroll.employee.salary)}</td>
                </tr>
                {payroll.additions.overtime > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1">Horas Extras</td>
                    <td className="text-right">Variável</td>
                    <td className="text-right">{formatCurrency(payroll.additions.overtime)}</td>
                  </tr>
                )}
                {payroll.additions.bonuses > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1">Bonificações</td>
                    <td className="text-right">Variável</td>
                    <td className="text-right">{formatCurrency(payroll.additions.bonuses)}</td>
                  </tr>
                )}
                {payroll.additions.vacation > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1">Férias</td>
                    <td className="text-right">Variável</td>
                    <td className="text-right">{formatCurrency(payroll.additions.vacation)}</td>
                  </tr>
                )}
                {payroll.additions.thirteenth > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1">13º Salário</td>
                    <td className="text-right">Variável</td>
                    <td className="text-right">{formatCurrency(payroll.additions.thirteenth)}</td>
                  </tr>
                )}
                {payroll.additions.other > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1">Outros Adicionais</td>
                    <td className="text-right">Variável</td>
                    <td className="text-right">{formatCurrency(payroll.additions.other)}</td>
                  </tr>
                )}
                <tr className="font-bold border-t-2 border-black">
                  <td className="py-2">TOTAL DE PROVENTOS</td>
                  <td></td>
                  <td className="text-right">{formatCurrency(payroll.grossSalary)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deduções */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">DEDUÇÕES</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1">Descrição</th>
                  <th className="text-right py-1">Referência</th>
                  <th className="text-right py-1">Descontos</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-1">INSS</td>
                  <td className="text-right">Previdência</td>
                  <td className="text-right">{formatCurrency(payroll.deductions.inss)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-1">FGTS</td>
                  <td className="text-right">Depósito</td>
                  <td className="text-right">{formatCurrency(payroll.deductions.fgts)}</td>
                </tr>
                {payroll.deductions.irrf > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1">IRRF</td>
                    <td className="text-right">Imposto Renda</td>
                    <td className="text-right">{formatCurrency(payroll.deductions.irrf)}</td>
                  </tr>
                )}
                {payroll.deductions.other > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1">Outras Deduções</td>
                    <td className="text-right">Variável</td>
                    <td className="text-right">{formatCurrency(payroll.deductions.other)}</td>
                  </tr>
                )}
                <tr className="font-bold border-t-2 border-black">
                  <td className="py-2">TOTAL DE DEDUÇÕES</td>
                  <td></td>
                  <td className="text-right">{formatCurrency(payroll.deductions.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resumo */}
          <div className="border-t-4 border-black pt-4">
            <table className="w-full">
              <tr className="text-lg font-bold">
                <td className="py-2">SALÁRIO LÍQUIDO:</td>
                <td className="text-right py-2">{formatCurrency(payroll.netSalary)}</td>
              </tr>
            </table>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="mt-8 pt-8 border-t-2 border-black">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-b border-black mb-2 pb-8">
                <span className="text-sm">Assinatura do Empregador</span>
              </div>
              <div className="text-xs text-gray-600">
                {payroll.employerName}
              </div>
            </div>
            <div className="text-center">
              <div className="border-b border-black mb-2 pb-8">
                <span className="text-sm">Assinatura do Empregado</span>
              </div>
              <div className="text-xs text-gray-600">
                {payroll.employee.name}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
          <div>Data de Pagamento: {new Date(payroll.paymentDate).toLocaleDateString('pt-BR')}</div>
          <div className="mt-1 font-bold text-blue-600">
            1ª VIA - EMPREGADOR
          </div>
        </div>
      </div>

      {/* 2ª VIA - EMPREGADO */}
      <div 
        id="via-empregado"
        className="bg-white p-8 max-w-4xl mx-auto border-2 border-green-300 rounded-lg shadow-lg"
        style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Cabeçalho */}
        <div className="text-center mb-6 border-b-2 border-green-600 pb-4">
          <h1 className="text-2xl font-bold mb-2 text-green-700">HOLERITE / RECIBO DE PAGAMENTO</h1>
          <div className="text-sm text-gray-600">
            <span className="text-green-600 font-bold">2ª VIA - EMPREGADO</span>
            <br />
            Mês de Referência: {getMonthName(payroll.referenceMonth)} / {payroll.referenceYear}
          </div>
        </div>

        {/* Dados do Empregador */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">DADOS DO EMPREGADOR</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Razão Social:</strong> {payroll.employerName}</div>
            <div><strong>CNPJ/CPF:</strong> {payroll.employerDocument}</div>
            <div className="col-span-2"><strong>Endereço:</strong> {payroll.employerAddress}</div>
          </div>
        </div>

        {/* Dados do Empregado */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">DADOS DO EMPREGADO</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Nome:</strong> {payroll.employee.name}</div>
            <div><strong>CPF:</strong> {payroll.employee.cpf}</div>
            <div><strong>Endereço:</strong> {payroll.employee.address.street}, {payroll.employee.address.number}</div>
            <div><strong>Cidade/UF:</strong> {payroll.employee.address.city} - {payroll.employee.address.state}</div>
          </div>
        </div>

        {/* Cálculos */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">CÁLCULOS</h2>
          
          {/* Proventos */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">PROVENTOS</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-right p-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Salário Base</td>
                  <td className="text-right p-2">{formatCurrency(payroll.grossSalary)}</td>
                </tr>
                {payroll.additions.overtime > 0 && (
                  <tr>
                    <td className="p-2">Horas Extras</td>
                    <td className="text-right p-2">{formatCurrency(payroll.additions.overtime)}</td>
                  </tr>
                )}
                {payroll.additions.bonuses > 0 && (
                  <tr>
                    <td className="p-2">Bonificações</td>
                    <td className="text-right p-2">{formatCurrency(payroll.additions.bonuses)}</td>
                  </tr>
                )}
                {payroll.additions.vacation > 0 && (
                  <tr>
                    <td className="p-2">Férias</td>
                    <td className="text-right p-2">{formatCurrency(payroll.additions.vacation)}</td>
                  </tr>
                )}
                {payroll.additions.thirteenth > 0 && (
                  <tr>
                    <td className="p-2">13º Salário</td>
                    <td className="text-right p-2">{formatCurrency(payroll.additions.thirteenth)}</td>
                  </tr>
                )}
                {payroll.additions.other > 0 && (
                  <tr>
                    <td className="p-2">Outros Adicionais</td>
                    <td className="text-right p-2">{formatCurrency(payroll.additions.other)}</td>
                  </tr>
                )}
                <tr className="font-bold bg-green-50">
                  <td className="p-2">TOTAL DE PROVENTOS</td>
                  <td className="text-right p-2">{formatCurrency(payroll.grossSalary + payroll.additions.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Deduções */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">DEDUÇÕES</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-2">Descrição</th>
                  <th className="text-right p-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {payroll.deductions.inss > 0 && (
                  <tr>
                    <td className="p-2">INSS</td>
                    <td className="text-right p-2 text-red-600">-{formatCurrency(payroll.deductions.inss)}</td>
                  </tr>
                )}
                {payroll.deductions.fgts > 0 && (
                  <tr>
                    <td className="p-2">FGTS</td>
                    <td className="text-right p-2 text-red-600">-{formatCurrency(payroll.deductions.fgts)}</td>
                  </tr>
                )}
                {payroll.deductions.irrf > 0 && (
                  <tr>
                    <td className="p-2">IRRF</td>
                    <td className="text-right p-2 text-red-600">-{formatCurrency(payroll.deductions.irrf)}</td>
                  </tr>
                )}
                {payroll.deductions.other > 0 && (
                  <tr>
                    <td className="p-2">Outras Deduções</td>
                    <td className="text-right p-2 text-red-600">-{formatCurrency(payroll.deductions.other)}</td>
                  </tr>
                )}
                <tr className="font-bold bg-red-50">
                  <td className="p-2">TOTAL DE DEDUÇÕES</td>
                  <td className="text-right p-2 text-red-600">-{formatCurrency(payroll.deductions.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Resumo */}
          <div className="border-t-4 border-green-600 pt-4">
            <table className="w-full">
              <tr className="text-lg font-bold">
                <td className="py-2">SALÁRIO LÍQUIDO:</td>
                <td className="text-right py-2 text-green-700">{formatCurrency(payroll.netSalary)}</td>
              </tr>
            </table>
          </div>
        </div>

        {/* Assinatura do Empregado */}
        <div className="mt-8 pt-8 border-t-2 border-green-600">
          <div className="text-center">
            <div className="border-b-2 border-black mb-2 pb-12">
              <span className="text-sm font-semibold">Assinatura do Empregado</span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              {payroll.employee.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Declaro ter recebido a importância líquida discriminada neste recibo
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
          <div>Data de Pagamento: {new Date(payroll.paymentDate).toLocaleDateString('pt-BR')}</div>
          <div className="mt-1 font-bold text-green-600">
            2ª VIA - EMPREGADO
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Guarde este documento para controle pessoal
          </div>
        </div>
      </div>

      {/* Remover código antigo da segunda via */}
      {false && (
        <div className="mt-8 page-break">
          <div 
            className="bg-white p-8 max-w-4xl mx-auto"
            style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}
          >
            {/* Cabeçalho da segunda via */}
            <div className="text-center mb-6 border-b-2 border-black pb-4">
              <h1 className="text-2xl font-bold mb-2 text-red-600">2ª VIA - HOLERITE</h1>
              <div className="text-sm text-gray-600">
                Mês de Referência: {getMonthName(payroll.referenceMonth)} / {payroll.referenceYear}
              </div>
            </div>

            {/* Resumo simplificado para segunda via */}
            <div className="mb-6">
              <h2 className="font-bold text-lg mb-2">RESUMO DO PAGAMENTO</h2>
              <table className="w-full text-sm">
                <tr>
                  <td className="py-1"><strong>Empregado:</strong> {payroll.employee.name}</td>
                  <td className="py-1"><strong>CPF:</strong> {payroll.employee.cpf}</td>
                </tr>
                <tr>
                  <td className="py-1"><strong>Salário Bruto:</strong> {formatCurrency(payroll.grossSalary)}</td>
                  <td className="py-1"><strong>Salário Líquido:</strong> {formatCurrency(payroll.netSalary)}</td>
                </tr>
              </table>
            </div>

            {/* Assinatura apenas do empregado na segunda via */}
            <div className="mt-8 pt-8">
              <div className="text-center">
                <div className="border-b border-black mb-2 pb-8">
                  <span className="text-sm">Assinatura do Empregado</span>
                </div>
                <div className="text-xs text-gray-600">
                  {payroll.employee.name}
                </div>
              </div>
            </div>

            {/* Rodapé da segunda via */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
              <div>2ª VIA - Empregado</div>
              <div className="mt-1">Documento para controle pessoal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
