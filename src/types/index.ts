export type ProductCategory = 'lona' | 'tenda' | 'ferragem';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  standardMeterage: number;
  basePrice: number;
  pricePerSquareMeter: boolean;
  isRental: boolean;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  cpfCnpj?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao' | 'fiado';

export interface PaymentInfo {
  method: PaymentMethod;
  entryValue?: number; // Valor da entrada (para cartão)
  installments?: number; // Quantidade de parcelas (para cartão)
  dueDate?: Date; // Data de vencimento (para fiado)
}

export interface RentalInfo {
  deliveryDate: Date; // Data de montagem/entrega
  deliveryTime?: string; // Horário de entrega
  removalDate: Date; // Data de remoção
  installationAddress?: string; // Endereço de montagem
  serviceOrderNumber?: string; // Número da ordem de serviço
  isRemoved?: boolean; // Se já foi removida
}

export type QuoteStatus = 'pending' | 'approved' | 'rejected' | 'converted';

export type QuotePaymentMethod = 'cartao' | 'boleto' | 'transferencia' | 'pix';

export interface QuotePaymentInfo {
  method: QuotePaymentMethod;
  installments?: number; // Número de parcelas (apenas para cartão)
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string; // Número do orçamento (ex: ORC-20260317-001)
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: QuoteItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  deliveryAddress: string;
  deliveryDeadline: string; // Prazo de entrega (ex: "5 dias úteis")
  validUntil: Date; // Validade do orçamento
  paymentInfo: QuotePaymentInfo; // Forma de pagamento
  notes?: string; // Observações
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
  convertedToSaleId?: string; // ID da venda quando convertido
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  quantity?: number;
  width?: number;
  length?: number;
  squareMeters?: number;
  totalValue: number;
  customerId?: string;
  customerName?: string;
  saleDate: Date;
  isRental: boolean;
  createdAt: Date;
  paymentInfo?: PaymentInfo;
  rentalInfo?: RentalInfo; // Informações de locação
}

export interface DashboardMetrics {
  monthlyRevenue: number;
  revenueGrowth: number;
  totalSquareMeters: number;
  squareMetersGrowth: number;
  totalSales: number;
  lonasSold: number;
  tendasSold: number;
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  backupPhone?: string;
  entryDate: string;
  exitDate?: string;
  workHours: string;
  lunchBreak: string;
  salary: number;
  workSchedule: string[];
}

export interface Payroll {
  id: string;
  employeeId: string;
  employee: Employee;
  referenceMonth: string;
  referenceYear: number;
  grossSalary: number;
  deductions: {
    inss: number;
    fgts: number;
    irrf: number;
    other: number;
    total: number;
  };
  additions: {
    overtime: number;
    bonuses: number;
    vacation: number;
    thirteenth: number;
    other: number;
    total: number;
  };
  netSalary: number;
  paymentDate: string;
  employerName: string;
  employerDocument: string;
  employerAddress: string;
  createdAt: Date;
}
