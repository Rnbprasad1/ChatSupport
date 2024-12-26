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
  orderDetails

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
      // Skip status update if the chat is already closed
      if (newStatusRef.current !== "closed") {
        updateDoc(doc(db, 'chats', chatId), {
          status: newStatusRef.current === '' ? status : newStatusRef.current,
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
    newStatusRef.current = 'closed'; // Ensure the ref is also updated
    await updateChatStatus(chatId, "closed");
    onClose();
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Chat Support</h3>
        <Button
          onClick={handleClose}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-600 hover:text-primary" />
        </Button>
      </div>

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

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === userName ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.sender === userName
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                  }`}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70">
                  {message.sender}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}