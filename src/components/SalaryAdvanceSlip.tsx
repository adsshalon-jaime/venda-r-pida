import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency, getMonthName } from '@/utils/payrollCalculations';

interface SalaryAdvance {
  id: string;
  employee: {
    name: string;
    cpf: string;
    address: {
      street: string;
      number: string;
      city: string;
      state: string;
    };
  };
  referenceMonth: string;
  referenceYear: number;
  advanceAmount: number;
  advancePercentage: number;
  grossSalary: number;
  paymentDate: string;
  employerName: string;
  employerDocument: string;
  employerAddress: string;
}

interface SalaryAdvanceSlipProps {
  advance: SalaryAdvance;
}

export function SalaryAdvanceSlip({ advance }: SalaryAdvanceSlipProps) {
  const handlePrint = async () => {
    const slip1 = document.getElementById('advance-via-empregador');
    const slip2 = document.getElementById('advance-via-empregado');
    
    if (!slip1 || !slip2) return;

    try {
      const canvas1 = await html2canvas(slip1, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const canvas2 = await html2canvas(slip2, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;

      const imgHeight1 = (canvas1.height * imgWidth) / canvas1.width;
      const imgData1 = canvas1.toDataURL('image/png');
      pdf.addImage(imgData1, 'PNG', 0, 0, imgWidth, imgHeight1);

      pdf.addPage();
      const imgHeight2 = (canvas2.height * imgWidth) / canvas2.width;
      const imgData2 = canvas2.toDataURL('image/png');
      pdf.addImage(imgData2, 'PNG', 0, 0, imgWidth, imgHeight2);

      pdf.save(`adiantamento_2vias_${advance.employee.name}_${advance.referenceMonth}_${advance.referenceYear}.pdf`);
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
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg flex items-center gap-2"
        >
          🖨️ Imprimir 2 Vias (Adiantamento)
        </button>
      </div>
      
      {/* 1ª VIA - EMPREGADOR */}
      <div 
        id="advance-via-empregador"
        className="bg-white p-8 max-w-4xl mx-auto mb-8 border-2 border-purple-300 rounded-lg shadow-lg"
        style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Cabeçalho */}
        <div className="text-center mb-6 border-b-2 border-purple-600 pb-4">
          <h1 className="text-2xl font-bold text-purple-700">RECIBO DE ADIANTAMENTO SALARIAL</h1>
          <div className="text-sm text-gray-600 mt-2">
            Mês de Referência: {getMonthName(advance.referenceMonth)} / {advance.referenceYear}
          </div>
        </div>

        {/* Dados do Empregador */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">DADOS DO EMPREGADOR</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Razão Social:</strong> {advance.employerName}</div>
            <div><strong>CNPJ/CPF:</strong> {advance.employerDocument}</div>
            <div className="col-span-2"><strong>Endereço:</strong> {advance.employerAddress}</div>
          </div>
        </div>

        {/* Dados do Empregado */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">DADOS DO EMPREGADO</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Nome:</strong> {advance.employee.name}</div>
            <div><strong>CPF:</strong> {advance.employee.cpf}</div>
            <div><strong>Endereço:</strong> {advance.employee.address.street}, {advance.employee.address.number}</div>
            <div><strong>Cidade/UF:</strong> {advance.employee.address.city} - {advance.employee.address.state}</div>
          </div>
        </div>

        {/* Valores do Adiantamento */}
        <div className="mb-6 bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
          <h2 className="font-bold text-lg mb-4 text-purple-700">VALORES DO ADIANTAMENTO</h2>
          
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-3"><strong>Salário Bruto do Mês:</strong></td>
                <td className="text-right py-3 font-semibold">{formatCurrency(advance.grossSalary)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><strong>Percentual do Adiantamento:</strong></td>
                <td className="text-right py-3 font-semibold">{advance.advancePercentage.toFixed(2)}%</td>
              </tr>
              <tr className="bg-purple-100">
                <td className="py-4"><strong className="text-lg">VALOR DO ADIANTAMENTO:</strong></td>
                <td className="text-right py-4">
                  <span className="text-2xl font-bold text-purple-700">
                    {formatCurrency(advance.advanceAmount)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
            <p className="font-semibold text-yellow-800">⚠️ IMPORTANTE:</p>
            <p className="text-yellow-700 mt-1">
              Este valor será automaticamente descontado no holerite de pagamento final do mês de {getMonthName(advance.referenceMonth)}/{advance.referenceYear}.
            </p>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="mt-8 pt-8 border-t-2 border-purple-600">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-b-2 border-black mb-2 pb-8">
                <span className="text-sm font-semibold">Assinatura do Empregador</span>
              </div>
              <div className="text-xs text-gray-600">
                {advance.employerName}
              </div>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-black mb-2 pb-8">
                <span className="text-sm font-semibold">Assinatura do Empregado</span>
              </div>
              <div className="text-xs text-gray-600">
                {advance.employee.name}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
          <div>Data de Pagamento: {new Date(advance.paymentDate).toLocaleDateString('pt-BR')}</div>
          <div className="mt-1 font-bold text-purple-600">
            1ª VIA - EMPREGADOR
          </div>
        </div>
      </div>

      {/* 2ª VIA - EMPREGADO */}
      <div 
        id="advance-via-empregado"
        className="bg-white p-8 max-w-4xl mx-auto border-2 border-green-300 rounded-lg shadow-lg"
        style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}
      >
        {/* Cabeçalho */}
        <div className="text-center mb-6 border-b-2 border-green-600 pb-4">
          <h1 className="text-2xl font-bold text-green-700">RECIBO DE ADIANTAMENTO SALARIAL</h1>
          <div className="text-sm text-gray-600 mt-2">
            <span className="text-green-600 font-bold">2ª VIA - EMPREGADO</span>
            <br />
            Mês de Referência: {getMonthName(advance.referenceMonth)} / {advance.referenceYear}
          </div>
        </div>

        {/* Dados do Empregador */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">DADOS DO EMPREGADOR</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Razão Social:</strong> {advance.employerName}</div>
            <div><strong>CNPJ/CPF:</strong> {advance.employerDocument}</div>
            <div className="col-span-2"><strong>Endereço:</strong> {advance.employerAddress}</div>
          </div>
        </div>

        {/* Dados do Empregado */}
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2 border-b border-gray-300 pb-1">DADOS DO EMPREGADO</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Nome:</strong> {advance.employee.name}</div>
            <div><strong>CPF:</strong> {advance.employee.cpf}</div>
            <div><strong>Endereço:</strong> {advance.employee.address.street}, {advance.employee.address.number}</div>
            <div><strong>Cidade/UF:</strong> {advance.employee.address.city} - {advance.employee.address.state}</div>
          </div>
        </div>

        {/* Valores do Adiantamento */}
        <div className="mb-6 bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h2 className="font-bold text-lg mb-4 text-green-700">VALORES DO ADIANTAMENTO</h2>
          
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-3"><strong>Salário Bruto do Mês:</strong></td>
                <td className="text-right py-3 font-semibold">{formatCurrency(advance.grossSalary)}</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><strong>Percentual do Adiantamento:</strong></td>
                <td className="text-right py-3 font-semibold">{advance.advancePercentage.toFixed(2)}%</td>
              </tr>
              <tr className="bg-green-100">
                <td className="py-4"><strong className="text-lg">VALOR RECEBIDO:</strong></td>
                <td className="text-right py-4">
                  <span className="text-2xl font-bold text-green-700">
                    {formatCurrency(advance.advanceAmount)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
            <p className="font-semibold text-yellow-800">⚠️ ATENÇÃO:</p>
            <p className="text-yellow-700 mt-1">
              Este valor será descontado automaticamente no seu holerite de pagamento final do mês de {getMonthName(advance.referenceMonth)}/{advance.referenceYear}.
            </p>
          </div>
        </div>

        {/* Assinatura do Empregado */}
        <div className="mt-8 pt-8 border-t-2 border-green-600">
          <div className="text-center">
            <div className="border-b-2 border-black mb-2 pb-12">
              <span className="text-sm font-semibold">Assinatura do Empregado</span>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              {advance.employee.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Declaro ter recebido o valor de adiantamento salarial discriminado neste recibo
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
          <div>Data de Pagamento: {new Date(advance.paymentDate).toLocaleDateString('pt-BR')}</div>
          <div className="mt-1 font-bold text-green-600">
            2ª VIA - EMPREGADO
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Guarde este documento para controle pessoal
          </div>
        </div>
      </div>
    </div>
  );
}
