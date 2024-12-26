import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X } from 'lucide-react';
import { RefundSupport } from '@/components/support/RefundSupport';
import { EmergencySupport } from '@/components/support/EmergencySupport';
import { updateChatStatus } from '@/lib/firebase-utils';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: any;
}

interface ChatWindowProps {
  chatId: string;
  userName: string;
  onClose: () => void;
  supportType?: 'refund' | 'help' | null;
  orderDetails?: any;
}

export function ChatWindow({
  chatId,
  userName,
  onClose,
  supportType,
  orderDetails,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const newStatusRef = useRef('');

  useEffect(() => {
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(newMessages);
    });

    return () => {
      if (newStatusRef.current !== 'closed') {
        updateDoc(doc(db, 'chats', chatId), {
          status: newStatusRef.current === '' ? 'open' : newStatusRef.current,
          closedAt: serverTimestamp(),
        });
      }
      unsubscribe();
    };
  }, [chatId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: newMessage,
        sender: userName,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleClose = async () => {
    newStatusRef.current = 'closed';
    await updateChatStatus(chatId, 'closed');
    onClose();
  };

  return (
    <div className="flex flex-col h-screen md:h-[700px] w-full md:max-w-3xl lg:max-w-4xl mx-auto bg-white rounded-lg shadow-lg md:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold">Chat Support</h3>
        <Button
          onClick={handleClose}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-[#800000] hover:text-[#800000]" />
        </Button>
      </div>

      {/* Support Details */}
      {supportType === 'refund' && orderDetails && (
        <div className="px-4 pt-4">
          <RefundSupport orderId={orderDetails.orderId} amount={orderDetails.totalAmount} />
        </div>
      )}
      {supportType === 'help' && (
        <div className="px-4 pt-4">
          <EmergencySupport />
        </div>
      )}

      {/* Message Area */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === userName ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] lg:max-w-[60%] rounded-lg p-3 ${message.sender === userName
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200'
                  }`}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70">{message.sender}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-primary text-white hover:bg-primary-dark"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
