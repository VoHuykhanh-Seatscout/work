"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { FiSend, FiMoreVertical, FiArrowLeft, FiImage, FiMessageSquare } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

interface User {
  id: string;
  name: string;
  profileImage?: string;
}

interface Conversation {
  id: string;
  user1: User;
  user2: User;
  updatedAt: Date;
}

export default function ConversationView({ conversationId }: { conversationId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchMessages = useCallback(async () => {
    try {
      const [conversationRes, messagesRes] = await Promise.all([
        fetch(`/api/messages/conversations/${conversationId}`),
        fetch(`/api/messages/conversations/${conversationId}/messages`)
      ]);
      
      if (!conversationRes.ok || !messagesRes.ok) {
        throw new Error('Failed to fetch conversation data');
      }

      const conversationData = await conversationRes.json();
      const messagesData = await messagesRes.json();
      
      setConversation(conversationData.conversation);
      setMessages(messagesData.messages || []);
      
      // Mark messages as read
      if (messagesData.messages?.length > 0) {
        await fetch(`/api/messages/conversations/${conversationId}/read`, {
          method: "POST"
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id || isSending) return;
    
    setIsSending(true);
    const tempId = Date.now().toString();
    const messageToSend = newMessage.trim();
    const tempMessage: Message = {
      id: tempId,
      senderId: session.user.id,
      content: messageToSend,
      createdAt: new Date(),
      read: false
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: messageToSend
        })
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const { message } = await res.json();
      
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? message : msg)
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageToSend); // Restore message if send fails
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const otherUser = conversation.user1.id === session?.user?.id 
    ? conversation.user2 
    : conversation.user1;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/business-dashboard/message')} 
            className="md:hidden mr-2 text-gray-500 hover:text-gray-700"
          >
            <FiArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {otherUser.profileImage ? (
              <img 
                src={otherUser.profileImage}
                alt={otherUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span className="text-gray-600 text-sm font-medium">
                  {otherUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{otherUser.name}</h2>
            <p className="text-xs text-gray-400">
              {conversation && formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <FiMoreVertical />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
            <FiMessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                message.senderId === session?.user?.id 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
              }`}>
                <p className={message.senderId === session?.user?.id ? '' : 'text-gray-800'}>
                  {message.content}
                </p>
                <p className={`text-xs mt-1 text-right ${
                  message.senderId === session?.user?.id 
                    ? 'text-blue-100' 
                    : 'text-gray-400'
                }`}>
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white sticky bottom-0">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <FiImage size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 p-2 px-4 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button 
            onClick={sendMessage}
            className={`p-2 rounded-full ${
              newMessage.trim() ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400'
            } hover:bg-gray-100`}
            disabled={!newMessage.trim() || isSending}
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}