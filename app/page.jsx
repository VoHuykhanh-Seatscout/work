"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { m as motion } from "framer-motion";
import Image from 'next/image';
import Link from "next/link";
import Navbar from '@/components/Navbar'; 
import { TypeAnimation } from 'react-type-animation';
import { ArrowRight, Compass, TrendingUp, Users, ChevronDown, Rocket, LogOut, LinkIcon, ClipboardCheck, User, Award} from "lucide-react";
import { useRouter } from 'next/router';
import CountUp from 'react-countup';



export default function Home() {
  const { data: session } = useSession();
  const [isHovering, setIsHovering] = useState(false);
  const [stats, setStats] = useState(null); // Initialize as null

  const brandColors = {
  primary: "#5B2EFF",     // Bold electric purple (for buttons, highlights)
  secondary: "#3B1AB3",   // Deep violet (used in backgrounds or nav)
  accent: "#F4C300",    // Vivid yellow (for CTAs like "Start Competing")
  dark: "#0B0F19",        // Very dark navy (text and depth contrast)
  light: "#F4F6FF",       // Soft lavender white (backgrounds, cards)
  creative: "#FF7AD5",    // Vibrant pink (creative accents or tags)
  success: "#32D74B",     // Bright green (confirmation/status colors)
};

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching stats from API...');
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Stats data received:', data);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          activeChallenges: 0,
          members: 0,
          jobs: 0,
          partners: 0
        });
      }
    };

    fetchStats();
    console.log('useEffect for stats fetch triggered');
  }, []);


  const statsData = [
  { 
    label: "Active Challenges", 
    value: stats ? `${stats.activeChallenges}+` : 'Loading...', 
    icon: "🏆", 
    color: brandColors.primary 
  },
  { 
    label: "Impactful Students", 
    value: stats ? `${stats.members}+` : 'Loading...', 
    icon: "👩‍🎨", 
    color: brandColors.secondary 
  },
  { 
    label: "Trusted Partners", 
    value: stats ? `${stats.partners}+` : 'Loading...', 
    icon: "🤝", 
    color: brandColors.heroic 
  },
];

  


  // Student resources
  const exploreLinks = [
  { 
    title: "Challenges Hub", 
    href: "/competitions", 
    desc: "Compete and showcase your skills",
    icon: "🛠️",
    color: brandColors.primary,
    locked: false
  },
  { 
    title: "Career Portal", 
    href: "#", 
    desc: "Find your dream heroic job",
    icon: "💼",
    color: brandColors.accent,
    locked: true
  },
  { 
    title: "Student Rankings", 
    href: "/leaderboard", 
    desc: "See where you stand among peers",
    icon: "🏅",
    color: brandColors.secondary,
    locked: false
  },
  { 
    title: "Rewards Center", 
    href: "#", 
    desc: "Redeem your heroic earnings",
    icon: "🌟",
    color: brandColors.heroic,
    locked: true
  },
];

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans overflow-hidden relative">
      {/* Apple-inspired subtle noise texture */}
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

      {/* Lego-inspired dot grid overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
          color: brandColors.secondary
        }}
      />

      <Navbar />

      {/* Hero Section - Adjusted for better alignment */}
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

  {/* Content Container - Aligned with Navbar */}
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col lg:flex-row items-center justify-between gap-0">
    {/* Text Column */}
    <div className="lg:w-1/2 text-left py-12 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.2, 1, 0.2, 1] }}
      >
        <h1 className="text-4xl sm:text-12xl md:text-[3.5rem] lg:text-[4.5rem] xl:text-[5.5rem] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
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
          src="/path58.png" 
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

      {/* How It Works Section - Enhanced with Brand Colors */}
<section className="bg-white py-16 px-4">
  <div className="max-w-6xl mx-auto">
    {/* Section Title - Larger and left-aligned */}
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-left mb-12">
      How NextCompete Works
    </h2>

    {/* 4-Step Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* Step 1 */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col">
        <div className="w-full h-28 mx-auto mb-4"> {/* Reduced by ~20% */}
          <Image 
            src="/a.png" 
            alt="Create profile icon" 
            width={128} 
            height={160} 
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">
          Create Your Profile
        </h3>
        <p className="text-sm text-center text-gray-500">
          Show your skills and interests
        </p>
      </div>

      {/* Step 2 */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col">
        <div className="w-full h-28 mx-auto mb-4">
          <Image 
            src="/b.svg" 
            alt="Join competitions icon" 
            width={128} 
            height={160} 
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">
          Join Competitions
        </h3>
        <p className="text-sm text-center text-gray-500">
          Pick challenges that match your passion
        </p>
      </div>

      {/* Step 3 */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col">
        <div className="w-full h-28 mx-auto mb-4">
          <Image 
            src="/c.svg" 
            alt="Submit work icon" 
            width={128} 
            height={160} 
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">
          Submit Your Work
        </h3>
        <p className="text-sm text-center text-gray-500">
          Easy, deadline-tracked uploads
        </p>
      </div>

      {/* Step 4 */}
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col">
        <div className="w-full h-28 mx-auto mb-4">
          <Image 
            src="/d.svg" 
            alt="Earn rewards icon" 
            width={128} 
            height={160} 
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">
          Earn Rewards
        </h3>
        <p className="text-sm text-center text-gray-500">
          Win prizes, points, and visibility
        </p>
      </div>
    </div>
  </div>
</section>

      {/* Our Toolkits Section */}
<section className="bg-white py-16 px-4 sm:px-6">
  <div className="max-w-6xl mx-auto">
    {/* Section Title - Matching the "How OROA Works" style */}
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-left mb-12">
      Our Toolkits
    </h2>

    {/* Grid with 2 columns */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Challenge Hubs Card - Unlocked */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="w-full h-56">
          <Image 
            src="/f.png" 
            alt="Challenge Hubs" 
            width={1152}
            height={768}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5 relative">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenge Hubs</h3>
          <p className="text-gray-600 text-sm">
            Browse, join, and compete in skill-building challenges.
          </p>
        </div>
      </div>

      {/* Career Portal Card - Locked */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow relative">
        {/* Lock badge */}
        <div className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div className="w-full h-56 opacity-70">
          <Image 
            src="/i.png" 
            alt="Career Portal" 
            width={1152}
            height={768}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Portal</h3>
          <p className="text-gray-600 text-sm">
            Find career opportunities and build your hiring profile.
          </p>
          <span className="text-xs text-gray-400 mt-2 block">Coming Soon</span>
        </div>
      </div>

      {/* Leaderboard Card - Unlocked */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="w-full h-56">
          <Image 
            src="/h.png" 
            alt="Leaderboard" 
            width={1152}
            height={768}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Leaderboard</h3>
          <p className="text-gray-600 text-sm">
            Climb the ranks and track your performance across challenges.
          </p>
        </div>
      </div>

      {/* Rewards Center Card - Locked */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow relative">
        {/* Lock badge */}
        <div className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div className="w-full h-56 opacity-70">
          <Image 
            src="/g.png" 
            alt="Rewards Center" 
            width={1152}
            height={768}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rewards Center</h3>
          <p className="text-gray-600 text-sm">
            Redeem points for prizes, perks, and recognitions.
          </p>
          <span className="text-xs text-gray-400 mt-2 block">Coming Soon</span>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Enhanced Achievements Section - Compact Layout */}
<section className="relative py-16 px-4 sm:px-6 bg-white">
  <div className="max-w-7xl mx-auto">
    {/* Two Column Layout */}
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
      {/* Left Column - Illustration with centered CTA */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6"> {/* Reduced spacing */}
        {/* Larger Illustration */}
        <motion.div 
          className="flex items-center justify-center"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative w-full">
            <Image 
              src="/k.png" 
              alt="Creative person using platform" 
              width={1100}  // Increased size
              height={825}  // Maintained 4:3 aspect ratio
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Centered CTA Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link href={session ? "/competitions" : "/signup"}>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                backgroundColor: brandColors.primary,
                color: 'white',
                boxShadow: `0 12px 32px ${brandColors.primary}40`
              }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-xl transition-all flex items-center gap-2"
              style={{ 
                backgroundColor: brandColors.light,
                color: brandColors.primary,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: `1px solid ${brandColors.primary}20`
              }}
            >
              <span className="font-semibold text-lg">
                {session ? "Join a Challenge" : "Become Part of Our Community"}
              </span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Right Column - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <motion.div 
          className="mb-8"  // Reduced margin
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
            Our Achievements
          </h2>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-xl leading-relaxed">
            We're building a movement. Here's our progress.
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats === null ? (
          <div className="space-y-6">  
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"  // Smaller padding
              >
                <div className="animate-pulse flex items-center gap-4"> 
                  <div className="w-12 h-12 rounded-xl bg-gray-200"></div>  
                  <div className="flex-1 space-y-2">
                    <div className="h-7 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">  
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">  
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ 
                      backgroundColor: `${stat.color}10`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                  
                  <div>
                    <div className="text-3xl font-extrabold tracking-tight" style={{ color: stat.color }}>
                      <CountUp
                        end={parseInt(stat.value)}
                        duration={2.5}
                        delay={index * 0.2}
                        suffix={stat.value.includes('+') ? '+' : ''}
                      />
                    </div>
                    <p className="text-gray-600 text-md font-medium">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</section>

      

      {/* Final CTA - Purple Background Matching HeroSection */}
<section className="py-24 px-6 relative overflow-hidden">
  {/* Purple gradient background matching HeroSection */}
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
    
    {/* Floating Particles */}
    {[...Array(20)].map((_, i) => (
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

  {/* Content */}
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="max-w-4xl mx-auto text-center relative z-10"
  >
    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">
      Ready to begin your heroic journey?
    </h2>
    
    <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed tracking-tight">
  Join a community of passionate students building the future through innovation and collaboration.
</p>
    
    <div className="flex flex-wrap justify-center gap-4">
      <Link href="/competitions">
        <motion.button
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 12px 32px rgba(255,255,255,0.4)",
            y: -3
          }}
          whileTap={{ scale: 0.97 }}
          className="px-8 py-4 text-lg font-medium bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
          style={{ 
            color: brandColors.primary,
            boxShadow: '0 8px 24px rgba(255,255,255,0.3)'
          }}
        >
          <span>Browse Challenges</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity
            }}
          >
            →
          </motion.span>
        </motion.button>
      </Link>
      
      {!session ? (
        <motion.button
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: brandColors.dark,
            y: -3
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => signIn("google")}
          className="px-8 py-4 text-lg font-medium rounded-xl border-2 border-white transition-all duration-300 flex items-center gap-2"
          style={{ 
            color: 'white',
            backdropFilter: 'blur(4px)'
          }}
        >
          <span>Sign Up Free</span>
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity
            }}
          >
            ✨
          </motion.span>
        </motion.button>
      ) : (
        <Link href="/competitions">
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: brandColors.dark,
              y: -3
            }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 text-lg font-medium rounded-xl border-2 border-white transition-all duration-300 flex items-center gap-2"
            style={{ 
              color: 'white',
              backdropFilter: 'blur(4px)'
            }}
          >
            <span>Go to Dashboard</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity
              }}
            >
              🚀
            </motion.span>
          </motion.button>
        </Link>
      )}
    </div>
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
