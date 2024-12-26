import { Card } from '@/components/ui/card';
import { PhoneCall, Mail } from 'lucide-react';

export function EmergencySupport() {
  return (
    <Card className="p-4 mb-4 border-warning">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold">Emergency Contacts</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4" />
            <p>Emergency: 100</p>
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4" />
            <p>Customer Care: +91 781 581 7221</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <p>support@example.com</p>
          </div>
        </div>
      </div>
    </Card>
  );
}