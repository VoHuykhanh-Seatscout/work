"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Award, Linkedin, Github, Edit, Trophy, Users, Calendar, GraduationCap, Building, FileText, Sparkles, Palette, Code, Camera, Brush, ChevronDown, Rocket, LinkIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { TypeAnimation } from 'react-type-animation';
import CountUp from 'react-countup';

// Updated brand color system
const brandColors = {
  primary: "#D84315",     // Deep orange
  secondary: "#FF5722",   // Vibrant orange
  accent: "#FF7043",      // Lighter orange
  dark: "#212121",        // Charcoal
  light: "#FFF3E0",       // Warm beige
  creative: "#8A2BE2",
  success: "#30D158",
  gradients: {
    primary: "linear-gradient(135deg, #D84315 0%, #FF5722 100%)",
    accent: "linear-gradient(135deg, #FF7043 0%, #FF5722 100%)",
    creative: "linear-gradient(135deg, #D84315 0%, #8A2BE2 100%)"
  }
};

interface StudentProfile {
  id: string;
  name: string;
  userId: string;
  university: string | null;
  degree: string | null;
  graduationYear: number | null;
  skills: string[];
  linkedin: string | null;
  github: string | null;
  resume: string | null;
  profileImage: string | null;
  aboutMe: string | null;
  tagline: string | null;
  shortIntroduction: string | null;
}

interface Award {
  id: string;
  name: string;
  description: string | null;
  position: number;
  competitionName: string;
}

interface StudentAchievements {
  awards: Award[];
  awardsCount: number;
  competitionsParticipated: number;
  projects: Project[];
  competitions: {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    prize: string;
    categories: string[];
    coverImage?: string;
  }[];
}

interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

const ProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = React.useState("projects");
  const [expandedSkill, setExpandedSkill] = React.useState<string | null>(null);

  // Fetch student profile
  const { data: studentProfile } = useQuery<StudentProfile>({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/profile");
      return data;
    }
  });

  // Fetch awards data
  const { data: awardsData } = useQuery<StudentAchievements>({
    queryKey: ["studentAchievements"],
    queryFn: async () => {
      const { data } = await axios.get("/api/profile/achievements");
      return data;
    }
  });

  // Extract data with fallbacks
  const awards = awardsData?.awards || [];
  const awardsCount = awardsData?.awardsCount || 0;
  const competitionsParticipated = awardsData?.competitionsParticipated || 0;
  const projects = awardsData?.projects || [];
  const competitions = awardsData?.competitions || [];

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="h-12 w-12 rounded-full border-4 border-t-transparent"
          style={{ borderColor: brandColors.primary }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 relative overflow-hidden">
      {/* Animated background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Dynamic gradient mesh */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              `radial-gradient(circle at 10% 20%, ${brandColors.primary}08, transparent 40%), 
               radial-gradient(ellipse at 90% 80%, ${brandColors.accent}06, transparent 50%), 
               conic-gradient(from 45deg at 50% 50%, ${brandColors.creative}04, transparent 70%)`,
              `radial-gradient(circle at 90% 20%, ${brandColors.secondary}08, transparent 40%), 
               radial-gradient(ellipse at 10% 80%, ${brandColors.primary}06, transparent 50%), 
               conic-gradient(from 135deg at 50% 50%, ${brandColors.accent}04, transparent 70%)`,
              `radial-gradient(circle at 30% 70%, ${brandColors.creative}08, transparent 40%), 
               radial-gradient(ellipse at 70% 30%, ${brandColors.secondary}06, transparent 50%), 
               conic-gradient(from 225deg at 50% 50%, ${brandColors.primary}04, transparent 70%)`
            ]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Organic Fluid Blobs */}
        <motion.div 
          className="absolute bottom-0 right-0 w-[800px] h-[800px] opacity-20"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${brandColors.primary}30, transparent 70%)`,
            filter: 'blur(120px)',
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
          }}
          animate={{
            x: [0, 100, 50, 80, 0],
            y: [0, -100, -50, -80, 0],
            rotate: [0, 25, -15, 10, 0],
            borderRadius: [
              '60% 40% 30% 70% / 60% 30% 70% 40%',
              '30% 70% 70% 30% / 30% 30% 70% 70%',
              '50% 50% 50% 50% / 50% 50% 50% 50%',
              '60% 40% 30% 70% / 60% 30% 70% 40%'
            ]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Subtle Grid with Animated Lines */}
        <motion.div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${brandColors.dark} 0.5px, transparent 0.5px),
              linear-gradient(to bottom, ${brandColors.dark} 0.5px, transparent 0.5px)
            `,
            backgroundSize: `40px 40px`
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto pt-24 pb-20 px-4 sm:px-6 relative z-10">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col lg:flex-row gap-12 mb-16"
        >
          {/* Profile Picture */}
          <div className="relative w-64 h-64 mx-auto lg:mx-0">
            <motion.div
              whileHover={{ rotateY: 5, rotateX: 2 }}
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl"
              style={{
                background: brandColors.gradients.primary,
                padding: '8px',
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }} 
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-white">
                <img
                  src={studentProfile?.profileImage || "/default-profile.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Warm overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 mix-blend-overlay" />
              </div>
            </motion.div>
            
            {/* Floating accent badge */}
            <motion.div
              animate={{ 
                rotate: [0, 8, -4, 0],
                y: [0, -8, 0]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -bottom-5 -right-5 bg-white rounded-full p-3 shadow-lg z-20"
              style={{
                border: `3px solid ${brandColors.accent}`,
                boxShadow: `0 8px 24px ${brandColors.accent}30`
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: brandColors.accent }} />
            </motion.div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 
                className="text-4xl md:text-5xl font-bold tracking-tight"
                style={{ color: brandColors.dark }}
              >
                {studentProfile?.name || session.user?.name || "Your Name"}
              </h1>
              
              {/* Animated tagline - Enhanced Version */}
<motion.div
  className="mt-6 mb-8"
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
  <motion.div
    animate={{
      backgroundPosition: ['0% 50%', '100% 50%'],
    }}
    transition={{
      duration: 12,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "linear"
    }}
    className="text-transparent bg-clip-text text-xl md:text-5xl font-bold tracking-tight leading-tight"
    style={{
      backgroundImage: brandColors.gradients.primary,
      backgroundSize: '300% 100%',
    }}
  >
    <TypeAnimation
      sequence={[
        studentProfile?.tagline || "Innovative Thinker • Creative Problem Solver",
        2000,
      ]}
      wrapper="span"
      speed={50}
      deletionSpeed={70}
      repeat={Infinity}
    />
  </motion.div>
</motion.div>
            </motion.div>

            {/* Stats Ribbon */}
            <motion.div 
              className="flex flex-wrap gap-4 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { 
                  icon: <Trophy className="w-5 h-5" />, 
                  value: `${awardsCount}`, 
                  label: "Awards",
                  color: brandColors.accent,
                  tooltip: "Competition awards won"
                },
                { 
                  icon: <Code className="w-5 h-5" />, 
                  value: `${studentProfile?.skills?.length || 0}`, 
                  label: "Skills",
                  color: brandColors.secondary,
                  tooltip: "Technical & creative skills"
                },
                { 
                  icon: <Award className="w-5 h-5" />, 
                  value: `${competitionsParticipated}`, 
                  label: "Competitions",
                  color: brandColors.primary,
                  tooltip: "Competitions participated in"
                }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-sm border bg-white/80"
                  style={{
                    borderColor: `${stat.color}20`,
                    boxShadow: `0 4px 12px ${stat.color}10`
                  }}
                  title={stat.tooltip}
                >
                  <div 
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-xl font-bold" style={{ color: brandColors.dark }}>
                      <CountUp end={parseInt(stat.value)} duration={2.5} delay={i * 0.2} />
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-wrap gap-4 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/profile/edit">
  <motion.button
    whileHover={{ 
      y: -3, 
      scale: 1.03,
      boxShadow: `0 8px 25px ${brandColors.primary}30`
    }}
    whileTap={{ scale: 0.98 }}
    className="px-6 py-3 rounded-xl text-white font-medium flex items-center gap-3 relative overflow-hidden group"
    style={{
      background: brandColors.gradients.primary,
      boxShadow: `0 4px 20px ${brandColors.primary}30`
    }}
  >
    <span className="relative z-10 flex items-center">
      <Edit className="w-5 h-5" />
      Edit Profile
    </span>
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
    />
  </motion.button>
</Link>
              
              {studentProfile?.linkedin && (
                <motion.a
                  whileHover={{ 
                    y: -3,
                    backgroundColor: 'white',
                    borderColor: brandColors.primary + "40"
                  }}
                  whileTap={{ scale: 0.98 }}
                  href={studentProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-3 border transition-colors bg-white/80 backdrop-blur-sm"
                  style={{
                    borderColor: brandColors.dark + "20",
                    color: brandColors.dark
                  }}
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </motion.a>
              )}

              {studentProfile?.github && (
                <motion.a
                  whileHover={{ 
                    y: -3,
                    backgroundColor: 'white',
                    borderColor: brandColors.dark + "40"
                  }}
                  whileTap={{ scale: 0.98 }}
                  href={studentProfile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-3 border transition-colors bg-white/80 backdrop-blur-sm"
                  style={{
                    borderColor: brandColors.dark + "20",
                    color: brandColors.dark
                  }}
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </motion.a>
              )}

              {studentProfile?.resume && (
                <motion.a
                  whileHover={{ 
                    y: -3,
                    backgroundColor: 'white',
                    borderColor: brandColors.secondary + "40"
                  }}
                  whileTap={{ scale: 0.98 }}
                  href={studentProfile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-medium flex items-center gap-3 border transition-colors bg-white/80 backdrop-blur-sm"
                  style={{
                    borderColor: brandColors.dark + "20",
                    color: brandColors.dark
                  }}
                >
                  <FileText className="w-5 h-5" />
                  Download CV
                </motion.a>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div 
          className="flex border-b mb-8"
          style={{ borderColor: brandColors.dark + "15" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { id: "projects", label: "Projects", icon: <Palette className="w-5 h-5" /> },
            { id: "skills", label: "Skills", icon: <Code className="w-5 h-5" /> },
            { id: "about", label: "About Me", icon: <Users className="w-5 h-5" /> },
            { id: "achievements", label: "Achievements", icon: <Award className="w-5 h-5" /> }
          ].
          map((tab) => (
  <button
    key={tab.id}
    onClick={() => setActiveTab(tab.id)}
    className={`px-6 py-3 text-sm font-medium flex items-center gap-2 relative ${
      activeTab === tab.id ? 
      `text-${brandColors.primary}` : 
      `text-gray-500 hover:text-${brandColors.dark}`
    }`}
  >
    {tab.icon}
    {tab.label}
    {activeTab === tab.id && (
      <motion.div 
        layoutId="activeTab"
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: brandColors.primary }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </button>
))}
        </motion.div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "projects" && (
                <div className="space-y-8">
                  {/* Competitions Section */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm border mb-8"
                    style={{ borderColor: brandColors.dark + "10" }}>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3"
                      style={{ color: brandColors.dark }}>
                      <Trophy className="w-6 h-6" style={{ color: brandColors.primary }} />
                      Competitions Participated ({competitions.length})
                    </h2>
                    
                    {competitions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {competitions.map((competition, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="border rounded-2xl overflow-hidden bg-white"
                            style={{ borderColor: brandColors.dark + "15" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                          >
                            {competition.coverImage && (
                              <div className="h-48 relative overflow-hidden">
                                <img
                                  src={competition.coverImage}
                                  alt={competition.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-6">
                              <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.dark }}>
                                {competition.title}
                              </h3>
                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {competition.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {competition.categories.map((category, j) => (
                                  <span 
                                    key={j}
                                    className="px-3 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: brandColors.primary + "10",
                                      color: brandColors.primary,
                                      border: `1px solid ${brandColors.primary}20`
                                    }}
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                              <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>
                                  {new Date(competition.startDate).toLocaleDateString()} - {' '}
                                  {new Date(competition.endDate).toLocaleDateString()}
                                </span>
                                {competition.prize && (
                                  <span className="font-medium" style={{ color: brandColors.accent }}>
                                    Prize: {competition.prize}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full" 
                          style={{ backgroundColor: brandColors.primary + "10" }}>
                          <Trophy className="w-12 h-12" style={{ color: brandColors.primary }} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.dark }}>
                          No Competitions Yet
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                          You haven't participated in any competitions yet.
                        </p>
                        <Link href="/competitions">
                          <button
                            className="px-6 py-2 rounded-lg font-medium"
                            style={{
                              backgroundColor: brandColors.primary + "10",
                              color: brandColors.primary
                            }}
                          >
                            Browse Competitions
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "skills" && studentProfile?.skills && (
                <div 
                  className="bg-white rounded-2xl p-8 shadow-sm border"
                  style={{ borderColor: brandColors.dark + "10" }}
                >
                  <h2 
                    className="text-2xl font-semibold mb-6 flex items-center gap-3"
                    style={{ color: brandColors.dark }}
                  >
                    <Code className="w-6 h-6" style={{ color: brandColors.primary }} />
                    Skills & Expertise ({studentProfile.skills.length})
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentProfile.skills.map((skill, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -3 }}
                        className="border rounded-xl p-5 bg-white"
                        style={{ borderColor: brandColors.dark + "15" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setExpandedSkill(expandedSkill === skill ? null : skill)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: brandColors.primary + "10",
                                color: brandColors.primary
                              }}
                            >
                              <Code className="w-5 h-5" />
                            </div>
                            <h3 
                              className="text-lg font-semibold"
                              style={{ color: brandColors.dark }}
                            >
                              {skill}
                            </h3>
                          </div>
                          <motion.div
                            animate={{ 
                              rotate: expandedSkill === skill ? 180 : 0
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        </div>
                        
                        {expandedSkill === skill && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4"
                          >
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                              <span>Experience Level</span>
                              <span className="font-medium">Intermediate</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: '70%',
                                  background: brandColors.gradients.primary
                                }}
                              />
                            </div>
                            <div className="mt-4 flex gap-2">
                              <span 
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: brandColors.primary + "10",
                                  color: brandColors.primary
                                }}
                              >
                                Web Development
                              </span>
                              <span 
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor: brandColors.accent + "10",
                                  color: brandColors.accent
                                }}
                              >
                                Frontend
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div 
                  className="bg-white rounded-2xl p-8 shadow-sm border"
                  style={{ borderColor: brandColors.dark + "10" }}
                >
                  <h2 
                    className="text-2xl font-semibold mb-6 flex items-center gap-3"
                    style={{ color: brandColors.dark }}
                  >
                    <Users className="w-6 h-6" style={{ color: brandColors.primary }} />
                    About Me
                  </h2>
                  
                  <div className="space-y-6">
                    {studentProfile?.shortIntroduction && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: brandColors.dark }}>
                          Introduction
                        </h3>
                        <p className="text-gray-700">{studentProfile.shortIntroduction}</p>
                      </div>
                    )}

                    {studentProfile?.tagline && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: brandColors.dark }}>
                          Tagline
                        </h3>
                        <p className="text-gray-700">{studentProfile.tagline}</p>
                      </div>
                    )}

                    {studentProfile?.aboutMe && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: brandColors.dark }}>
                          About Me
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">{studentProfile.aboutMe}</p>
                      </div>
                    )}

                    {(studentProfile?.degree || studentProfile?.university || studentProfile?.graduationYear) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: brandColors.dark }}>
                          Education
                        </h3>
                        <div className="space-y-2">
                          {studentProfile.degree && (
                            <p className="text-gray-700 flex items-center gap-2">
                              <GraduationCap className="w-5 h-5" style={{ color: brandColors.primary }} />
                              {studentProfile.degree}
                            </p>
                          )}
                          {studentProfile.university && (
                            <p className="text-gray-700 flex items-center gap-2">
                              <Building className="w-5 h-5" style={{ color: brandColors.primary }} />
                              {studentProfile.university}
                            </p>
                          )}
                          {studentProfile.graduationYear && (
                            <p className="text-gray-700 flex items-center gap-2">
                              <Calendar className="w-5 h-5" style={{ color: brandColors.primary }} />
                              Graduating {studentProfile.graduationYear}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {!studentProfile?.aboutMe && 
                    !studentProfile?.shortIntroduction && 
                    !studentProfile?.tagline && 
                    !studentProfile?.degree && 
                    !studentProfile?.university && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-6">No profile information available yet.</p>
                        <Link href="/profile/edit">
                          <button
                            className="px-6 py-2 rounded-lg font-medium"
                            style={{
                              backgroundColor: brandColors.primary + "10",
                              color: brandColors.primary
                            }}
                          >
                            Complete Your Profile
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "achievements" && (
                <div 
                  className="bg-white rounded-2xl p-8 shadow-sm border"
                  style={{ borderColor: brandColors.dark + "10" }}
                >
                  <h2 
                    className="text-2xl font-semibold mb-6 flex items-center gap-3"
                    style={{ color: brandColors.dark }}
                  >
                    <Award className="w-6 h-6" style={{ color: brandColors.primary }} />
                    Achievements ({awards.length})
                  </h2>
                  
                  {awards.length > 0 ? (
                    <div className="space-y-6">
                      {awards.map((award, i) => (
                        <motion.div
                          key={i}
                          className="border rounded-xl p-6 bg-white"
                          style={{ borderColor: brandColors.dark + "15" }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <div className="flex items-start gap-4">
                            <div 
                              className="flex-shrink-0 p-3 rounded-lg"
                              style={{
                                backgroundColor: brandColors.accent + "10",
                                color: brandColors.accent
                              }}
                            >
                              <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-1" style={{ color: brandColors.dark }}>
                                {award.name}
                              </h3>
                              <p className="text-gray-600 mb-2">
                                {award.competitionName} • {award.position} Place
                              </p>
                              {award.description && (
                                <p className="text-gray-700">{award.description}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full" 
                        style={{ backgroundColor: brandColors.primary + "10" }}>
                        <Trophy className="w-12 h-12" style={{ color: brandColors.primary }} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2" style={{ color: brandColors.dark }}>
                        No Awards Yet
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Participate in competitions to win awards and showcase your achievements here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

            {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <motion.button
          whileHover={{ 
            scale: 1.05,
            boxShadow: `0 8px 30px ${brandColors.primary}40`
          }}
          whileTap={{ scale: 0.95 }}
          className="p-4 rounded-full shadow-xl flex items-center justify-center"
          style={{
            background: brandColors.gradients.primary,
            color: 'white'
          }}
          onClick={() => {
            // Add your action here (e.g., scroll to top, open edit modal)
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Rocket className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;