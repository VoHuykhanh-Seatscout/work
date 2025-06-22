import { FiMessageSquare } from "react-icons/fi";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 max-w-md">
        <div className="mx-auto bg-gray-200 rounded-full p-4 w-fit mb-4">
          <FiMessageSquare className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-1">
          Your messages
        </h3>
        <p className="text-gray-500 mb-6">
          Send private messages to a friend or group
        </p>
        <Link 
          href="/messages/new" 
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
        >
          Send message
        </Link>
      </div>
    </div>
  );
}