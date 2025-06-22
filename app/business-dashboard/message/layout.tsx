// app/business-dashboard/messages/layout.tsx
import BusinessSidebar from "@/components/BusinessSidebar";
import { FiMessageSquare } from "react-icons/fi";
import React from "react";
import ConversationList from "@/business-dashboard/message/components/ConversationList";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Business Sidebar */}
      <BusinessSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className="w-full md:w-80 border-r bg-white">
          <ConversationList />
        </div>

        {/* Conversation View */}
        <div className="flex-1 hidden md:flex">
          {children || (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-6 max-w-md">
                <div className="mx-auto bg-gray-200 rounded-full p-4 w-fit mb-4">
                  <FiMessageSquare className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-1">
                  Your messages
                </h3>
                <p className="text-gray-500 mb-6">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}