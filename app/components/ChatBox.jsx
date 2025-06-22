import { useState, useEffect } from "react";

export default function ChatBox({ conversationId, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetch(`/api/messaging/getMessages?conversationId=${conversationId}`)
      .then(res => res.json())
      .then(data => setMessages(data));
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const response = await fetch("/api/messaging/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, senderId: userId, content: newMessage }),
    });

    if (response.ok) {
      setMessages([...messages, { senderId: userId, content: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="h-64 overflow-y-auto border-b mb-2">
        {messages.map((msg, idx) => (
          <p key={idx} className={msg.senderId === userId ? "text-right text-blue-500" : "text-left"}>
            {msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        className="border p-2 w-full"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 mt-2">Send</button>
    </div>
  );
}
