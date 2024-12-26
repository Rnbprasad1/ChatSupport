import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';
import { getOrderDetails } from '@/lib/firebase-utils';
import { OrderDetails } from './OrderDetails';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  reference: z.string().min(3, 'Reference number must be at least 3 characters'),
  mobile: z.string().regex(/^\d{10}$/, 'Must be a valid 10-digit mobile number'),
});

type FormData = z.infer<typeof formSchema>;

interface ChatInitFormProps {
  onStartChat: (data: FormData) => void;
}

export function ChatInitForm({ onStartChat }: ChatInitFormProps) {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleReferenceBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const orderId = e.target.value;
    if (orderId.length >= 3) {
      const details = await getOrderDetails(orderId);
      if (details) {
        setOrderDetails(details);
      } else {
        toast({
          title: "Order Not Found",
          description: "You can still start a chat with our support team.",
          variant: "destructive",
        });
      }
    }
  };

  const canStartChat = !orderDetails || selectedOption === 'contact' || !selectedOption;

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Start Chat Support</h2>
      </div>

      <form onSubmit={handleSubmit(onStartChat)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Reference Number</Label>
          <Input
            id="reference"
            {...register('reference')}
            placeholder="Enter reference number"
            onBlur={handleReferenceBlur}
          />
          {errors.reference && (
            <p className="text-sm text-destructive">{errors.reference.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            {...register('mobile')}
            placeholder="Enter mobile number"
            type="tel"
          />
          {errors.mobile && (
            <p className="text-sm text-destructive">{errors.mobile.message}</p>
          )}
        </div>

        {orderDetails && (
          <OrderDetails 
            order={orderDetails} 
            onStartChat={() => setSelectedOption('contact')} 
          />
        )}

        {canStartChat && (
          <Button type="submit" className="w-full">
            Start Chat
          </Button>
        )}
      </form>
    </div>
  );
}