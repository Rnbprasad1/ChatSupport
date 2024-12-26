export interface ProductItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  productName:string;
}

export interface Payment {
  orderId: string;
  customerName: string;
  customerAddress: string;
  city: string;
  phone: string;
  email: string;
  totalAmount: number;
  paymentStatus: string;
  razorpayOrderId: string;
  items: ProductItem[];
  timeStamp: string;
  deliveryTime: string;
  scheduledTime: string;
  gstFee: string;
  platformFee: string;
  discount: string;
}