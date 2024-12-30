import React, { useState, useEffect } from 'react';
import { Search, Send } from 'lucide-react';
import { collection, query, where, getDoc, addDoc, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Payment, ProductItem } from '@/types/payment';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isAdmin: boolean;
  items?: ProductItem[];
  selectedItems?: ProductItem[];
}

interface ChatWindowProps {
  chatId: string;
  userName: string;
  onClose: () => void;
  supportType?: 'refund' | 'help' | null;
  orderDetails?: any;
}

export function ChatWindow({ chatId, userName, onClose, supportType, orderDetails }: ChatWindowProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderItems, setOrderItems] = useState<ProductItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const isAdmin = userName === 'Admin';

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError('');
    try {
      const paymentRef = doc(collection(db, 'payments'), orderNumber);
      const paymentDoc = await getDoc(paymentRef);

      if (!paymentDoc.exists()) {
        setError('Order not found');
        return;
      }

      const paymentData = paymentDoc.data() as Payment;
      setOrderItems(paymentData.items);
      setSelectedItems([]); // Reset selected items when new order is searched

      // Send order items as a message
      const messageData = {
        text: 'Please select items for your request:',
        sender: userName,
        isAdmin: true,
        timestamp: Date.now(),
        items: paymentData.items
      };

      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, messageData);

    } catch (err) {
      setError('Error searching for order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (item: ProductItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.productId === item.productId);
      if (isSelected) {
        return prev.filter(i => i.productId !== item.productId);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && selectedItems.length === 0) return;

    const messageData: Message = {
      text: newMessage,
      sender: userName,
      isAdmin,
      timestamp: Date.now()
    };

    if (selectedItems.length > 0) {
      messageData.selectedItems = selectedItems;
    }

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, messageData);
      setNewMessage('');
      setSelectedItems([]); // Reset selected items after sending
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const renderMessage = (message: Message) => {
    const isUserMessage = message.sender === userName;

    return (
      <div
        key={message.id}
        className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-lg p-4 ${
            isUserMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{message.sender}</span>
            <span className="text-xs opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {message.text && <p className="mb-3">{message.text}</p>}

          {!isAdmin && message.items && (
            <div className="space-y-2 bg-white/10 rounded-md p-3">
              {message.items.map((item) => (
                <label
                  key={item.productId}
                  className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.some(i => i.productId === item.productId)}
                    onChange={() => handleItemToggle(item)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm opacity-75">
                      ${item.price} x {item.quantity}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {message.selectedItems && message.selectedItems.length > 0 && (
            <div className="mt-3 bg-white/10 rounded-md p-3">
              <p className="font-medium mb-2">Selected Items:</p>
              <div className="space-y-2">
                {message.selectedItems.map(item => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <span>{item.productName}</span>
                    <span className="text-sm opacity-75">
                      ${item.price} x {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Support Chat</h2>
        {supportType && (
          <div className="text-sm text-gray-600">
            Support Type: <span className="font-medium">{supportType}</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="p-4 border-b bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter order number"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 mt-2 text-sm">{error}</p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() && selectedItems.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <Send size={18} />
            Send
          </button>
        </div>
        {selectedItems.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {selectedItems.length} item(s) selected
          </div>
        )}
      </form>
    </div>
  );
}