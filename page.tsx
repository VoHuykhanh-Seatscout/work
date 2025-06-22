"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow, format } from "date-fns";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { FiCalendar, FiMail, FiGlobe, FiArrowLeft, FiMessageSquare, FiUser, FiAward, FiBook, FiClock, FiUsers, FiShare2, FiMic } from "react-icons/fi";

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
  speakers: any; // JSON field
  agenda: any; // JSON field
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
      // If it's already parsed (could happen if Prisma client changes)
      if (typeof jsonString === 'object') return jsonString;
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  };

const tabs = [
  { id: "about", label: "About", icon: FiBook },
  { id: "agenda", label: "Agenda", icon: FiCalendar },
  { id: "speakers", label: "Speakers", icon: FiMic },
  { id: "contact", label: "Contact", icon: FiMail },
];

export default function TalkshowDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [talkshow, setTalkshow] = useState<Talkshow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!talkshow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Talkshow not found</p>
      </div>
    );
  }

  const deadlinePassed = talkshow.registrationDeadline 
  ? new Date(talkshow.registrationDeadline) < new Date() 
  : false;

const parsedSpeakers = safeParseJson(talkshow.speakers);
const parsedAgenda = safeParseJson(talkshow.agenda);

  // Hero Section Component
  const HeroSection = () => (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl mb-12 shadow-2xl"
      >
        <div className="relative h-[32rem] w-full">
          <Image
            src={talkshow.thumbnail || "/default-coverImage.png"}
            alt={talkshow.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
          <div className="absolute inset-0 backdrop-blur-sm opacity-20" />
        </div>

        <div className="relative z-10 px-6 sm:px-8 pb-8 -mt-20">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-xl">
                  {talkshow.title}
                </h1>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 max-w-fit">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="relative h-16 w-16 rounded-full border-2 border-purple-400 shadow-lg overflow-hidden"
                >
                  <Image
                    src={talkshow.organizer.profileImage || "/default-profile.png"}
                    alt={talkshow.organizer.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </motion.div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">Hosted by</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-white">
                      {talkshow.organizerName}
                    </h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/profile/${talkshow.organizer.id}`)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-1.5 text-sm shadow-md hover:shadow-purple-500/20"
                      >
                        <FiUser size={14} /> View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 flex items-center gap-3 shadow-sm hover:border-purple-400/50 transition-all">
                  <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-400/30">
                    <FiCalendar className="text-purple-300" size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-300 uppercase tracking-wider font-medium">Date</p>
                    <p className="font-semibold text-white">
                      {safeFormatDate(talkshow.date)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 flex items-center gap-3 shadow-sm hover:border-purple-400/50 transition-all">
                  <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-400/30">
                    <FiClock className="text-purple-300" size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-300 uppercase tracking-wider font-medium">Time</p>
                    <p className="font-semibold text-white">
                      {talkshow.time}
                    </p>
                  </div>
                </div>
                
                <div className="bg-amber-800/70 backdrop-blur-sm p-4 rounded-xl border border-amber-700/50 flex items-center gap-3 shadow-sm hover:border-amber-400/50 transition-all">
                  <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-400/30">
                    <FiClock className="text-amber-300" size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs text-amber-100 uppercase tracking-wider font-medium">Registration</p>
                    <p className="font-semibold text-amber-50">
                      {safeFormatDate(talkshow.registrationDeadline)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800/80 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-400/30">
                    {talkshow.locationType === "online" ? (
                      <FiGlobe className="text-purple-300" size={18} strokeWidth={2} />
                    ) : talkshow.locationType === "offline" ? (
                      <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-300 uppercase tracking-wider font-medium">Location</p>
                    <p className="font-semibold text-white">
                      {talkshow.locationType === "online" ? (
                        talkshow.meetingLink || "Online event (link will be provided)"
                      ) : talkshow.locationType === "offline" ? (
                        talkshow.venueAddress || "In-person event (location details coming soon)"
                      ) : (
                        "Hybrid event (both online and in-person)"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto lg:min-w-[340px]">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-lg p-6 rounded-2xl border border-gray-700 shadow-xl">
                {talkshow.isRegistered ? (
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-center space-y-5"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-2 mx-auto relative">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">Registered!</h3>
                    <p className="text-sm text-green-200 mb-5">
                      You're all set for {talkshow.title}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push(`/message-organizer/${talkshow.organizer.id}`)}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-md"
                    >
                      <FiMessageSquare size={18} /> Message Organizer
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-white mb-3 text-center">Ready to Join?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-gray-800/70 p-3 rounded-lg border border-gray-700/50">
                        <FiUsers className="text-purple-400" size={20} strokeWidth={2} />
                        <div>
                          <p className="text-sm text-gray-300 font-medium">Attendees</p>
                          <p className="font-bold text-white text-lg">{talkshow.registrations?.length || 0} registered</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-800/70 p-3 rounded-lg border border-gray-700/50">
                        <FiMic className="text-purple-400" size={20} strokeWidth={2} />
                        <div>
                          <p className="text-sm text-gray-300 font-medium">Speakers</p>
                          <p className="font-bold text-white text-lg">{parsedSpeakers.length} featured</p>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleRegister}
                      disabled={deadlinePassed || isRegistering}
                      whileHover={!deadlinePassed && !isRegistering ? { 
                        scale: 1.03,
                        boxShadow: "0 5px 15px rgba(139, 92, 246, 0.3)"
                      } : {}}
                      whileTap={!deadlinePassed && !isRegistering ? { scale: 0.98 } : {}}
                      className={`w-full py-3.5 font-bold rounded-xl transition-all duration-300 text-lg ${
                        deadlinePassed || isRegistering
                          ? "bg-gray-700 cursor-not-allowed text-white/60"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {deadlinePassed
                        ? "Registration Closed"
                        : isRegistering
                        ? "Processing..."
                        : "Register Now"}
                    </motion.button>
                    {!deadlinePassed && (
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mt-3 flex items-center justify-center gap-2">
                          <FiClock size={16} />
                          Deadline: {safeFormatDate(talkshow.registrationDeadline)}
                          <span className="text-xs bg-amber-900/30 text-amber-200 px-2 py-1 rounded-full ml-2">
                            {formatDistanceToNow(new Date(talkshow.registrationDeadline), { addSuffix: true })}
                          </span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Enhanced Tab Navigation
  const TabNavigation = () => (
    <div className="sticky top-20 z-10 mb-8 bg-gradient-to-b from-gray-50 to-transparent pt-4 pb-2">
      <nav className="flex overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-md"
                  : "text-gray-600 hover:text-purple-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} className={activeTab === tab.id ? "text-white" : "text-gray-500"} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.span 
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  // Enhanced Tab Content with smooth transitions
  const TabContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl"
      >
        {activeTab === "about" && <AboutTab />}
        {activeTab === "agenda" && <AgendaTab />}
        {activeTab === "speakers" && <SpeakersTab />}
        {activeTab === "contact" && <ContactTab />}
      </motion.div>
    </AnimatePresence>
  );

  // Tab Content Components
  const AboutTab = () => (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-3xl font-bold mb-6 text-gray-800">Overview</h3>
        <div className="prose prose-lg max-w-none text-gray-700">
          {talkshow.description.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
          ))}
        </div>
        
        <div className="border-t border-gray-100 pt-8 mt-8">
          <h3 className="text-3xl font-bold mb-6 text-gray-800">Event Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-800">
                <FiMessageSquare size={20} />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Q&A Session</h4>
                <p className="text-sm text-gray-600">
                  {talkshow.enableQandA 
                    ? "Live Q&A will be available during the event"
                    : "Q&A will not be available for this event"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Polls</h4>
                <p className="text-sm text-gray-600">
                  {talkshow.enablePolls 
                    ? "Interactive polls will be conducted during the event"
                    : "No polls scheduled for this event"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Reactions</h4>
                <p className="text-sm text-gray-600">
                  {talkshow.allowReactions 
                    ? "Attendees can react with emojis during the event"
                    : "Reactions will be disabled for this event"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Discussion</h4>
                <p className="text-sm text-gray-600">
                  {talkshow.enableQandA 
                    ? "Live discussion will be available during the event"
                    : "Discussion will be moderated for this event"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {talkshow.tags.length > 0 && (
          <div className="border-t border-gray-100 pt-8 mt-8">
            <h3 className="text-3xl font-bold mb-6 text-gray-800">Tags</h3>
            <div className="flex flex-wrap gap-3">
              {talkshow.tags.map((tag) => (
                <motion.span 
                  key={tag}
                  whileHover={{ y: -2 }}
                  className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const AgendaTab = () => (
    <div className="space-y-8">
      <h3 className="text-3xl font-bold mb-6 text-gray-800">Event Agenda</h3>
      
      {parsedAgenda.length > 0 ? (
        <div className="space-y-6">
          {parsedAgenda.map((item: any, index: number) => {
            const speaker = parsedSpeakers.find((s: any) => s.id === item.speakerId);
            return (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium w-fit">
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
                
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.description }} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">Agenda details coming soon</p>
        </div>
      )}
    </div>
  );

  const SpeakersTab = () => (
    <div className="space-y-8">
      <h3 className="text-3xl font-bold mb-6 text-gray-800">Featured Speakers</h3>
      
      {parsedSpeakers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parsedSpeakers.map((speaker: any) => (
            <div key={speaker.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
                <p className="text-purple-600 font-medium mb-2">{speaker.title}</p>
                <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: speaker.bio }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">Speakers will be announced soon</p>
        </div>
      )}
    </div>
  );

  const ContactTab = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-3xl font-bold mb-6 text-gray-800">Contact Information</h3>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-800">
              <FiMail size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Organizer Email</p>
              <a 
                href={`mailto:${talkshow.organizer.email}`} 
                className="text-purple-600 hover:underline text-lg"
              >
                {talkshow.organizer.email}
              </a>
            </div>
          </div>
          
          {talkshow.socialMediaLinks.length > 0 && (
            <div className="flex items-start gap-4">
              <div className="p-3 bg-pink-100 rounded-lg text-pink-800">
                <FiShare2 size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-3">Social Media</p>
                <div className="flex flex-wrap gap-3">
                  {talkshow.socialMediaLinks.map((link: string, index: number) => (
                    <a 
                      key={index} 
                      href={link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 transition flex items-center gap-2"
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
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Share This Talkshow</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2">
            <span>Twitter</span>
          </button>
          <button className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition flex items-center gap-2">
            <span>LinkedIn</span>
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg transition flex items-center gap-2">
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#1F2937',
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

          <HeroSection />
          <TabNavigation />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <TabContent />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}