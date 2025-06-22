
"use client";

import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaHome,
  FaEnvelope,
  FaPlus,
  FaList,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronRight,
  FaLock
} from "react-icons/fa";
import { Sword } from "lucide-react";



const brandColors = {
  primary: "#D84315",     // Deep orange
  secondary: "#FF5722",   // Vibrant orange
  accent: "#FF7043",      // Lighter orange
  dark: "#1D1D1F",        // Charcoal
  medium: "#424242",      // Dark gray
  light: "#FFF3E0",       // Warm beige
  offWhite: "#FAFAFA",    // Clean background
  success: "#4CAF50",     // Green
  warning: "#FFC107",     // Yellow
  error: "#F44336",       // Red
  gradients: {
    primary: "linear-gradient(135deg, #D84315, #FF5722)",
    secondary: "linear-gradient(135deg, #FF5722, #FF7043)"
  }
};

export default function BusinessSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const routeToTabMap = {
    "/app/business-dashboard": "overview",
    "/app/business-dashboard/overview": "overview",
    "/app/business-dashboard/message": "messages",
    "/app/business-dashboard/my-posts": "my-posts",
    "/app/business-dashboard/profile": "profile",
    "/app/business-dashboard/settings": "settings",
    "/app/business-dashboard/create": "create-post",
  };

  const activeTab = routeToTabMap[pathname] || "";

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <FaHome className="w-4 h-4" />,
      route: "/business-dashboard/overview",
      locked: false
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FaEnvelope className="w-4 h-4" />,
      route: "/business-dashboard/message",
      locked: false
    },
    {
      id: "my-posts",
      label: "My Posts",
      icon: <FaList className="w-4 h-4" />,
      route: "/business-dashboard/my-posts",
      locked: true // Locked
    },
  ];

  const accountItems = [
    {
      id: "profile",
      label: "Profile",
      icon: <FaUser className="w-4 h-4" />,
      route: "/business-dashboard/profile",
      locked: false
    },
    {
      id: "settings",
      label: "Settings",
      icon: <FaCog className="w-4 h-4" />,
      route: "/business-dashboard/settings",
      locked: true // Locked
    },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navigateToDashboard = () => {
    router.push("/business-dashboard");
  };

  return (
    <div className="w-64 bg-white p-5 min-h-screen flex flex-col border-r border-gray-200">
      {/* Brand Header */}
<div className="mb-8 pt-2">
  <button 
    onClick={navigateToDashboard}
    className="group focus:outline-none flex items-center space-x-3"
  >
    {/* Changed from w-10 h-10 to w-12 h-12 */}
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center"
      style={{
        background: brandColors.gradients.primary,
        boxShadow: '0 4px 12px rgba(216, 67, 21, 0.2)'
      }}
    >
      {/* Changed from w-5 h-5 to w-6 h-6 */}
      <Sword className="w-6 h-6 text-white" strokeWidth={2.5} />
    </div>
    <div className="text-left">
      {/* Changed from text-xl to text-2xl */}
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
        OROA
      </h2>
      <p className="text-xs text-gray-500 tracking-tight">Quest Giver Dashboard</p>
    </div>
  </button>
</div>


      {/* Create Post Button */}
      <button
        onClick={() => router.push("/business-dashboard/create")}
        className={`w-full flex items-center justify-between px-4 py-3 mb-6 rounded-xl transition-all duration-200 ${
          activeTab === "create-post"
            ? "bg-white text-orange-700 shadow-sm font-medium border border-orange-100"
            : "text-white hover:bg-orange-600 shadow hover:shadow-md"
        }`}
        style={{
          background: activeTab !== "create-post" 
            ? brandColors.primary 
            : undefined
        }}
      >
        <span className="flex items-center space-x-2">
          <FaPlus className="w-4 h-4" />
          <span>New Quest</span>
        </span>
        <FaChevronRight className="w-3 h-3 opacity-70" />
      </button>

      {/* Main Menu */}
      <div className="mb-6">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3 px-3">
          Workspace
        </h3>
        <nav className="space-y-1">
          {menuItems.map(({ id, label, icon, route, locked }) => (
            <button
              key={id}
              onClick={locked ? undefined : () => router.push(route)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? "bg-orange-50 text-orange-700 border border-orange-100"
                  : locked
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50 hover:translate-x-1 border border-transparent"
              }`}
              disabled={locked}
            >
              <span className="flex items-center space-x-3">
                <span className={`transition-colors ${
                  activeTab === id ? "text-orange-600" : 
                  locked ? "text-gray-400" : "text-gray-500"
                }`}>
                  {icon}
                </span>
                <span>{label}</span>
                {locked && <FaLock className="w-3 h-3 ml-2 text-gray-400" />}
              </span>
              {!locked && (
                <FaChevronRight className={`w-3 h-3 transition-all ${
                  activeTab === id ? "opacity-80" : "opacity-40"
                }`} />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Account Section */}
      <div className="mb-6">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3 px-3">
          Account
        </h3>
        <nav className="space-y-1">
          {accountItems.map(({ id, label, icon, route, locked }) => (
            <button
              key={id}
              onClick={locked ? undefined : () => router.push(route)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? "bg-orange-50 text-orange-700 border border-orange-100"
                  : locked
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50 hover:translate-x-1 border border-transparent"
              }`}
              disabled={locked}
            >
              <span className="flex items-center space-x-3">
                <span className={`transition-colors ${
                  activeTab === id ? "text-orange-600" : 
                  locked ? "text-gray-400" : "text-gray-500"
                }`}>
                  {icon}
                </span>
                <span>{label}</span>
                {locked && <FaLock className="w-3 h-3 ml-2 text-gray-400" />}
              </span>
              {!locked && (
                <FaChevronRight className={`w-3 h-3 transition-all ${
                  activeTab === id ? "opacity-80" : "opacity-40"
                }`} />
              )}
            </button>
          ))}
        </nav>
      </div>


      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
      >
        <FaSignOutAlt className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110" />
        <span className="font-medium">Log Out</span>
      </button>
    </div>
  );
}