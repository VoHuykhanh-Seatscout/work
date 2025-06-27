"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from '@/components/Navbar';
import { Award, Trophy, Medal, ChevronRight, ChevronDown, ChevronUp, User, Sparkles, Flame, Zap, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import CountUp from 'react-countup';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Image from "next/image";

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  points: number;
  rank: number;
}

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return (
    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
      <Star size={14} className="text-white fill-white" />
    </div>
  );
  if (rank === 2) return (
    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg">
      <Medal size={14} className="text-white fill-white" />
    </div>
  );
  if (rank === 3) return (
    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg">
      <Award size={14} className="text-white fill-white" />
    </div>
  );
  return (
    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 border border-gray-200 text-xs font-bold">
      {rank}
    </div>
  );
};

export default function Leaderboard() {
  const { data: session } = useSession();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedView, setExpandedView] = useState(false);
  const [highlightCurrentUser, setHighlightCurrentUser] = useState(true);

  const brandColors = {
  primary: "#5B2EFF",     // Bold electric purple (for buttons, highlights)
  secondary: "#3B1AB3",   // Deep violet (used in backgrounds or nav)
  accent: "#F4C300",    // Vivid yellow (for CTAs like "Start Competing")
  dark: "#0B0F19",        // Very dark navy (text and depth contrast)
  light: "#F4F6FF",       // Soft lavender white (backgrounds, cards)
  creative: "#FF7AD5",    // Vibrant pink (creative accents or tags)
  success: "#32D74B",     // Bright green (confirmation/status colors)
};


  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/leaderboard');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Prepare data for the top 3 chart
  const top3Data = leaderboardData.slice(0, 3).map(user => ({
    name: user.name.split(' ')[0],
    points: user.points,
    rank: user.rank,
    fill: user.rank === 1 ? "#F59E0B" : 
          user.rank === 2 ? "#6B7280" : 
          "#B45309"
  }));

  const currentUser = session?.user?.email ? 
    leaderboardData.find(user => user.email === session.user.email) : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-100 opacity-10"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
              rotate: [0, Math.random() * 360],
            }}
            transition={{
              duration: Math.random() * 30 + 30,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <Navbar />

      {/* Hero Section with Enhanced Background */}
<section className="relative overflow-hidden pt-[1.5rem] min-h-[calc(90vh-4.5rem)]">
  {/* Enhanced Background with Persistent Glow */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#1e145e] via-[#2a1b7a] to-[#3d28a8] overflow-hidden">
    {/* Persistent Glow Animation */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-400/10"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.1, 0.2, 0.1],
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    
    {/* Animated Grid Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-[length:40px_40px] bg-[linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_0.5px),linear-gradient(to_bottom,rgba(255,255,255,0.3)_1px,transparent_1px)]"></div>
    </div>
    
    {/* Floating Particles */}
    {[...Array(40)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white/10"
        style={{
          width: `${Math.random() * 8 + 2}px`,
          height: `${Math.random() * 8 + 2}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          x: [0, (Math.random() - 0.5) * 60],
          y: [0, (Math.random() - 0.5) * 60],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: Math.random() * 30 + 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: Math.random() * 10
        }}
      />
    ))}
  </div>

  {/* Content Container */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col lg:flex-row items-center justify-between gap-0">
    {/* Text Column */}
    <div className="lg:w-1/2 text-left py-12 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.2, 1, 0.2, 1] }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
          <span className="block whitespace-nowrap">Win Challenges.</span>
          <span className="block whitespace-nowrap">Build Skills.</span>
          <span className="block whitespace-nowrap">Get Noticed.</span>
        </h1>
        
        <motion.p 
          className="text-lg sm:text-xl lg:text-2xl text-white/80 max-w-xl leading-relaxed mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          A launchpad for ambitious students to win real challenges, earn rewards, and get hired.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 md:gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 text-lg"
          >
            <span className="text-xl">🚀</span> Start Competing
          </motion.button>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "#a855f7"
            }}
            whileTap={{ scale: 0.98 }}
            className="bg-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-purple-500 transition-all flex items-center gap-3 text-lg shadow-lg hover:shadow-xl"
          >
            <span className="text-xl">🎨</span> View Leaderboard
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
    
    {/* Illustration Column */}
    <motion.div 
      className="lg:w-1/2 flex items-center justify-center lg:justify-end h-full"
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 1, 0.2, 1] }}
    >
      <div className="relative w-full max-w-[850px] h-[80vh] min-h-[600px]">
        <Image 
          src="/path58.svg" 
          alt="Student competing with laptop" 
          fill
          className="object-contain object-right drop-shadow-2xl"
          priority
        />
        {/* Persistent Glow Effect */}
        <motion.div 
          className="absolute inset-0 -left-20 bg-purple-500/20 rounded-full blur-3xl -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  </div>

  {/* Bottom Gradient */}
  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#1e145e]/80 to-transparent -z-10"></div>
</section>

      {/* Top Performers Chart */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold mb-3" style={{ color: brandColors.dark }}>
              Top Performers
            </h2>
            <p className="text-lg" style={{ color: brandColors.primary }}>
              Visual representation of our highest scoring participants
            </p>
          </motion.div>

          {isLoading ? (
            <div className="h-96 bg-gray-100 rounded-2xl animate-pulse"></div>
          ) : top3Data.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm"
            >
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={top3Data}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                  >
                    <CartesianGrid vertical={true} horizontal={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: brandColors.dark, fontWeight: 600 }}
                    />
                    <YAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: brandColors.dark }}
                    />
                    <Tooltip 
                      content={({ payload, label }) => (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-bold" style={{ color: brandColors.dark }}>{label}</p>
                          <p className="text-sm" style={{ color: brandColors.primary }}>
                            <span className="font-medium">{payload?.[0]?.value}</span> points
                          </p>
                        </div>
                      )}
                    />
                    <Bar 
                      dataKey="points" 
                      radius={[4, 4, 0, 0]} 
                      animationDuration={2000}
                      barSize={60}
                    >
                      {top3Data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          strokeWidth={0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              Not enough data to display chart
            </div>
          )}
        </div>
      </section>

      {/* Full Leaderboard Table */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: brandColors.dark }}>
                Complete Rankings
              </h2>
              <p style={{ color: brandColors.primary }}>
                {expandedView ? 'Viewing all participants' : 'Showing top performers'}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setHighlightCurrentUser(!highlightCurrentUser)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                  highlightCurrentUser 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {highlightCurrentUser ? (
                  <>
                    <Sparkles size={16} className="fill-yellow-500 text-yellow-500" />
                    <span>Highlighting You</span>
                  </>
                ) : (
                  <span>Show My Position</span>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setExpandedView(!expandedView)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 flex items-center gap-1 text-sm font-medium"
              >
                <span>{expandedView ? 'Show Less' : 'Show More'}</span>
                {expandedView ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </motion.button>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} height={72} className="rounded-xl" />
              ))}
            </div>
          ) : leaderboardData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-4 px-6 text-left text-sm font-medium" style={{ color: brandColors.primary }}>Rank</th>
                      <th className="py-4 px-6 text-left text-sm font-medium" style={{ color: brandColors.primary }}>Participant</th>
                      <th className="py-4 px-6 text-right text-sm font-medium" style={{ color: brandColors.primary }}>Points</th>
                      <th className="py-4 px-6 text-right text-sm font-medium" style={{ color: brandColors.primary }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {leaderboardData.slice(0, expandedView ? leaderboardData.length : 10).map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                            highlightCurrentUser && session?.user?.email === user.email 
                              ? 'bg-yellow-50/50 border-l-4 border-l-yellow-400' 
                              : ''
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              {user.rank <= 3 ? (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                  user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-md' : 
                                  user.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-md' : 
                                  'bg-gradient-to-br from-purple-500 to-purple-700 shadow-md'
                                }`}>
                                  {user.rank}
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 text-sm font-medium">
                                  {user.rank}
                                </div>
                              )}
                              {user.rank === 1 && (
                                <div className="text-yellow-500">
                                  <Trophy size={18} fill="currentColor" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                {user.profileImage ? (
                                  <img 
                                    src={user.profileImage} 
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={18} className="text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold" style={{ color: brandColors.dark }}>{user.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[160px]">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm font-bold" style={{ color: brandColors.dark }}>
                                <CountUp 
                                  end={user.points}
                                  duration={1}
                                  separator=","
                                />
                              </span>
                              <span className="text-xs text-gray-500">pts</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link href={`/profile/${user.id}`} passHref>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                style={{ color: brandColors.primary }}
                              >
                                View Profile
                              </motion.button>
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Trophy size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No leaderboard data yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Be the first to participate in challenges and appear on the leaderboard!
              </p>
            </div>
          )}

          {/* Current user's position if not in top 10 */}
          {session && leaderboardData.length > 10 && !expandedView && currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <Link href="/leaderboard" passHref>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: brandColors.primary, color: 'white' }}>
                      <span className="text-sm font-bold">{currentUser.rank}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: brandColors.dark }}>Your Position</p>
                      <p className="text-xs" style={{ color: brandColors.primary }}>
                        Ranked #{currentUser.rank} with{' '}
                        <span className="font-medium">
                          <CountUp end={currentUser.points} duration={1} separator="," /> points
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">View full ranking</span>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Compact CTA Section with Enhanced Title */}
<section className="py-16 px-6 relative overflow-hidden min-h-[400px] flex items-center">
  {/* Gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#1e145e] via-[#2a1b7a] to-[#3d28a8] overflow-hidden">
    {/* Glow Animation */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-400/10"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.1, 0.2, 0.1],
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    
    {/* Floating Particles (reduced quantity) */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white/10"
        style={{
          width: `${Math.random() * 6 + 2}px`,
          height: `${Math.random() * 6 + 2}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          x: [0, (Math.random() - 0.5) * 40],
          y: [0, (Math.random() - 0.5) * 40],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: Math.random() * 20 + 10,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: Math.random() * 5
        }}
      />
    ))}
  </div>

  {/* Content */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="max-w-4xl mx-auto text-center relative z-10"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="mb-8"
    >
      <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium mb-3">
        <Sparkles size={14} className="fill-yellow-500 text-yellow-500" />
        <span>Ready to climb?</span>
      </div>
      
      {/* Enhanced Title */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight">
        <span className="block">Prove Your Skills,</span>
        <span className="block text-yellow-400">Climb the Leaderboard</span>
      </h2>
      
      <p className="text-lg text-white/85 max-w-xl mx-auto">
        Join competitions that challenge your abilities and talent
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-3"
    >
      <Link href="/competitions">
        <motion.button
          whileHover={{ 
            scale: 1.03, 
            y: -2
          }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-3 text-base font-medium bg-white rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
          style={{ 
            color: brandColors.primary,
            boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
          }}
        >
          <span>Browse Challenges</span>
          <motion.span
            animate={{ x: [0, 2, 0] }}
            transition={{ 
              duration: 1.2,
              repeat: Infinity
            }}
          >
            →
          </motion.span>
        </motion.button>
      </Link>
      
      <Link href="/profile">
        <motion.button
          whileHover={{ 
            scale: 1.03,
            y: -2
          }}
          whileTap={{ scale: 0.97 }}
          className="px-6 py-3 text-base font-medium rounded-lg border-2 border-white transition-all flex items-center gap-2"
          style={{ 
            color: 'white',
            backdropFilter: 'blur(4px)'
          }}
        >
          <span>View Profile</span>
          <motion.span
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ 
              duration: 1.2,
              repeat: Infinity
            }}
          >
            ✨
          </motion.span>
        </motion.button>
      </Link>
    </motion.div>
  </motion.div>
</section>
      
      {/* Footer - Clean Apple-like design with all black text */}
<footer className="bg-white border-t border-gray-100 py-12 px-6">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      <div>
        <h3 className="text-lg font-bold mb-4 tracking-tight text-black">
          Students Hub
        </h3>
        <p className="text-black text-sm leading-relaxed">
          Where innovators, designers, and builders collaborate to create the future.
        </p>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-black">
          Resources
        </h4>
        <ul className="space-y-2">
          {['Documentation', 'Tutorials', 'Blog', 'Community'].map((item) => (
            <li key={item}>
              <div className="text-black text-sm">
                {item}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-black">
          Company
        </h4>
        <ul className="space-y-2">
          {['About', 'Careers', 'Partners', 'Press'].map((item) => (
            <li key={item}>
              <div className="text-black text-sm">
                {item}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-black">
          Connect
        </h4>
        <div className="flex space-x-4">
          {['Twitter', 'Discord', 'Instagram', 'LinkedIn'].map((social) => (
            <div 
              key={social} 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              aria-label={social}
            >
              <span className="text-lg text-black">
                {social === 'Twitter' ? '🐦' : 
                 social === 'Discord' ? '💬' : 
                 social === 'Instagram' ? '📷' : '🔗'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-black text-sm mb-4 md:mb-0">
        © {new Date().getFullYear()} Students Hub. All rights reserved.
      </p>
      
      <div className="flex space-x-6">
        <div className="text-black text-sm">
          Privacy Policy
        </div>
        <div className="text-black text-sm">
          Terms of Service
        </div>
        <div className="text-black text-sm">
          Cookie Policy
        </div>
      </div>
    </div>
  </div>
</footer>
    </main>
  );
}

const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 16C5 16 6 18 12 18C18 18 19 16 19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);