import { doc, getDoc, collection , updateDoc, addDoc, serverTimestamp} from 'firebase/firestore';
import { db } from './firebase';
import type { Payment } from '@/types/payment';
import type { RefundRequest, RefundItem } from '@/types/refund';


export async function getOrderDetails(orderId: string): Promise<Payment | null> {
  try {
    const paymentRef = doc(collection(db, 'payments'), orderId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (paymentDoc.exists()) {
      const payment = paymentDoc.get;
      const data = paymentDoc.data();
      console.log(payment);
      console.log(data);
      
      return paymentDoc.data() as Payment;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
}

interface CreateRefundRequestParams {
  orderId: string;
  customerName: string;
  items: RefundItem[];
  totalRefundAmount: number;
}

export async function createRefundRequest(params: CreateRefundRequestParams): Promise<string> {
  const refundRequest: Omit<RefundRequest, 'id'> = {
    ...params,
    status: 'pending',
    reason: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, 'refundRequests'), refundRequest);
  
  // Update the chat with refund request info
  await updateDoc(doc(db, 'chats', params.orderId), {
    refundRequestId: docRef.id,
    refundStatus: 'pending',
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export const updateChatStatus = async (chatId: string, status: string) => {
  try {
    const chatDoc = doc(db, "chats", chatId); // Specify your collection name
    await updateDoc(chatDoc, { status });
    console.log(`Chat ${chatId} status updated to ${status}`);
  } catch (error) {
    console.error("Error updating chat status:", error);
  }
};