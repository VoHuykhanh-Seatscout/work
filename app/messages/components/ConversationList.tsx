"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FiMessageSquare, FiSearch } from "react-icons/fi";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ConversationList() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.user?.id) return;
      
      try {
        const res = await fetch(`/api/messages/conversations`);
        const data = await res.json();
        setConversations(data.conversations);
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
    
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full md:w-96 border-r h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Messages</h1>
          <Link 
            href="/messages/new" 
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
            placeholder="Search"
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
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FiMessageSquare className="w-12 h-12 mb-4" />
            <p>{searchQuery ? "No matches found" : "No conversations yet"}</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.user1.id === session?.user?.id 
                ? conversation.user2 
                : conversation.user1;
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              const isUnread = lastMessage && 
                !lastMessage.read && 
                lastMessage.senderId !== session?.user?.id;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className={`flex items-center p-4 hover:bg-gray-50 ${isUnread ? 'bg-blue-50' : ''}`}
                >
                  <div className="relative w-12 h-12 rounded-full bg-gray-200 mr-3 overflow-hidden">
                    {otherUser.profileImage && (
                      <img 
                        src={otherUser.image || "public/default-profile.png"}
                        alt={otherUser.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {isUnread && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className={`font-semibold truncate ${isUnread ? 'text-black' : 'text-gray-900'}`}>
                        {otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isUnread ? 'font-medium text-black' : 'text-gray-500'}`}>
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