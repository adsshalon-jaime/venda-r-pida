export interface SavedReport {
  id: string;
  title: string;
  type: 'sales' | 'products' | 'customers';
  startDate: Date;
  endDate: Date;
  data: any;
  createdAt: Date;
}
