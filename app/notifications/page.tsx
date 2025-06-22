"use client";

import { Bell, Check, Loader2, X, ArrowRight, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from '@/components/Navbar'; // Adjust path as needed

const brandColors = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  heroic: "#8A2BE2",
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

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/notification');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
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

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => n.status === 'UNREAD')
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationIds: unreadIds })
        });
        setNotifications(notifications.map(n => ({ 
          ...n, 
          status: 'READ'
        })));
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
      });
      setNotifications([]);
      setShowDropdown(false);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id]);

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient mesh */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              `radial-gradient(circle at 20% 30%, ${brandColors.primary}02, transparent 50%)`,
              `radial-gradient(circle at 80% 70%, ${brandColors.secondary}02, transparent 50%)`,
              `radial-gradient(circle at 50% 20%, ${brandColors.heroic}02, transparent 50%)`
            ]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: Object.values(brandColors)[
                Math.floor(Math.random() * Object.keys(brandColors).length)
              ],
              opacity: Math.random() * 0.1 + 0.02,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 50],
              y: [0, (Math.random() - 0.5) * 30],
              opacity: [0.02, 0.1, 0.02]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative mt-16">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{
                  backgroundColor: `${brandColors.primary}10`,
                  color: brandColors.primary
                }}
              >
                <Bell className="w-6 h-6" />
              </div>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                  {unreadCount}
                </motion.div>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: brandColors.dark }}>
              Notifications
            </h1>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">Actions</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      markAllAsRead();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark all as read</span>
                  </button>
                  <button
                    onClick={() => {
                      clearAllNotifications();
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors text-red-500"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear all</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Loader2 className="w-10 h-10" style={{ color: brandColors.primary }} />
              </motion.div>
              <p className="text-gray-500">Loading your notifications...</p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="p-6 rounded-xl border border-red-100 bg-red-50 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-red-600">Error loading notifications</h3>
              <p className="text-red-500 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={fetchNotifications}
                className="px-6 py-2 rounded-lg bg-red-500 text-white text-sm font-medium flex items-center gap-2"
              >
                <span>Retry</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: `${brandColors.primary}10` }}>
                <Bell className="w-10 h-10" style={{ color: brandColors.primary }} />
              </div>
              <h3 className="text-xl font-medium mb-2">No notifications yet</h3>
              <p className="text-gray-500 max-w-md text-center">
                When you have notifications, they'll appear here. Stay tuned for updates!
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`p-5 rounded-xl border transition-all ${notification.status === 'READ' ? 'opacity-90' : ''}`}
                    style={{
                      borderColor: `${brandColors.dark}10`,
                      backgroundColor: notification.status === 'UNREAD' ? `${brandColors.primary}05` : 'white',
                      boxShadow: notification.status === 'UNREAD' ? `0 4px 12px ${brandColors.primary}10` : '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {notification.status === 'UNREAD' && (
                            <motion.div 
                              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: brandColors.primary }}
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">
                              {notification.notification.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {notification.notification.message}
                            </p>
                            
                            {notification.notification.link && (
                              <Link 
                                href={notification.notification.link}
                                onClick={() => notification.status === 'UNREAD' && markAsRead(notification.id)}
                                className="inline-block mt-3 text-sm font-medium items-center gap-1 group"
                                style={{ color: brandColors.primary }}
                              >
                                <span>View details</span>
                                <motion.span
                                  className="inline-block group-hover:translate-x-1 transition-transform"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </motion.span>
                              </Link>
                            )}
                            
                            <div className="text-xs mt-3 text-gray-400">
                              {new Date(notification.notification.createdAt).toLocaleString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {notification.status === 'UNREAD' && (
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              markAsRead(notification.id);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-gray-500" />
                          </motion.button>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            deleteNotification(notification.id);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}