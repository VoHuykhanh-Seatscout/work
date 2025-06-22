"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from '@/components/Navbar';
import { Award, Trophy, ChevronRight, ChevronDown, ChevronUp, User, Sparkles, Flame, Zap, Star, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import CountUp from 'react-countup';

// Brand colors matching the theme
const brandColors = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
};

// XP to level conversion (200 XP per level)
const calculateLevel = (xp: number) => Math.floor(xp / 200) + 1;

const calculateProgress = (xp: number) => {
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = (currentLevel - 1) * 200;
  const xpForNextLevel = currentLevel * 200;
  const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  return Math.min(100, Math.max(0, progress));
};

const getLevelBadge = (level: number) => {
  if (level >= 10) return <Trophy className="text-yellow-500 fill-yellow-500/20" />;
  if (level >= 5) return <Award className="text-purple-500 fill-purple-500/20" />;
  if (level >= 3) return <Star className="text-amber-500 fill-amber-500/20" />;
  return <Sparkles className="text-blue-500 fill-blue-500/20" />;
};

const getLevelTitle = (level: number) => {
  if (level >= 10) return "Legendary Creator";
  if (level >= 7) return "Master Creator";
  if (level >= 5) return "Advanced Creator";
  if (level >= 3) return "Skilled Creator";
  return "New Creator";
};

export default function XPHistoryPage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<{ xp: number; points: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/xp");
        if (!res.ok) throw new Error("Failed to fetch XP data");
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching XP data:", error);
        toast.error("Failed to load XP history");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchUserData();
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.dark }}>
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your XP history and level progress.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
             style={{ borderColor: brandColors.primary }} />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4" style={{ color: brandColors.dark }}>
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-6">
            Could not load your XP information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const currentXP = userData.xp;
  const currentLevel = calculateLevel(currentXP);
  const progress = calculateProgress(currentXP);
  const xpForNextLevel = currentLevel * 200;
  const xpNeeded = xpForNextLevel - currentXP;

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="absolute inset-0 w-full h-full">
          <filter id="noise">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.8" 
              numOctaves="4" 
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
          color: brandColors.secondary
        }}
      />

      <Navbar />

      {/* Main content - Added pt-24 (6rem) to account for navbar height */}
  <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 pt-24">
    {/* Header - Reduced mb-12 to mb-8 to tighten spacing */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center" // Changed from mb-12 to mb-8
    >
      {/* Rest of your content remains the same */}
      <motion.h1 
        className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter"
        style={{ 
          backgroundImage: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.accent})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}
      >
        Your Creator Journey
      </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Track your experience and level up your creative skills
          </motion.p>
        </motion.div>

        {/* XP Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: `${brandColors.primary}10`,
                  color: brandColors.primary
                }}
                animate={{
                  rotate: [0, 10, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {getLevelBadge(currentLevel)}
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: brandColors.dark }}>
                  Level {currentLevel}
                </h2>
                <p className="text-gray-600">{getLevelTitle(currentLevel)}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold flex items-center gap-2">
                  <Zap className="fill-orange-500 text-orange-500" />
                  <CountUp 
                    end={currentXP}
                    duration={1.5}
                    separator=","
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Total XP</p>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  <CountUp 
                    end={userData.points}
                    duration={1.5}
                    separator=","
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Points</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: brandColors.dark }}>
                Level {currentLevel}
              </span>
              <span className="text-sm font-medium" style={{ color: brandColors.dark }}>
                {xpNeeded} XP to Level {currentLevel + 1}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.accent})`
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Level Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Flame className="text-orange-500" />
            <span style={{ color: brandColors.dark }}>Level Benefits</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              className="p-6 rounded-lg flex items-start gap-4"
              style={{ backgroundColor: `${brandColors.primary}05` }}
              whileHover={{ y: -5 }}
            >
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${brandColors.primary}10` }}>
                <Sparkles className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2" style={{ color: brandColors.dark }}>
                  Current Level Perks
                </h3>
                <p className="text-gray-600">
                  You unlock special badges and recognition at each level milestone.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="p-6 rounded-lg flex items-start gap-4"
              style={{ backgroundColor: `${brandColors.secondary}05` }}
              whileHover={{ y: -5 }}
            >
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${brandColors.secondary}10` }}>
                <Zap className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2" style={{ color: brandColors.dark }}>
                  Next Level Rewards
                </h3>
                <p className="text-gray-600">
                  Reach Level {currentLevel + 1} to unlock {currentLevel >= 5 ? "exclusive features" : "new badges"}.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* XP Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
        >
          <h2 className="text-2xl font-bold mb-8" style={{ color: brandColors.dark }}>
            XP Milestones
          </h2>
          
          <div className="space-y-4">
            {[1, 2, 3, 5, 7, 10].map((level) => {
              const xpRequired = (level - 1) * 200;
              const isCurrent = currentLevel === level;
              const isAchieved = currentLevel >= level;
              const isFuture = currentLevel < level;

              return (
                <motion.div
                  key={level}
                  className={`p-6 rounded-xl border flex items-center gap-6 transition-all ${
                    isCurrent
                      ? "border-orange-300 bg-orange-50"
                      : isAchieved
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${
                      isCurrent
                        ? "bg-orange-100 text-orange-600"
                        : isAchieved
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {level}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium" style={{ color: brandColors.dark }}>
                      Level {level} - {getLevelTitle(level)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {xpRequired} XP required
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {isCurrent && (
                      <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600">
                        Current Level
                      </span>
                    )}
                    {isAchieved && !isCurrent && (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-600 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-green-500" />
                        Achieved
                      </span>
                    )}
                    {isFuture && (
                      <span className="text-gray-500">
                        {xpRequired - currentXP} XP needed
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
}