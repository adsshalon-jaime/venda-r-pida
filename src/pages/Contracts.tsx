import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Phone, Mail, Building, User, FileText, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCustomers } from '@/hooks/useCustomers';

interface ContractData {
  clientName: string;
  clientCpfCnpj: string;
  clientAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  clientPhone: string;
  clientEmail: string;
  tentType: 'piramidal' | 'sanfonada' | 'retangular';
  tentDimensions: string;
  tentQuantity: string;
  rentalPeriod: string;
  rentalStartDate: string;
  rentalEndDate: string;
  totalPrice: string;
  paymentMethod: 'vista' | 'parcelado';
  installments?: string;
  contractDate: string;
  contractLocation: string;
  witnessName?: string;
  witnessCpfCnpj?: string;
}

export default function ContractsPage() {
  const { customers } = useCustomers();
  const [contractData, setContractData] = useState<ContractData>({
    clientName: '',
    clientCpfCnpj: '',
    clientAddress: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    clientPhone: '',
    clientEmail: '',
    tentType: 'piramidal',
    tentDimensions: '',
    tentQuantity: '1',
    rentalPeriod: '',
    rentalStartDate: '',
    rentalEndDate: '',
    totalPrice: '',
    paymentMethod: 'vista',
    installments: '',
    contractDate: new Date().toISOString().split('T')[0],
    contractLocation: '',
    witnessName: '',
    witnessCpfCnpj: ''
  });

  const [isRental, setIsRental] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // Logo e informações da empresa
  const companyInfo = {
    name: 'Tenda & Lonas Express',
    cnpj: '12.345.678/0001-23',
    address: 'Rua das Flores, 1234, Centro - São Paulo/SP',
    phone: '(11) 9876-5432',
    email: 'contato@tendaelonexpress.com.br',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxkQAAAABJRU5ErkJggg=='
  };

  useEffect(() => {
    if (selectedClientId && customers.length > 0) {
      const selectedCustomer = customers.find(c => c.id === selectedClientId);
      if (selectedCustomer) {
        setContractData(prev => ({
          ...prev,
          clientName: selectedCustomer.name || '',
          clientCpfCnpj: selectedCustomer.cpfCnpj || '',
          clientAddress: {
            street: selectedCustomer.address?.street || '',
            number: selectedCustomer.address?.number || '',
            neighborhood: selectedCustomer.address?.neighborhood || '',
            city: selectedCustomer.address?.city || '',
            state: selectedCustomer.address?.state || '',
            zipCode: selectedCustomer.address?.zipCode || ''
          },
          clientPhone: selectedCustomer.phone || '',
          clientEmail: selectedCustomer.email || ''
        }));
      }
    }
  }, [selectedClientId, customers]);

  const generateContract = () => {
    const contractText = `
==================================================
CONTRATO DE ${isRental ? 'LOCAÇÃO' : 'VENDA'} DE TENDAS
==================================================

${isRental ? 'LOCAÇÃO' : 'VENDA'} DE TENDAS

${companyInfo.name}
CNPJ: ${companyInfo.cnpj}
Endereço: ${companyInfo.address}
Telefone/WhatsApp: ${companyInfo.phone}
E-mail: ${companyInfo.email}

${isRental ? 'LOCAÇÃO' : 'VENDA'} DE TENDAS

Pelo presente instrumento particular, de um lado:
CONTRATANTE:
Empresa: ${companyInfo.name}
CNPJ: ${companyInfo.cnpj}
Endereço: ${companyInfo.address}
Telefone/WhatsApp: ${companyInfo.phone}
E-mail: ${companyInfo.email}

E, de outro lado:
CONTRATANTE:
Nome/Razão Social: ${contractData.clientName}
CPF/CNPJ: ${contractData.clientCpfCnpj}
Endereço: ${Object.values(contractData.clientAddress).filter(Boolean).join(', ')}
Telefone/WhatsApp: ${contractData.clientPhone}
E-mail: ${contractData.clientEmail}

As partes acima identificadas têm, entre si, justo e contratado o que segue:
${isRental ? 'LOCAÇÃO' : 'VENDA'} DE TENDAS

•	Tenda ${contractData.tentType}
•	${contractData.tentDimensions}
•	Quantidade: ${contractData.tentQuantity}

Nos seguintes tamanhos e especificações:
Tipo de Tenda: ${contractData.tentType}
Dimensões: ${contractData.tentDimensions}
Quantidade: ${contractData.tentQuantity}

${isRental ? `
PRAZO DE LOCAÇÃO:
Início: ${contractData.rentalStartDate}
Término: ${contractData.rentalEndDate}
Período: ${contractData.rentalPeriod}
` : ''}

VALOR E CONDIÇÕES DE PAGAMENTO:
O valor total deste contrato é de R$ ${contractData.totalPrice}, referente à:
☐ Venda
☐ Locação

${!isRental && contractData.paymentMethod === 'parcelado' ? `
Forma de pagamento: Parcelado em ${contractData.installments} vezes
` : ''}

${isRental ? `
O não pagamento nas datas acordadas poderá acarretar suspensão do serviço ou aplicação de multa.
` : ''}

OBRIGAÇÕES DA CONTRATADA:
•	Fornecer as tendas conforme especificações acordadas;
•	Realizar a montagem e desmontagem (quando incluso);
•	Entregar o material em boas condições de uso;
•	Utilizar materiais adequados e de boa qualidade;
•	Zelar pela conservação do material durante a locação;
•	Não modificar, desmontar ou transferir a tenda sem autorização;
•	Responsabilizar-se por danos, perdas, roubos ou queima.

OBRIGAÇÕES DA CONTRATANTE:
•	Disponibilizar local adequado para instalação da tenda;
•	Zelar pela conservação do material durante a locação;
•	Não modificar, desmontar ou transferir a tenda sem autorização;
•	Responsabilizar-se por danos, perdas, roubos ou queima;
•	Devolver o material em boas condições de conservação e limpeza;
•	Pagar os valores alugados nos dias acordados;
•	Comunicar qualquer problema ou necessidade de manutenção.

RESPONSABILIDADE POR DANOS:
Em caso de avarias, perdas, rasgos, queima ou danos estruturais, a CONTRATANTE se compromete a arcar com os custos de reparo ou reposição do material, respeitando os valores proporcionais já executados ou custos operacionais envolvidos.

FORO:
Este contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 dias, respeitando os valores proporcionais já executados ou custos operacionais envolvidos.

DISPOSIÇÕES GERAIS:
•	Este contrato é válido para todo o território nacional;
•	O presente instrumento substitui quaisquer acordos verbais;
•	As partes declaram estar de acordo com todas as cláusulas aqui descritas;
•	Em caso de litígio, as partes concordam com a competência do Foro da Comarca de ${contractData.contractLocation}.

Local e data: ${contractData.contractLocation}, ${format(new Date(contractData.contractDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}

${contractData.witnessName ? `
TESTEMUNHAS:
Contratante: ${contractData.clientName} - ${contractData.clientCpfCnpj}
Testemunha: ${contractData.witnessName} - ${contractData.witnessCpfCnpj}
` : ''}

ASSINATURAS:
CONTRATANTE: _______________________________
CONTRATANTE: _______________________________

E, por estarem assim justos e contratados, assinam o presente instrumento em duas vias de igual teor, na presença das testemunhas abaixo nomeadas e qualificadas.

Local e data: ${contractData.contractLocation}, ${format(new Date(contractData.contractDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
==================================================
    `;

    const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrato-${isRental ? 'locacao' : 'venda'}-tenda-${contractData.clientName.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'dd-MM-yyyy')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printContract = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(contractContent);
    printWindow.document.close();
  };

  const resetForm = () => {
    setContractData({
      clientName: '',
      clientCpfCnpj: '',
      clientAddress: '',
      clientPhone: '',
      clientEmail: '',
      tentType: 'piramidal',
      tentDimensions: '',
      tentQuantity: '1',
      rentalPeriod: '',
      rentalStartDate: '',
      rentalEndDate: '',
      totalPrice: '',
      paymentMethod: 'vista',
      installments: '',
      contractDate: new Date().toISOString().split('T')[0],
      contractLocation: '',
      witnessName: '',
      witnessCpfCnpj: ''
    });
    setIsRental(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            {/* Logo da Empresa */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              <img 
                src={companyInfo.logo}
                alt={companyInfo.name}
                className="w-10 h-10"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {companyInfo.name}
              </h1>
              <p className="text-gray-600 text-lg">
                Sistema de Contratos
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Crie contratos personalizados com logo da empresa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Gerar Contrato
              </CardTitle>
              <CardDescription>
                Preencha os dados para gerar um contrato personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de Contrato */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Tipo de Contrato</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsRental(false)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      !isRental
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="font-semibold">Venda</div>
                      <div className="text-sm opacity-75">Contrato definitivo</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRental(true)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isRental
                        ? 'border-orange-600 bg-orange-600 text-white shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏕</div>
                      <div className="font-semibold">Locação</div>
                      <div className="text-sm opacity-75">Contrato temporário</div>
                    </div>
                  </button>
                </div>
              </div>

              <Separator />

              {/* Dados do Cliente */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Dados do Cliente</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nome do Cliente</Label>
                    <div className="flex gap-2">
                      <Input
                        id="clientName"
                        value={contractData.clientName}
                        onChange={(e) => setContractData(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Nome completo do cliente"
                        className="h-11"
                      />
                      <select
                        id="clientSelect"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="h-11 border border-gray-300 rounded-lg px-3"
                      >
                        <option value="">Selecione um cliente...</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientCpfCnpj">CPF/CNPJ</Label>
                    <Input
                      id="clientCpfCnpj"
                      value={contractData.clientCpfCnpj}
                      onChange={(e) => setContractData(prev => ({ ...prev, clientCpfCnpj: e.target.value }))}
                      placeholder="CPF para pessoa física ou CNPJ para empresa"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Endereço Completo</Label>
                  <Input
                    id="clientAddress"
                    value={contractData.clientAddress.street}
                    onChange={(e) => setContractData(prev => ({ ...prev, clientAddress: { ...prev.clientAddress, street: e.target.value } }))}
                    placeholder="Rua, número, bairro, cidade, estado, CEP"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefone/WhatsApp</Label>
                    <Input
                      id="clientPhone"
                      value={contractData.clientPhone}
                      onChange={(e) => setContractData(prev => ({ ...prev, clientPhone: e.target.value }))}
                      placeholder="(DDD) 00000-0000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">E-mail</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={contractData.clientEmail}
                      onChange={(e) => setContractData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      placeholder="cliente@exemplo.com"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dados da Tenda */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Dados da Tenda</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tentType">Tipo de Tenda</Label>
                    <select
                      id="tentType"
                      value={contractData.tentType}
                      onChange={(e) => setContractData(prev => ({ ...prev, tentType: e.target.value as any }))}
                      className="h-11 border border-gray-300 rounded-lg px-3"
                    >
                      <option value="piramidal">Piramidal</option>
                      <option value="sanfonada">Sanfonada</option>
                      <option value="retangular">Retangular</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tentDimensions">Dimensões</Label>
                    <Input
                      id="tentDimensions"
                      value={contractData.tentDimensions}
                      onChange={(e) => setContractData(prev => ({ ...prev, tentDimensions: e.target.value }))}
                      placeholder="Ex: 3x3m, 5x5m, 6x8m"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tentQuantity">Quantidade</Label>
                    <Input
                      id="tentQuantity"
                      type="number"
                      min="1"
                      value={contractData.tentQuantity}
                      onChange={(e) => setContractData(prev => ({ ...prev, tentQuantity: e.target.value }))}
                      placeholder="Número de tendas"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Dados de Locação (apenas se for locação) */}
              {isRental && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Dados da Locação</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rentalStartDate">Data de Início</Label>
                        <Input
                          id="rentalStartDate"
                          type="date"
                          value={contractData.rentalStartDate}
                          onChange={(e) => setContractData(prev => ({ ...prev, rentalStartDate: e.target.value }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rentalEndDate">Data de Término</Label>
                        <Input
                          id="rentalEndDate"
                          type="date"
                          value={contractData.rentalEndDate}
                          onChange={(e) => setContractData(prev => ({ ...prev, rentalEndDate: e.target.value }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rentalPeriod">Período</Label>
                        <Input
                          id="rentalPeriod"
                          value={contractData.rentalPeriod}
                          onChange={(e) => setContractData(prev => ({ ...prev, rentalPeriod: e.target.value }))}
                          placeholder="Ex: 7 dias, 15 dias, 1 mês"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Valores */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Valores</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalPrice">Valor Total (R$)</Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={contractData.totalPrice}
                      onChange={(e) => setContractData(prev => ({ ...prev, totalPrice: e.target.value }))}
                      placeholder="0,00"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                    <select
                      id="paymentMethod"
                      value={contractData.paymentMethod}
                      onChange={(e) => setContractData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="h-11 border border-gray-300 rounded-lg px-3"
                    >
                      <option value="vista">À vista</option>
                      <option value="parcelado">Parcelado</option>
                    </select>
                  </div>
                </div>

                {/* Parcelas (apenas se for parcelado) */}
                {contractData.paymentMethod === 'parcelado' && (
                  <div className="space-y-2">
                    <Label htmlFor="installments">Número de Parcelas</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="2"
                      max="12"
                      value={contractData.installments}
                      onChange={(e) => setContractData(prev => ({ ...prev, installments: e.target.value }))}
                      placeholder="Ex: 3x, 6x, 12x"
                      className="h-11"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Dados do Contrato */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Dados do Contrato</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractDate">Data do Contrato</Label>
                    <Input
                      id="contractDate"
                      type="date"
                      value={contractData.contractDate}
                      onChange={(e) => setContractData(prev => ({ ...prev, contractDate: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractLocation">Local do Contrato</Label>
                    <Input
                      id="contractLocation"
                      value={contractData.contractLocation}
                      onChange={(e) => setContractData(prev => ({ ...prev, contractLocation: e.target.value }))}
                      placeholder="Cidade, Estado"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Testemunhas */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Testemunhas (Opcional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="witnessName">Nome da Testemunha</Label>
                    <Input
                      id="witnessName"
                      value={contractData.witnessName}
                      onChange={(e) => setContractData(prev => ({ ...prev, witnessName: e.target.value }))}
                      placeholder="Nome completo"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="witnessCpfCnpj">CPF/CNPJ da Testemunha</Label>
                    <Input
                      id="witnessCpfCnpj"
                      value={contractData.witnessCpfCnpj}
                      onChange={(e) => setContractData(prev => ({ ...prev, witnessCpfCnpj: e.target.value }))}
                      placeholder="CPF ou CNPJ"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={resetForm}>
                Limpar Formulário
              </Button>
              <Button onClick={generateContract} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Gerar Contrato
              </Button>
              <Button variant="outline" onClick={printContract}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </CardFooter>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Preview do Contrato
              </CardTitle>
              <CardDescription>
                Visualização prévia do contrato que será gerado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Building className="w-8 h-8 text-blue-600" />
                    <span className="text-xl font-bold text-gray-900">
                      Tenda ${contractData.tentType || 'Piramidal'}
                    </span>
                  </div>
                  <Badge variant={isRental ? "destructive" : "default"} className="mb-4">
                    {isRental ? "LOCAÇÃO" : "VENDA"}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Cliente:</span>
                      <p className="text-gray-700">{contractData.clientName || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="font-semibold">CPF/CNPJ:</span>
                      <p className="text-gray-700">{contractData.clientCpfCnpj || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold">Endereço:</span>
                    <p className="text-gray-700">{contractData.clientAddress || 'Não informado'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Telefone:</span>
                      <p className="text-gray-700">{contractData.clientPhone || 'Não informado'}</p>
                    </div>
                    <div>
                      <span className="font-semibold">E-mail:</span>
                      <p className="text-gray-700">{contractData.clientEmail || 'Não informado'}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold">Especificações:</span>
                    <p className="text-gray-700">
                      Tipo: {contractData.tentType || 'Não informado'}<br />
                      Dimensões: {contractData.tentDimensions || 'Não informado'}<br />
                      Quantidade: {contractData.tentQuantity || 'Não informado'}
                    </p>
                  </div>

                  {isRental && (
                    <div className="mt-4">
                      <span className="font-semibold">Período de Locação:</span>
                      <p className="text-gray-700">
                        Início: {contractData.rentalStartDate || 'Não informado'}<br />
                        Término: {contractData.rentalEndDate || 'Não informado'}<br />
                        Período: {contractData.rentalPeriod || 'Não informado'}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    <span className="font-semibold">Valor Total:</span>
                    <p className="text-gray-700 text-lg font-bold">
                      R$ {contractData.totalPrice || '0,00'}
                    </p>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold">Pagamento:</span>
                    <p className="text-gray-700">
                      {contractData.paymentMethod === 'vista' ? 'À vista' : `Parcelado em ${contractData.installments} vezes`}
                    </p>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold">Local do Contrato:</span>
                    <p className="text-gray-700">
                      {contractData.contractLocation || 'Não informado'}
                    </p>
                  </div>

                  <div className="mt-4">
                    <span className="font-semibold">Data do Contrato:</span>
                    <p className="text-gray-700">
                      {contractData.contractDate ? format(new Date(contractData.contractDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não informada'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
