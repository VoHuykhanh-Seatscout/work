"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FiMessageSquare, FiSearch } from "react-icons/fi";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { usePathname } from "next/navigation";

export default function ConversationList() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.user?.id) return;
      
      try {
        const res = await fetch(`/api/messages/conversations`);
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [session?.user?.id]);

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    const otherUser = conversation.user1.id === session?.user?.id 
      ? conversation.user2 
      : conversation.user1;
    
    return otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full h-full flex flex-col border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Messages</h1>
          <Link 
            href="/business-dashboard/message/new" 
            className="text-blue-500 text-sm font-medium"
          >
            New
          </Link>
        </div>
        
        {/* Search */}
        <div className="relative mt-4">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <FiMessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">
              {searchQuery ? "No matches found" : "No conversations yet"}
            </p>
            {!searchQuery && (
              <Link
                href="/business-dashboard/message/new"
                className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
              >
                Start a conversation
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.user1.id === session?.user?.id 
                ? conversation.user2 
                : conversation.user1;
              const lastMessage = conversation.messages[0] || null;
              const isUnread = lastMessage && 
                !lastMessage.read && 
                lastMessage.senderId !== session?.user?.id;
              const isActive = pathname.includes(conversation.id);

              return (
                <Link
                  key={conversation.id}
                  href={`/business-dashboard/message/${conversation.id}`}
                  className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50' : ''
                  } ${isUnread ? 'border-l-4 border-blue-500' : ''}`}
                >
                  <div className="relative w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden flex-shrink-0">
                    {otherUser.profileImage ? (
                      <img 
                        src={otherUser.profileImage} 
                        alt={otherUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-600 text-sm font-medium">
                          {otherUser.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {isUnread && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className={`font-medium truncate ${
                        isUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'
                      }`}>
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${
                      isUnread ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}