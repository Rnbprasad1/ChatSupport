import { Payment } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, RefreshCw, PhoneCall } from 'lucide-react';

interface OrderDetailsProps {
  order: Payment;
  onStartChat: (type: 'refund' | 'help' | 'contact') => void;
}

export function OrderDetails({ order, onStartChat }: OrderDetailsProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Order Details</h3>
        <ScrollArea className="h-[200px] mb-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-medium">{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">{order.paymentStatus}</span>
            </div>
            {order.items && order.items.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <h4 className="font-medium mb-1">Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.productName} </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => onStartChat('refund')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refund
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => onStartChat('help')}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => onStartChat('contact')}
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Contact
          </Button>
        </div>
      </Card>
    </div>
  );
}