import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatInitForm } from '@/components/chat/ChatInitForm';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { MessageSquare, LogIn } from 'lucide-react';

export function Home() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const handleStartChat = async (data: any) => {
    try {
      const chatRef = await addDoc(collection(db, 'chats'), {
        userName: data.name,
        reference: data.reference,
        mobile: data.mobile,
        status: 'open',
        createdAt: serverTimestamp(),
      });

      setChatId(chatRef.id);
      setUserName(data.name);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleCloseChat = () => {
    setChatId(null);
    setUserName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-[#800000]" />
              <h1 className="text-3xl font-bold text-[#800000]">Chat Support</h1>
            </div>
            <Link to="/login">
              <Button className="bg-white text-primary-600 hover:bg-gray-100 flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center lg:justify-between gap-8 flex-wrap">
          <div
            className={`${
              chatId ? 'w-full' : 'w-full'
            } bg-white rounded-lg shadow-md p-6`}
          >
            {chatId ? (
              <ChatWindow
                chatId={chatId}
                userName={userName}
                onClose={handleCloseChat}
              />
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-center mb-4">
                  Start a New Chat
                </h2>
                <ChatInitForm onStartChat={handleStartChat} />
              </>
            )}
          </div>

          {!chatId && (
            <div className="hidden lg:block w-2/3 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-center mb-4">
                Welcome to Chat Support
              </h2>
              <p className="text-center text-gray-700">
                Use our chat system to get instant support. Whether it's help
                with your orders or other inquiries, we're here to assist you.
                Click the "Start Chat" button to begin.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            &copy; {new Date().getFullYear()} Chat Support System. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
