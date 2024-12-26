import { ProductItem } from './payment';

export interface RefundItem extends ProductItem {
  selected: boolean;
  refundAmount: number;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  customerName: string;
  items: RefundItem[];
  totalRefundAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: string;
  updatedAt: string;
}