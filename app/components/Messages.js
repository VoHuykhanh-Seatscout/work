import { useEffect, useState } from "react";

export default function Messages({ conversationId, userId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!conversationId) return;

    async function fetchMessages() {
      try {
        const response = await fetch(`/api/messaging/getConversationMessages?conversationId=${conversationId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to fetch messages");

        setMessages(data.messages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [conversationId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch("/api/messaging/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          senderId: userId, // Current user sending the message
          content: newMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send message");

      // Add new message to UI without needing a full refresh
      setMessages([...messages, data.message]);
      setNewMessage("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="messages-container">
      <div className="messages-list">
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.senderId === userId ? "sent" : "received"}`}>
              <p>{msg.content}</p>
              <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
            </div>
          ))
        )}
      </div>
      
      {/* Message Input Form */}
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
