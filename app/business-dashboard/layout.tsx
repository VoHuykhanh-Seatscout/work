"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sword, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import BusinessSidebar from "@/components/BusinessSidebar";

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/business-dashboard";

  const handleCreateCompetition = () => {
    router.push('/business-dashboard/competitions/create');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF3E0' }}>
      <BusinessSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                style={{
                  background: 'linear-gradient(135deg, #D84315, #FF5722)',
                  boxShadow: '0 4px 12px rgba(216, 67, 21, 0.3)'
                }}
              >
                <Sword className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                <span 
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #D84315, #FF5722)'
                  }}
                >
                  {isHome ? "War Room Overview" : 
                    pathname.split('/').pop()?.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                </span>
              </h1>
            </motion.div>
            
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateCompetition}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full text-sm font-bold hover:shadow-lg transition-all flex items-center"
              style={{
                boxShadow: '0 4px 12px rgba(216, 67, 21, 0.3)'
              }}
            >
              <Rocket className="mr-2 h-4 w-4" />
              New Quest
            </motion.button>
          </div>
        </header>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}