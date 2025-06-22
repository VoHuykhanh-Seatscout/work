"use client";

import { Bell, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";

const brandColors = {
  primary: "#FFFFFF",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
};

type Notification = {
  id: string;
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function NotificationDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notification');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, session?.user?.id]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id] })
      });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, status: 'READ' } : n
      ));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const clearAll = async () => {
    try {
      const unreadIds = notifications
        .filter(n => n.status === 'UNREAD')
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        await fetch('/api/notification', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationIds: unreadIds })
        });
        setNotifications(notifications.map(n => ({ 
          ...n, 
          status: n.status === 'UNREAD' ? 'READ' : n.status 
        })));
      }
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.notification.createdAt).getTime() - new Date(a.notification.createdAt).getTime()
  );

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="relative">
      <button 
        className="relative p-2 group"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Bell className="w-5 h-5" style={{ color: brandColors.primary }} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-white text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-[9999] overflow-hidden"
            style={{
              border: `1px solid ${brandColors.dark}10`,
              boxShadow: `0 8px 32px ${brandColors.dark}10`
            }}
          >
            <div className="p-3 border-b flex justify-between items-center" 
              style={{ borderColor: `${brandColors.dark}10` }}>
              <h3 className="font-bold">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={clearAll}
                    className="text-xs flex items-center hover:underline"
                    style={{ color: brandColors.primary }}
                  >
                    <Check className="w-3 h-3 mr-1" /> Mark all read
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-xs flex items-center hover:underline"
                  style={{ color: brandColors.primary }}
                >
                  <X className="w-3 h-3 mr-1" /> Close
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm opacity-70">
                  Loading notifications...
                </div>
              ) : sortedNotifications.length > 0 ? (
                sortedNotifications.map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    markAsRead={markAsRead}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-sm opacity-70">
                  No notifications yet
                </div>
              )}
            </div>
            
            <div className="p-3 border-t text-center" 
              style={{ borderColor: `${brandColors.dark}10` }}>
              <Link 
                href="/notifications" 
                className="text-sm hover:underline"
                style={{ color: brandColors.primary }}
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({ 
  notification,
  markAsRead
}: { 
  notification: Notification;
  markAsRead: (id: string) => void;
}) {
  return (
    <Link 
      href={notification.notification.link || "#"} 
      onClick={() => notification.status === 'UNREAD' && markAsRead(notification.id)}
    >
      <motion.div
        whileHover={{ backgroundColor: `${brandColors.primary}08` }}
        className={`p-3 border-b cursor-pointer ${notification.status === 'READ' ? 'opacity-70' : ''}`}
        style={{ 
          borderColor: `${brandColors.dark}10`,
          backgroundColor: notification.status === 'UNREAD' ? `${brandColors.primary}05` : 'transparent'
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-sm">{notification.notification.title}</h4>
            <p className="text-xs mt-1">{notification.notification.message}</p>
          </div>
          {notification.status === 'UNREAD' && (
            <span className="w-2 h-2 rounded-full bg-white"></span>
          )}
        </div>
        <div className="text-xs mt-2 opacity-60">
          {new Date(notification.notification.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          })}
        </div>
      </motion.div>
    </Link>
  );
}