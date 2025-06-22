"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { 
  Trophy, Rocket, Sword, Sparkles, Zap, 
  User, Settings, LogOut, ListChecks, Menu, X,
  MessageSquare, Bell, Search, Plus, Award, ChevronDown, Lock, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from '@/components/NotificationDropdown';

const brandColors = {
  primary: "#ffffff",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
};

export default function Navbar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user?.id) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch('/api/notification');
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          setNotifications(data.notifications || []);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
          setNotifications([]);
        } finally {
          setLoadingNotifications(false);
        }
      };
      
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setLoadingNotifications(false);
    }
  }, [session]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [id] })
      });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const clearAll = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
        await fetch('/api/notification', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationIds: unreadIds })
        });
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isMessagesPage = pathname.startsWith('/messages');

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#231768] z-50 px-4 sm:px-6 py-3 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
<Link href="/">
  <motion.div 
    className="flex items-center gap-2.5"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="w-8 h-8 flex items-center justify-center"> {/* Reduced from w-11 h-11 */}
      <Image 
        src="/logo-white.png" 
        alt="NextCompete Logo"
        width={36} 
        height={36} 
        className="w-full h-full object-contain"
      />
    </div>
    <h1 className="text-[26px] font-extrabold tracking-tight text-white"> {/* Increased from text-2xl (24px) */}
      NextCompete
    </h1>
  </motion.div>
</Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1.5">
          <NavItem href="/competitions" icon={<Sword size={18} />} label="Quests" active={pathname === "/competitions"} />
          <DisabledNavItem icon={<Rocket size={18} />} label="Launchpad" />
          <NavItem 
            href="/leaderboard" 
            icon={<Trophy size={18} />} 
            label="Leaderboard" 
            active={pathname === "/leaderboard"} 
          />
          <DisabledNavItem icon={<Sparkles size={18} />} label="Rewards" />

          <NotificationDropdown />

          <Link 
            href="/messages" 
            className="relative p-2 rounded-lg group"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="w-5 h-5 text-white" />
              {hasUnreadMessages && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full"></span>
              )}
            </motion.div>
          </Link>

          {session && (
            <div className="relative ml-1 opacity-50 cursor-not-allowed">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-2 rounded-lg flex items-center text-sm font-medium text-white border border-white/30"
              >
                <Plus className="w-4 h-4 mr-1" /> Create
                <Lock className="w-3 h-3 ml-1.5" />
              </motion.button>
            </div>
          )}

          {session ? (
            <div className="relative ml-1" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg group hover:bg-white/10"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
                  <Image
                    src={session.user?.image || "/default-avatar.png"}
                    alt="User Profile"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <ChevronDown 
                  className={`w-4 h-4 transition-transform text-white ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </motion.button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl z-[9999] overflow-hidden"
                    style={{
                      border: `1px solid rgba(0, 0, 0, 0.1)`,
                      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`
                    }}
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="font-bold text-lg text-gray-900">
                        {session.user?.name || "Hero"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.user?.email}
                      </div>
                    </div>
                    
                    <Link href="/profile">
                      <motion.div 
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                        className={dropdownItemClass}
                      >
                        <User className="w-5 h-5 mr-3 text-gray-700" /> 
                        Profile
                      </motion.div>
                    </Link>
                    <Link href="/xp-history">
                      <motion.div 
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                        className={dropdownItemClass}
                      >
                        <ListChecks className="w-5 h-5 mr-3 text-gray-700" /> 
                        XP Ledger
                      </motion.div>
                    </Link>
                    
                    <div className={dropdownItemClass + " opacity-50 cursor-not-allowed"}>
                      <Settings className="w-5 h-5 mr-3 text-gray-700" /> 
                      <span>Settings</span>
                      <Lock className="w-4 h-4 ml-auto text-gray-700" />
                    </div>
                    
                    <div className="border-t border-gray-100" />
                    
                    <motion.button
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full text-left px-4 py-3 flex items-center font-medium text-gray-700"
                    >
                      <LogOut className="w-5 h-5 mr-3" /> Sign Out
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={() => router.push("/login")}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 text-white font-bold tracking-wider rounded-xl ml-1 border border-white/30"
            >
              Join
            </motion.button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <Link href="/messages" className="relative p-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="w-6 h-6 text-white" />
              {hasUnreadMessages && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full"></span>
              )}
            </motion.div>
          </Link>

          <div className="relative">
            <button className="relative p-2">
              <Bell className="w-6 h-6 text-white" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full"></span>
              )}
            </button>
          </div>
          
          <motion.button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 left-0 right-0 bg-white z-[999] px-6 py-4 overflow-y-auto"
            style={{
              borderTop: `1px solid rgba(0, 0, 0, 0.1)`,
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.1)`,
              height: 'calc(100vh - 64px)'
            }}
          >
            <div className="flex flex-col space-y-3">
              {session && (
                <div className="flex items-center space-x-4 p-4 rounded-xl mb-3 bg-gray-50">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src={session.user?.image || "/default-avatar.png"}
                      alt="User Profile"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      {session.user?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.user?.email}
                    </div>
                  </div>
                </div>
              )}

              <MobileNavItem href="/competitions" icon={<Sword className="text-gray-700 w-6 h-6" />} label="Quests" />
              <MobileDisabledItem icon={<Rocket className="text-gray-700 w-6 h-6" />} label="Launchpad" />
              <MobileNavItem 
                href="/leaderboard" 
                icon={<Trophy className="text-gray-700 w-6 h-6" />} 
                label="Leaderboard" 
              />
              <MobileDisabledItem icon={<Sparkles className="text-gray-700 w-6 h-6" />} label="Rewards" />
              
              {session && (
                <div className="flex items-center px-5 py-4 rounded-xl opacity-50">
                  <Plus className="w-6 h-6 mr-4 text-gray-700" />
                  <span className="font-medium text-gray-700">Create</span>
                  <Lock className="w-4 h-4 ml-auto text-gray-700" />
                </div>
              )}
              
              {session ? (
                <>
                  <div className="border-t border-gray-100 my-3" />
                  <MobileNavItem href="/profile" icon={<User className="text-gray-700 w-6 h-6" />} label="Profile" />
                  <MobileNavItem href="/xp-history" icon={<ListChecks className="text-gray-700 w-6 h-6" />} label="XP Ledger" />
                  <MobileNavItem href="/messages" icon={<MessageSquare className="text-gray-700 w-6 h-6" />} label="Messages" />
                  <MobileNavItem href="/notifications" icon={<Bell className="text-gray-700 w-6 h-6" />} label="Notifications" />
                  
                  <div className="flex items-center px-5 py-4 rounded-xl opacity-50">
                    <Settings className="w-6 h-6 mr-4 text-gray-700" />
                    <span className="font-medium text-gray-700">Settings</span>
                    <Lock className="w-4 h-4 ml-auto text-gray-700" />
                  </div>
                  
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center justify-center px-6 py-4 rounded-xl mt-3 font-medium border border-gray-300 text-gray-700 text-base"
                  >
                    <LogOut className="w-5 h-5 mr-3" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-100 my-3" />
                  <motion.button
                    onClick={() => router.push("/login")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 text-white font-bold tracking-wider rounded-xl mt-3 bg-gray-900 text-base"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={() => router.push("/signup")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-4 font-bold tracking-wider rounded-xl mt-3 border border-gray-900 text-gray-900 text-base"
                  >
                    Join the Heroes
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href}>
      <motion.div
        className={`flex items-center text-base font-medium px-4 py-2.5 rounded-lg relative group`}
        whileHover={{ y: -2 }}
        style={{
          color: active ? 'white' : 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <span className="mr-3 transition-transform group-hover:scale-110">{icon}</span>
        {label}
        {active && (
          <motion.span 
            className="absolute -bottom-1 left-0 w-full h-1 rounded-full bg-white"
            layoutId="navIndicator"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
}

function DisabledNavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center text-base font-medium px-4 py-2.5 rounded-lg relative opacity-50 cursor-not-allowed text-white/50">
      <span className="mr-3">{icon}</span>
      {label}
      <Lock className="w-4 h-4 ml-2 text-white/50" />
    </div>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center px-5 py-4 rounded-xl bg-gray-50"
      >
        <span className="mr-4">{icon}</span>
        <span className="font-medium text-gray-700">{label}</span>
      </motion.div>
    </Link>
  );
}

function MobileDisabledItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center px-5 py-4 rounded-xl opacity-50">
      <span className="mr-4">{icon}</span>
      <span className="font-medium text-gray-700">{label}</span>
      <Lock className="w-4 h-4 ml-auto text-gray-700" />
    </div>
  );
}

const dropdownItemClass = `
  flex items-center px-5 py-3.5 cursor-pointer 
  transition-colors text-base text-gray-700
`;