import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, MessageSquare, RefreshCw, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';




interface Chat {
  id: string;
  userName: string;
  reference: string;
  mobile: string;
  status: string;
  supportType?: 'refund' | 'help' | null;
  orderDetails?: any;
  createdAt: any;
}

export function Admin() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [filter, setFilter] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];
      setChats(newChats);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getSupportTypeIcon = (type?: string) => {
    switch (type) {
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-destructive" />;
      case 'help':
        return <HelpCircle className="h-4 w-4 text-warning" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chats</h2>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'open' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('open')}
                >
                  Active
                </Button>
                <Button
                  variant={filter === 'closed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('closed')}
                >
                  Closed
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedChat?.id === chat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                      }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{chat.userName}</div>
                      <Badge variant={chat.status === 'open' ? 'default' : 'secondary'}>
                        {chat.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm opacity-70">
                      {getSupportTypeIcon(chat.supportType)}
                      <span>
                        {chat.supportType ? chat.supportType.toUpperCase() : 'General'}
                      </span>
                    </div>
                    <div className="text-sm opacity-70">
                      Ref: {chat.reference}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Chat Window</h2>
            {selectedChat ? (
              <ChatWindow
                chatId={selectedChat.id}
                userName="Admin"
                onClose={() => setSelectedChat(null)}
                supportType={selectedChat.supportType}
                orderDetails={selectedChat.orderDetails}
              />
            ) : (
              <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}