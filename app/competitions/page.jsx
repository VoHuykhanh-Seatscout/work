"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { m as motion } from "framer-motion";
import { PlusIcon, SearchIcon, ChevronDownIcon, UserCircleIcon, PencilIcon, EyeIcon, AlertCircleIcon } from "lucide-react";
import { Listbox } from '@headlessui/react'
import { Tooltip } from '@nextui-org/react';


// Enhanced color palette with creative gradients
const colors = {
  primary: "#D84315", // Deep orange
  secondary: "#FF5722", // Vibrant orange
  accent: "#FF7043", // Lighter orangeMagnifyingGlassIcon
  dark: "#212121", // Charcoal
  light: "#FFF3E0", // Warm beige
  success: "#30D158", // Bright green (for success state)
  creativeGradient: "linear-gradient(135deg, #D84315 0%, #FF5722 100%)", // Deep-to-vibrant orange
  legoGradient: "linear-gradient(135deg, #FF7043 0%, #FF5722 100%)", // Lighter-to-vibrant orange
};

const tabs = [
  { id: "competitions", label: "Competitions", icon: "🏆", color: "#147EFB" },
  { id: "talkshows", label: "Talks & Workshops", icon: "🎤", color: "#FF2D55" },
];

const brandColors = {
  primary: "#D84315",     // Deep orange
  secondary: "#FF5722",   // Vibrant orange
  accent: "#FF7043",      // Lighter orange
  dark: "#212121",        // Charcoal
  light: "#FFF3E0",       // Warm beige
  creative: "#8A2BE2",
  success: "#30D158",
};

function calculateProfileCompletion(profile) {
  if (!profile) return { completion: 0, missingFields: [] };

  const fields = [
    { name: 'university', weight: 15 },
    { name: 'degree', weight: 15 },
    { name: 'graduationYear', weight: 10 },
    { name: 'skills', weight: 20, check: (val) => val?.length > 0 },
    { name: 'linkedin', weight: 10 },
    { name: 'github', weight: 10 },
    { name: 'resume', weight: 10 },
    { name: 'profileImage', weight: 5 },
    { name: 'aboutMe', weight: 5 }
  ];

  let completion = 0;
  const missingFields = [];

  fields.forEach(field => {
    const value = profile[field.name];
    const isComplete = field.check 
      ? field.check(value) 
      : Boolean(value);
    
    if (isComplete) {
      completion += field.weight;
    } else {
      missingFields.push({
        name: field.name,
        label: fieldLabels[field.name] || field.name
      });
    }
  });

  return { completion, missingFields };
}

const fieldLabels = {
  university: 'University',
  degree: 'Degree',
  graduationYear: 'Graduation Year',
  skills: 'Skills',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  resume: 'Resume',
  profileImage: 'Profile Photo',
  aboutMe: 'About Me'
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    date: "",
    status: ""
  });

  const formatTimeLeft = (startDate) => {
    if (!startDate) return "Coming soon";
    try {
      const now = new Date();
      const start = new Date(startDate);
      
      if (start < now) {
        return "Live now";
      }
      
      const daysLeft = differenceInDays(start, now);
      
      if (daysLeft === 0) {
        return "Starts today";
      } else if (daysLeft === 1) {
        return "1 day left";
      } else if (daysLeft < 7) {
        return `${daysLeft} days left`;
      } else {
        return `Starts in ${Math.floor(daysLeft/7)} weeks`;
      }
    } catch {
      return "Coming soon";
    }
  };

  const [profileCompletion, setProfileCompletion] = useState(0);
const [missingFields, setMissingFields] = useState([]);
const [studentProfile, setStudentProfile] = useState(null);

useEffect(() => {
  // Fetch student profile (you'll need to implement this API call)
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setStudentProfile(data);
      
      // Calculate completion
      const { completion, missingFields } = calculateProfileCompletion(data);
      setProfileCompletion(completion);
      setMissingFields(missingFields);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  fetchProfile();
}, []);

  useEffect(() => {
  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch both competitions and talkshows in parallel
      const [competitionsRes, talkshowsRes] = await Promise.all([
        fetch('/api/competitions'),
        fetch('/api/talkshows')
      ]);
      
      if (!competitionsRes.ok || !talkshowsRes.ok) {
        throw new Error("Failed to fetch events");
      }
      
      const [competitionsData, talkshowsData] = await Promise.all([
        competitionsRes.json(),
        talkshowsRes.json()
      ]);
      
      // Combine both types of events and add a type field
      const combinedEvents = [
        ...(competitionsData.competitions || []).map(event => ({ ...event, type: 'competition' })),
        ...(talkshowsData.talkshows || []).map(event => ({ ...event, type: 'talkshow' }))
      ];
      
      setEvents(combinedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  fetchAllEvents();
}, []);

  const filteredEvents = events.filter(event => {
    // Search by title or description
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category if selected
    const matchesCategory = 
      !filters.category || 
      event.category?.toLowerCase() === filters.category.toLowerCase();
    
    // Filter by date if selected
    const matchesDate = () => {
      if (!filters.date) return true;
      const eventDate = new Date(event.startDate);
      const now = new Date();
      
      switch(filters.date) {
        case "today":
          return eventDate.toDateString() === now.toDateString();
        case "week":
          return differenceInDays(eventDate, now) <= 7;
        case "month":
          return differenceInDays(eventDate, now) <= 30;
        default:
          return true;
      }
    };
    
    // Filter by status if selected
    const matchesStatus = () => {
      if (!filters.status) return true;
      const eventDate = new Date(event.startDate);
      const now = new Date();
      
      switch(filters.status) {
        case "upcoming":
          return eventDate > now;
        case "ongoing":
          return eventDate <= now && new Date(event.endDate) >= now;
        case "past":
          return new Date(event.endDate) < now;
        default:
          return true;
      }
    };
    
    return matchesSearch && matchesCategory && matchesDate() && matchesStatus();
  });

  // Extract unique categories for filter dropdown
  const categories = [...new Set(events.map(event => event.category))].filter(Boolean);

const renderEventCard = (event) => {
  // Determine event status
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  let status = 'upcoming';
  let statusText = '';
  let statusColor = 'green';
  
  if (now >= startDate && now <= endDate) {
    status = 'live';
    statusText = 'LIVE NOW';
    statusColor = 'purple';
  } else if (now > endDate) {
    status = 'ended';
    statusText = 'CLOSED';
    statusColor = 'gray';
  } else {
    const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
    statusText = daysUntil > 7 
      ? `STARTS IN ${Math.ceil(daysUntil/7)} WEEKS` 
      : `STARTS IN ${daysUntil} DAYS`;
    statusColor = daysUntil <= 3 ? 'red' : 'green';
  }

  // Fallback content
  const title = event.title?.trim() || 'Upcoming Competition';
  const description = event.description?.trim() || 'Compete to test your skills and win rewards.';
  const isVirtual = event.location === 'Virtual';

  return (
    <div 
      key={event.id}
      className="bg-white rounded-xl overflow-hidden flex flex-col h-full border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
    >
      {/* Image with Status Badge */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
  {/* Fallback background color shows if image fails to load */}
  {event.coverImage ? (
    <Image
      src={event.coverImage}
      alt={title}
      fill
      className="object-cover"
      priority
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
      <span className="text-gray-500 text-lg font-medium">No Image</span>
    </div>
  )}
  
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
  
  {/* Status Pill */}
  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
    statusColor === 'purple' ? 'bg-purple-100 text-purple-800' :
    statusColor === 'red' ? 'bg-red-100 text-red-800' :
    statusColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {statusText}
  </div>
  
  {/* Event Type Icon - Simplified */}
  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white">
    {isVirtual ? '🌐' : '📍'}
  </div>
</div>
      
      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h2 className="text-lg font-bold mb-2 line-clamp-1 text-gray-900">
          {title}
        </h2>
        
        {/* Meta Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            {event.type === "competition" ? "🏆 Competition" : "🎤 Event"}
          </span>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed min-h-[3rem]">
          {description}
        </p>
        
        {/* Stats */}
        {event.type === "competition" && (
          <div className="mt-auto mb-4 flex items-center text-xs text-gray-500 space-x-4">
            {event.participantsCount > 0 ? (
              <span className="flex items-center">
                <span className="mr-1.5">👥</span> {event.participantsCount} participants
              </span>
            ) : (
              <span className="text-purple-600 font-medium">Be the first to join!</span>
            )}
            
            {event.submissionsCount > 0 && (
              <span className="flex items-center">
                <span className="mr-1.5">📩</span> {event.submissionsCount} submissions
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Footer with CTA */}
      <div className="px-5 pb-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-xs text-gray-500 flex items-center">
            <span className="mr-1.5">🕒</span>
            {status === 'live' ? (
              <span>Ends {formatDate(endDate)}</span>
            ) : status === 'ended' ? (
              <span>Closed on {formatDate(endDate)}</span>
            ) : (
              <span>Starts {formatDate(startDate)}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="View details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleRegister(event.id)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold text-white ${
                status === 'ended' ? 'bg-gray-300 cursor-not-allowed' :
                status === 'live' ? 'bg-purple-600 hover:bg-purple-700' :
                'bg-green-600 hover:bg-green-700'
              } transition-colors`}
              disabled={status === 'ended'}
              aria-label={status === 'ended' ? 'Competition closed' : 'Register'}
            >
              {status === 'ended' ? 'Closed' : 
               event.type === "competition" ? 'Compete Now' : 'Join Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      <Navbar />
      
      {/* Simplified Hero Section */}
      <section className="relative overflow-hidden pt-[1.5rem] min-h-[calc(90vh-4.5rem)]">
        {/* Gradient Background (simplified) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e145e] via-[#2a1b7a] to-[#3d28a8] overflow-hidden">
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-400/10 opacity-20" />
        </div>
      
        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col lg:flex-row items-center justify-between gap-0">
          {/* Illustration Column - Left */}
          <div className="lg:w-1/2 flex items-center justify-center lg:justify-start h-full">
            <div className="relative w-full max-w-[850px] h-[80vh] min-h-[600px]">
              <Image 
                src="/1.svg" 
                alt="Student competing with laptop" 
                fill
                className="object-contain object-left drop-shadow-2xl"
                priority
              />
            </div>
          </div>
      
          {/* Text Column - Right */}
          <div className="lg:w-1/2 flex flex-col items-center text-center py-12 lg:py-24 px-4">
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-[6.75rem] font-extrabold text-white leading-tight tracking-tight text-center">
                <span className="block">Game On.</span>
                <span className="block text-yellow-400">Skills Out.</span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-white/80 max-w-lg leading-relaxed mb-12">
                Join competitions that sharpen your talent and put you on the map.
              </p>
              
              <button className="mt-[-1.5rem] flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold px-12 py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-2xl">
                🚀 LET'S GO NOW
              </button>
            </div>
          </div>
        </div>
      
        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#1e145e]/80 to-transparent -z-10"></div>
      </section>
      
      {/* Events Section - Simplified */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-20 bg-white" id="events">
  {/* Section Header */}
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black">
      Upcoming Challenges & Events
    </h2>
    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
      Discover exciting competitions and talks to showcase your skills
    </p>
  </div>

  {/* Loading State */}
  {loading && (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 mb-5 rounded-full border-4 border-t-transparent border-yellow-400 animate-spin" />
      <p className="text-xl font-medium text-yellow-500">
        Loading events...
      </p>
    </div>
  )}

  {/* Events Content */}
  {!loading && !error && (
    <>
      {events.length > 0 ? (
        <div className="relative">
          {/* Horizontal Scroll Container */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 w-max min-w-full py-2">
              {events.map((event) => (
                <Link 
                  key={event.id} 
                  href={`/${event.type === 'talkshow' ? 'talkshows' : 'competitions'}/${event.id}`}
                  className="flex-shrink-0 w-[300px] sm:w-[350px]"
                >
                  <div className="cursor-pointer h-full rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                    {/* Card content */}
                    <div className="h-full">
                      {renderEventCard(event)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Scroll hint */}
          <div className="text-center mt-4 text-sm text-gray-500">
            ← Scroll to explore →
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-44 h-44 relative mb-8 mx-auto">
              <Image 
                src="/empty-events.svg" 
                alt="No events"
                fill
                className="object-contain opacity-90"
                priority
              />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              No events available
            </h3>
            <p className="text-gray-600 mb-8">
              Check back soon for upcoming competitions and talks
            </p>
            <button className="px-6 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 transition-colors">
              Notify Me
            </button>
          </div>
        </div>
      )}
    </>
  )}
</section>

{/* Compact Profile Completion CTA Section */}
<section className="py-10 px-4 relative overflow-hidden">
  {/* Purple gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#1e145e] via-[#2a1b7a] to-[#3d28a8] overflow-hidden">
    {/* Simplified glow animation */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-400/10"
      animate={{ opacity: [0.1, 0.15, 0.1] }}
      transition={{ duration: 12, repeat: Infinity }}
    />
    
    {/* Fewer particles */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white/10"
        style={{
          width: `${Math.random() * 4 + 2}px`,
          height: `${Math.random() * 4 + 2}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          x: [0, (Math.random() - 0.5) * 20],
          y: [0, (Math.random() - 0.5) * 20],
        }}
        transition={{
          duration: Math.random() * 15 + 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    ))}
  </div>

  <div className="max-w-3xl mx-auto relative z-10">
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl p-5 shadow-md border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Compact progress indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="5" />
              <motion.circle
                cx="50" cy="50" r="40" fill="none" stroke="#facc15" strokeWidth="5"
                strokeLinecap="round" strokeDasharray="251"
                strokeDashoffset={251 - (251 * (profileCompletion / 100))}
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 - (251 * (profileCompletion / 100)) }}
                transition={{ duration: 0.8 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center">
                <UserCircleIcon className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold mb-2">
            {profileCompletion === 100 ? "Complete! 🎉" : "Complete Profile"}
          </h2>
          <p className="text-gray-600 mb-3 text-sm">
            {profileCompletion === 100 ? "All set!" : `${profileCompletion}% complete - Your profile is almost ready – just a few clicks away!`}
          </p>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <motion.div 
              className="bg-yellow-400 h-2 rounded-full"
              style={{ width: `${profileCompletion}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <Link href="/profile/edit">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-black flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300"
              >
                <PencilIcon className="w-3.5 h-3.5" />
                {profileCompletion === 100 ? 'Update' : 'Complete'}
              </motion.button>
            </Link>
            
            <Link href="/profile">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 flex items-center gap-1.5 bg-white"
              >
                <EyeIcon className="w-3.5 h-3.5" />
                View
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {profileCompletion < 100 && missingFields.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-5 pt-4 border-t border-gray-100"
        >
          <h3 className="text-xs font-medium text-gray-500 mb-2">Missing:</h3>
          <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
            {missingFields.slice(0, 3).map((field) => (
              <div
                key={field.name}
                className="px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-700 flex items-center gap-1"
              >
                <AlertCircleIcon className="w-3 h-3 text-yellow-500" />
                {field.label}
              </div>
            ))}
            {missingFields.length > 3 && (
              <div className="px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-500">
                +{missingFields.length - 3} more
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  </div>
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
    </div>
  )
}