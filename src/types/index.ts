export type ProductCategory = 'lona' | 'tenda';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  standardMeterage: number;
  basePrice: number;
  pricePerSquareMeter: boolean;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
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
  createdAt: Date;
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
