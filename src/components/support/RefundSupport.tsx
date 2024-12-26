import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { createRefundRequest } from '@/lib/firebase-utils';

interface RefundSupportProps {
  orderId: string;
  amount: number;
}

export function RefundSupport({ orderId, amount }: RefundSupportProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefundSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createRefundRequest({
        orderId,
        customerName: "Customer", // This will be updated from the chat context
        items: [], // This will be handled in a separate component
        totalRefundAmount: amount,
      });
    } catch (error) {
      console.error('Error submitting refund request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 mb-4 border-destructive">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="h-5 w-5 text-destructive" />
        <h3 className="text-lg font-semibold text-destructive">Refund Request</h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Order ID:</span>
          <span className="font-medium">{orderId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Amount:</span>
          <span className="font-medium">₹{amount}</span>
        </div>

        <Button 
          onClick={handleRefundSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          Request Full Refund
        </Button>
      </div>
    </Card>
  );
}