import ConversationList from "@/messages/components/ConversationList";
import MessagesPage from "./page";
import Navbar from "@/components/Navbar";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      {/* Navbar at the top */}
      <Navbar />
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden pt-16"> {/* pt-16 accounts for navbar height */}
        {/* Sidebar - always visible on desktop */}
        <div className="w-full md:w-96 border-r h-full flex flex-col bg-white">
          <ConversationList />
        </div>
        
        {/* Main content - shows default page when no conversation selected */}
        <div className="flex-1 hidden md:flex bg-gray-50">
          {children || <MessagesPage />}
        </div>
      </div>
    </div>
  );
}