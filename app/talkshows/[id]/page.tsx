"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow, format } from "date-fns";
import Navbar from "@/components/Navbar";
import { m as motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { FiCalendar, FiMail, FiGlobe, FiArrowLeft, FiMessageSquare, FiUser, FiAward, FiBook, FiClock, FiUsers, FiShare2, FiMic, FiArrowRight, FiMapPin, FiVideo } from "react-icons/fi";
import TalkshowCompletionCelebration from '@/components/TalkshowCompletionCelebration';

// Deep orange theme colors
const theme = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  background: "#F5F5F5",
  text: "#333333",
  lightText: "#757575"
};

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface Talkshow {
  id: string;
  title: string;
  description: string;
  organizerName: string;
  organizerLogo?: string;
  date: string;
  time: string;
  duration: number;
  locationType: "online" | "offline" | "hybrid";
  meetingLink?: string;
  venueAddress?: string;
  audienceType: string;
  enableQandA: boolean;
  enablePolls: boolean;
  allowReactions: boolean;
  registrationType: string;
  ticketingType: string;
  ticketPrice: number;
  maxAttendees: number;
  registrationDeadline: string;
  featuredOnHomepage: boolean;
  visibility: string;
  thumbnail?: string;
  speakers: any;
  agenda: any;
  tags: string[];
  socialMediaLinks: string[];
  organizer: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  registrations?: {
    user: User;
  }[];
  isRegistered?: boolean;
}

const safeFormatDate = (dateString: string | undefined, formatStr: string = 'MMM d, yyyy'): string => {
  if (!dateString) return 'Date not specified';
  try {
    return format(new Date(dateString), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const safeParseJson = (jsonString: any): any[] => {
  if (!jsonString) return [];
  try {
    if (typeof jsonString === 'object') return jsonString;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
};

export default function TalkshowDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [talkshow, setTalkshow] = useState<Talkshow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);

  useEffect(() => {
    async function fetchTalkshow() {
      try {
        const res = await fetch(`/api/talkshows/${id}`);
        if (!res.ok) throw new Error("Talkshow not found");
        const data = await res.json();
        setTalkshow(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchTalkshow();
  }, [id]); 

  useEffect(() => {
  if (talkshow?.date) {
    const talkshowDate = new Date(talkshow.date);
    const now = new Date();
    // Show celebration if talkshow date is in the past and user is registered
    if (talkshowDate < now && talkshow?.isRegistered) {
      setShowCompletionCelebration(true);
    }
  }
}, [talkshow]);
  

  const handleRegister = async () => {
    if (!session?.user) {
      toast.error("You must be logged in to register.");
      return;
    }

    try {
      setIsRegistering(true);
      const res = await fetch("/api/talkshows/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talkshowId: id,
          userId: session.user.id,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }

      const updatedRes = await fetch(`/api/talkshows/${id}`);
      const updatedData = await updatedRes.json();
      setTalkshow(updatedData);
      toast.success("Successfully registered!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!talkshow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Talkshow not found</p>
      </div>
    );
  }

  const deadlinePassed = talkshow.registrationDeadline 
    ? new Date(talkshow.registrationDeadline) < new Date() 
    : false;

  const parsedSpeakers = safeParseJson(talkshow.speakers);
  const parsedAgenda = safeParseJson(talkshow.agenda);
  const socialLinks = talkshow.socialMediaLinks || [];

  // Glass morphism style
  const glassMorphismStyle = {
    backdropFilter: 'blur(12px)',
    background: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)'
  };

  const renderLocationInfo = () => {
    switch (talkshow.locationType) {
      case "online":
        return (
          <div className="flex items-center gap-2">
            <FiVideo className="text-orange-600" />
            <span>Online Event</span>
            {talkshow.meetingLink && (
              <a 
                href={talkshow.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline ml-2"
              >
                (Join Link)
              </a>
            )}
          </div>
        );
      case "offline":
        return (
          <div className="flex items-center gap-2">
            <FiMapPin className="text-orange-600" />
            <span>{talkshow.venueAddress || "Venue details coming soon"}</span>
          </div>
        );
      case "hybrid":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiVideo className="text-orange-600" />
              <span>Online: {talkshow.meetingLink ? (
                <a 
                  href={talkshow.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  Join Link
                </a>
              ) : "Link will be provided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-orange-600" />
              <span>{talkshow.venueAddress || "Venue details coming soon"}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: theme.dark,
            color: '#fff',
            padding: '16px',
            fontSize: '14px',
          },
        }}
      />
      <div className="min-h-screen bg-gray-50 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8"
        >
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition border border-gray-200"
          >
            <FiArrowLeft size={18} />
            Back to Talkshows
          </button>

          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl mb-12 border border-white/20">
            {/* Background gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-0 opacity-10 animate-gradient"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 30%, ${theme.primary} 0%, transparent 25%),
                    radial-gradient(circle at 80% 70%, ${theme.secondary} 0%, transparent 25%),
                    radial-gradient(circle at 50% 50%, ${theme.accent} 0%, transparent 15%)
                  `,
                  backgroundSize: '200% 200%',
                  animation: 'gradientFlow 15s ease infinite'
                }}
              />
            </div>
            
            {/* Main container */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden rounded-3xl"
              style={glassMorphismStyle}
            >
              {/* Cover image */}
              <motion.div 
                className="relative h-[32rem] w-full overflow-hidden"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
              >
                <Image
                  src={talkshow.thumbnail || "/default-coverImage.png"}
                  alt={talkshow.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                  quality={100}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/30" />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, 
                      ${theme.primary}15 0%, 
                      ${theme.secondary}10 50%, 
                      ${theme.accent}05 100%)`
                  }}
                />
              </motion.div>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto w-full">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <motion.div 
                      className="flex-1 space-y-6 backdrop-blur-lg bg-white/90 p-8 rounded-2xl shadow-2xl border border-white/30"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                      style={{
                        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
                        style={{
                          background: `linear-gradient(45deg, 
                            ${theme.primary} 0%, 
                            ${theme.secondary} 50%, 
                            ${theme.accent} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          lineHeight: 1.2
                        }}
                      >
                        {talkshow.title}
                      </motion.h1>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white/80 p-4 rounded-xl border border-white/30 flex items-center gap-3 shadow-sm hover:border-orange-400/50 transition-all">
                          <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-400/30">
                            <FiCalendar className="text-orange-600" size={18} strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">Date</p>
                            <p className="font-semibold text-gray-800">
                              {safeFormatDate(talkshow.date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white/80 p-4 rounded-xl border border-white/30 flex items-center gap-3 shadow-sm hover:border-orange-400/50 transition-all">
                          <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-400/30">
                            <FiClock className="text-orange-600" size={18} strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">Time</p>
                            <p className="font-semibold text-gray-800">
                              {talkshow.time}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-white/80 p-4 rounded-xl border border-white/30 flex items-center gap-3 shadow-sm hover:border-orange-400/50 transition-all">
                          <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-400/30">
                            <FiClock className="text-orange-600" size={18} strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">Duration</p>
                            <p className="font-semibold text-gray-800">
                              {talkshow.duration} minutes
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-white/80 rounded-xl border border-white/30">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-500/20 p-2 rounded-lg border border-orange-400/30">
                            {talkshow.locationType === "online" ? (
                              <FiGlobe className="text-orange-600" size={18} strokeWidth={2} />
                            ) : talkshow.locationType === "offline" ? (
                              <FiMapPin className="text-orange-600" size={18} strokeWidth={2} />
                            ) : (
                              <div className="flex gap-1">
                                <FiGlobe className="text-orange-600" size={18} strokeWidth={2} />
                                <FiMapPin className="text-orange-600" size={18} strokeWidth={2} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">Location</p>
                            {renderLocationInfo()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-6">
                        {parsedSpeakers.length > 0 && (
                          <motion.span
                            whileHover={{ y: -3, scale: 1.05 }}
                            className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                            style={{
                              backgroundColor: `${theme.primary}15`,
                              color: theme.primary,
                              border: `1px solid ${theme.primary}30`,
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            <FiMic size={16} />
                            {parsedSpeakers.length} Speakers
                          </motion.span>
                        )}
                        
                        <motion.span
                          whileHover={{ y: -3, scale: 1.05 }}
                          className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                          style={{
                            backgroundColor: `${theme.secondary}15`,
                            color: theme.secondary,
                            border: `1px solid ${theme.secondary}30`,
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          <FiUsers size={16} />
                          {talkshow.registrations?.length || 0} Attendees
                        </motion.span>
                        
                        <motion.span
                          whileHover={{ y: -3, scale: 1.05 }}
                          className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                          style={{
                            backgroundColor: `${theme.accent}15`,
                            color: theme.accent,
                            border: `1px solid ${theme.accent}30`,
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          <FiGlobe size={16} />
                          {talkshow.locationType.charAt(0).toUpperCase() + talkshow.locationType.slice(1)}
                        </motion.span>
                      </div>
                    </motion.div>
                    
                    {/* Registration Panel */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="w-full lg:w-auto lg:min-w-[360px]"
                    >
                      <div 
                        className="p-8 rounded-2xl border shadow-2xl backdrop-blur-lg"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        {talkshow.isRegistered ? (
                          <div className="text-center space-y-6">
                            <motion.div 
                              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 mx-auto relative"
                              style={{
                                backgroundColor: `${theme.primary}10`,
                                border: `2px dashed ${theme.primary}`
                              }}
                              animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{
                                duration: 1.5,
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              <svg 
                                className="w-10 h-10"
                                style={{ color: theme.primary }}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </motion.div>
                            <h3 className="text-2xl font-bold mb-2" style={{ color: theme.dark }}>
                              You're Registered!
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                              You're all set for {talkshow.title}
                            </p>
                            
                            <motion.button
                              whileHover={{ 
                                scale: 1.03, 
                                boxShadow: `0 8px 20px ${theme.primary}40`
                              }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => router.push(`/message-organizer/${talkshow.organizer.id}`)}
                              className="w-full py-4 font-medium rounded-xl transition-all flex items-center justify-center gap-3 text-lg"
                              style={{
                                backgroundColor: `${theme.primary}10`,
                                color: theme.primary,
                                border: `1px solid ${theme.primary}20`,
                                boxShadow: `0 4px 15px ${theme.primary}20`
                              }}
                            >
                              <FiMessageSquare size={20} /> 
                              <span>Message Organizer</span>
                            </motion.button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: theme.dark }}>
                              Join the Talkshow
                            </h3>
                            
                            <div className="space-y-4">
                              <motion.div 
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="flex items-center gap-4 p-4 rounded-xl border"
                                style={{
                                  backgroundColor: `${theme.primary}08`,
                                  borderColor: `${theme.primary}20`,
                                  backdropFilter: 'blur(4px)'
                                }}
                              >
                                <div 
                                  className="p-3 rounded-lg flex-shrink-0"
                                  style={{
                                    backgroundColor: `${theme.primary}15`,
                                    color: theme.primary
                                  }}
                                >
                                  <FiUsers size={22} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1" style={{ color: theme.dark }}>
                                    Attendees
                                  </p>
                                  <div className="font-bold text-lg" style={{ color: theme.dark }}>
                                    {talkshow.registrations?.length || 0} registered
                                  </div>
                                </div>
                              </motion.div>
                              
                              {parsedSpeakers.length > 0 && (
                                <motion.div 
                                  whileHover={{ y: -4, scale: 1.02 }}
                                  className="flex items-center gap-4 p-4 rounded-xl border"
                                  style={{
                                    backgroundColor: `${theme.secondary}08`,
                                    borderColor: `${theme.secondary}20`,
                                    backdropFilter: 'blur(4px)'
                                  }}
                                >
                                  <div 
                                    className="p-3 rounded-lg flex-shrink-0"
                                    style={{
                                      backgroundColor: `${theme.secondary}15`,
                                      color: theme.secondary
                                    }}
                                  >
                                    <FiMic size={22} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-1" style={{ color: theme.dark }}>
                                      Speakers
                                    </p>
                                    <div className="font-bold text-lg" style={{ color: theme.dark }}>
                                      {parsedSpeakers.length} featured
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                            
                            <motion.button
                              onClick={handleRegister}
                              disabled={deadlinePassed || isRegistering}
                              whileHover={!deadlinePassed && !isRegistering ? { 
                                scale: 1.03,
                                boxShadow: `0 10px 25px ${theme.primary}40`
                              } : {}}
                              whileTap={!deadlinePassed && !isRegistering ? { scale: 0.98 } : {}}
                              className={`w-full py-4 font-bold rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
                                deadlinePassed || isRegistering
                                  ? "bg-gray-100 cursor-not-allowed"
                                  : "text-white shadow-xl"
                              }`}
                              style={{
                                background: !deadlinePassed && !isRegistering 
                                  ? `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`
                                  : undefined,
                                color: deadlinePassed || isRegistering ? `${theme.dark}40` : 'white'
                              }}
                            >
                              {isRegistering && (
                                <motion.span
                                  className="absolute left-0 top-0 h-full bg-white/30"
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                {deadlinePassed
                                  ? "Registration Closed"
                                  : isRegistering
                                  ? (
                                    <>
                                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Securing Your Spot...
                                    </>
                                  )
                                  : (
                                    <>
                                      Register Now 
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                      </svg>
                                    </>
                                  )}
                              </span>
                            </motion.button>
                            
                            {!deadlinePassed && talkshow.registrationDeadline && (
                              <div className="text-center">
                                <motion.p 
                                  className="text-sm mt-4 flex items-center justify-center gap-2"
                                  style={{ color: theme.dark }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.8 }}
                                >
                                  <FiClock size={18} />
                                  <span>Closes in </span>
                                  <motion.span 
                                    className="font-semibold"
                                    style={{ color: theme.accent }}
                                    animate={{ 
                                      scale: [1, 1.05, 1],
                                      opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    {formatDistanceToNow(new Date(talkshow.registrationDeadline), { addSuffix: true })}
                                  </motion.span>
                                </motion.p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* About Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>About This Event</h2>
              {talkshow.description ? (
                <div className="prose prose-lg max-w-none text-gray-700">
                  {talkshow.description.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-bold mb-6" style={{ color: theme.primary }}>Event Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <FiMessageSquare size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: theme.dark }}>Q&A Session</h4>
                      <p className="text-gray-600">
                        {talkshow.enableQandA 
                          ? "Live Q&A will be available during the event"
                          : "Q&A will not be available for this event"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: theme.dark }}>Polls</h4>
                      <p className="text-gray-600">
                        {talkshow.enablePolls 
                          ? "Interactive polls will be conducted during the event"
                          : "No polls scheduled for this event"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: theme.dark }}>Reactions</h4>
                      <p className="text-gray-600">
                        {talkshow.allowReactions 
                          ? "Attendees can react with emojis during the event"
                          : "Reactions will be disabled for this event"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2" style={{ color: theme.dark }}>Discussion</h4>
                      <p className="text-gray-600">
                        {talkshow.enableQandA 
                          ? "Live discussion will be available during the event"
                          : "Discussion will be moderated for this event"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {talkshow.tags && talkshow.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold mb-6" style={{ color: theme.primary }}>Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {talkshow.tags.map((tag) => (
                      <motion.span 
                        key={tag}
                        whileHover={{ y: -2 }}
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${theme.primary}10`,
                          color: theme.primary,
                          border: `1px solid ${theme.primary}20`
                        }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* Agenda Section */}
          {parsedAgenda.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-16"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>Event Agenda</h2>
                
                <div className="space-y-6">
                  {parsedAgenda.map((item: any, index: number) => {
                    const speaker = parsedSpeakers.find((s: any) => s.id === item.speakerId);
                    return (
                      <motion.div 
                        key={index} 
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                        whileHover={{ y: -5 }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                          <div 
                            className="px-4 py-2 rounded-lg font-medium w-fit"
                            style={{
                              backgroundColor: `${theme.primary}10`,
                              color: theme.primary,
                              border: `1px solid ${theme.primary}20`
                            }}
                          >
                            {item.time}
                          </div>
                          <h4 className="text-xl font-bold text-gray-800">{item.title}</h4>
                        </div>
                        
                        {speaker && (
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <Image
                                src={speaker.photo || "/default-profile.png"}
                                alt={speaker.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{speaker.name}</p>
                              <p className="text-sm text-gray-600">{speaker.title}</p>
                            </div>
                          </div>
                        )}
                        
                        {item.description && (
                          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.section>
          )}

          {/* Speakers Section */}
          {parsedSpeakers.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-16"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>Featured Speakers</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parsedSpeakers.map((speaker: any) => (
                    <motion.div 
                      key={speaker.id} 
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative">
                          <Image
                            src={speaker.photo || "/default-profile.png"}
                            alt={speaker.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h4 className="text-xl font-bold text-gray-800">{speaker.name}</h4>
                        <p 
                          className="font-medium mb-2"
                          style={{ color: theme.primary }}
                        >
                          {speaker.title}
                        </p>
                        {speaker.bio && (
                          <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: speaker.bio }} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Contact Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Organizer Email</p>
                    <a 
                      href={`mailto:${talkshow.organizer.email}`} 
                      className="text-lg font-medium"
                      style={{ color: theme.primary }}
                    >
                      {talkshow.organizer.email}
                    </a>
                  </div>
                </div>
                
                {socialLinks.length > 0 && (
                  <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <FiShare2 size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-3">Social Media</p>
                      <div className="flex flex-wrap gap-3">
                        {socialLinks.map((link: string, index: number) => (
                          <a 
                            key={index} 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg transition flex items-center gap-2"
                            style={{
                              backgroundColor: `${theme.primary}10`,
                              color: theme.primary,
                              border: `1px solid ${theme.primary}20`
                            }}
                          >
                            {link.includes('twitter') && <span>🐦</span>}
                            {link.includes('linkedin') && <span>🔗</span>}
                            {link.includes('instagram') && <span>📷</span>}
                            {link.includes('twitter') ? 'Twitter' : 
                             link.includes('linkedin') ? 'LinkedIn' : 
                             link.includes('instagram') ? 'Instagram' : 'Social Media'}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Share Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-3xl font-bold mb-6" style={{ color: theme.primary }}>Share This Event</h2>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ y: -3 }}
                  className="px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    color: theme.primary,
                    border: `1px solid ${theme.primary}20`
                  }}
                >
                  <span>Twitter</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -3 }}
                  className="px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    color: theme.primary,
                    border: `1px solid ${theme.primary}20`
                  }}
                >
                  <span>LinkedIn</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -3 }}
                  className="px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    color: theme.primary,
                    border: `1px solid ${theme.primary}20`
                  }}
                >
                  <span>Copy Link</span>
                </motion.button>
                <TalkshowCompletionCelebration 
  show={showCompletionCelebration} 
  onClose={() => setShowCompletionCelebration(false)} 
/>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </>
  );
}