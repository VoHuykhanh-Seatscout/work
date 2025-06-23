// app/business-dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, Rocket, Sword, Trophy, Mail, UserPlus, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import BusinessSidebar from "@/components/BusinessSidebar";

type DashboardData = {
  totalCompetitions: number;
  activeCompetitions: number;
  totalParticipants: number;
  competitions: {
    id: string;
    title: string;
    registrations: number;
    startDate: Date;
    endDate: Date;
  }[];
  participantDemographics: {
    university: string;
    count: number;
  }[];
};

export default function BusinessDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const isHome = pathname === '/business-dashboard';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/business/dashboard');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        setData(await res.json());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCreateCompetition = () => {
    router.push('/business-dashboard/competitions/create');
  };

  // If not on home page, we'll let the nested pages handle their own content
  if (!isHome) {
    return null; // Or you could return a loading state
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF3E0' }}>
      {/* Business Sidebar */}
      <BusinessSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Heroic Header */}
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
                  War Room Overview
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

        {/* Content */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
              ></motion.div>
            </div>
          ) : (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Heroic Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  icon={<Trophy className="w-8 h-8" />}
                  label="Total Quests"
                  value={data?.totalCompetitions || 0}
                  trend="All quests you've created"
                  color="from-orange-600 to-amber-600"
                />
                <MetricCard 
                  icon={<Rocket className="w-8 h-8" />}
                  label="Active Quests"
                  value={data?.activeCompetitions || 0}
                  trend="Currently accepting heroes"
                  color="from-red-600 to-pink-600"
                />
                <MetricCard 
                  icon={<Users className="w-8 h-8" />}
                  label="Heroes Joined"
                  value={data?.totalParticipants || 0}
                  trend="Unique participants across all quests"
                  color="from-purple-600 to-indigo-600"
                />
                <MetricCard 
                  icon={<TrendingUp className="w-8 h-8" />}
                  label="Avg. Heroes"
                  value={data?.competitions?.length ? Math.round((data.totalParticipants || 0) / data.competitions.length) : 0}
                  trend="Per quest"
                  color="from-emerald-600 to-teal-600"
                />
              </div>

              {/* Quests Table */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200 p-8"
                style={{
                  boxShadow: '0 8px 32px rgba(216, 67, 21, 0.1)'
                }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-extrabold text-orange-900">
                    <span 
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage: 'linear-gradient(45deg, #D84315, #FF5722)'
                      }}
                    >
                      Your Quests
                    </span>
                  </h2>
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateCompetition}
                    className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full text-sm font-bold hover:shadow-lg transition-all flex items-center"
                    style={{
                      boxShadow: '0 4px 12px rgba(216, 67, 21, 0.3)'
                    }}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    New Quest
                  </motion.button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-orange-200">
                    <thead className="bg-orange-50">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                          Quest
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                          Heroes
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-bold text-orange-800 uppercase tracking-wider">
                          Timeline
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-orange-100">
                      {data?.competitions?.map((competition) => {
                        const now = new Date();
                        const startDate = new Date(competition.startDate);
                        const endDate = new Date(competition.endDate);
                        const isActive = startDate <= now && endDate >= now;
                        const isUpcoming = startDate > now;
                        
                        return (
                          <motion.tr 
                            key={competition.id} 
                            whileHover={{ 
                              backgroundColor: 'rgba(255, 243, 224, 0.7)',
                              boxShadow: '0 4px 12px rgba(216, 67, 21, 0.1)'
                            }}
                            className="cursor-pointer"
                            onClick={() => router.push(`/business-dashboard/competitions/${competition.id}`)}
                          >
                            <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-orange-900">
                              {competition.title}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <span className={`px-4 py-2 text-xs rounded-full font-bold ${
                                isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : isUpcoming
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed'}
                              </span>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-orange-800">
                              {competition.registrations}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-sm text-orange-700">
                              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hero Academies */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200 p-8"
                  style={{
                    boxShadow: '0 8px 32px rgba(216, 67, 21, 0.1)'
                  }}
                >
                  <h2 className="text-2xl font-extrabold text-orange-900 mb-8">
                    <span 
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage: 'linear-gradient(45deg, #D84315, #FF5722)'
                      }}
                    >
                      Hero Academies
                    </span>
                  </h2>
                  <div className="space-y-6">
                    {data?.participantDemographics?.length ? (
                      data.participantDemographics.map((demo, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div 
                            className="flex-shrink-0 w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: [
                                '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6'
                              ][index % 5]
                            }}
                          ></div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex justify-between items-center mb-2 gap-2">
                              <span 
                                className="text-sm font-bold text-orange-900 truncate"
                                title={demo.university}
                              >
                                {demo.university}
                              </span>
                              <span className="text-sm font-bold text-orange-700 flex-shrink-0 px-1">
                                {demo.count}
                              </span>
                            </div>
                            <div className="w-full bg-orange-100 rounded-full h-2.5">
                              <div 
                                className="h-2.5 rounded-full"
                                style={{
                                  width: `${Math.min(100, (demo.count / (data.totalParticipants || 1)) * 100)}%`,
                                  backgroundColor: [
                                    '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6'
                                  ][index % 5]
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-orange-300" />
                        <p className="mt-4 text-orange-700 font-medium">No hero data yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200 p-8"
                  style={{
                    boxShadow: '0 8px 32px rgba(216, 67, 21, 0.1)'
                  }}
                >
                  <h2 className="text-2xl font-extrabold text-orange-900 mb-8">
                    <span 
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage: 'linear-gradient(45deg, #D84315, #FF5722)'
                      }}
                    >
                      Quest Master Tools
                    </span>
                  </h2>
                  <div className="space-y-4">
                    <motion.button 
                      whileHover={{ x: 5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateCompetition}
                      className="w-full px-6 py-4 text-left rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 text-orange-800 text-sm font-bold flex items-center border border-orange-200 hover:shadow-lg transition-all"
                      style={{
                        boxShadow: '0 4px 12px rgba(216, 67, 21, 0.1)'
                      }}
                    >
                      <div className="p-3 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600 text-white mr-4">
                        <Rocket size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Launch New Quest</p>
                        <p className="text-xs text-orange-600 mt-1">Create a heroic challenge</p>
                      </div>
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ x: 5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/business-dashboard/participants')}
                      className="w-full px-6 py-4 text-left rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 text-sm font-bold flex items-center border border-blue-200 hover:shadow-lg transition-all"
                      style={{
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                      }}
                    >
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white mr-4">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Summon Heroes</p>
                        <p className="text-xs text-blue-600 mt-1">Message participants</p>
                      </div>
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ x: 5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/business-dashboard/settings')}
                      className="w-full px-6 py-4 text-left rounded-xl bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-800 text-sm font-bold flex items-center border border-purple-200 hover:shadow-lg transition-all"
                      style={{
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.1)'
                      }}
                    >
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white mr-4">
                        <UserPlus size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Guild Invitations</p>
                        <p className="text-xs text-purple-600 mt-1">Invite team members</p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, trend, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend: string;
  color: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200 p-6 hover:shadow-xl transition-all"
      style={{
        boxShadow: '0 8px 32px rgba(216, 67, 21, 0.1)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-orange-600 font-medium">{label}</p>
          <h3 className="text-3xl font-bold mt-2 text-orange-900">{value}</h3>
          <p className="text-xs text-orange-500 mt-2">{trend}</p>
        </div>
        <div className={`p-4 rounded-lg bg-gradient-to-br ${color} text-white shadow-md`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}