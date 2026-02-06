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
