
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaTrophy, FaMicrophone, FaUsers, FaRegSmile, FaRocket, FaPalette, FaCode, FaLightbulb, FaCalendarAlt } from "react-icons/fa";
import { FiPlusCircle, FiAward, FiTrendingUp, FiChevronRight } from "react-icons/fi";
import { Sword, Sparkles, Award, Mic, Calendar } from "lucide-react";
import BusinessSidebar from "@/components/BusinessSidebar";

type EventType = 'competition' | 'talkshow';

interface Event {
  id: string;
  title: string;
  endDate: string;
  type: EventType;
  prizePool?: string;
  speaker?: string;
  participants?: number;
}

export default function BusinessOverview() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);

        if (!session?.user?.id) {
          throw new Error("User session not found");
        }

        // Only fetch competitions for the current organizer
        const competitionsRes = await fetch(`/api/competitions?organizerId=${session.user.id}`, { 
          credentials: "include", 
          signal 
        });

        if (!competitionsRes.ok) {
          throw new Error(`Failed to fetch events: ${competitionsRes.statusText}`);
        }

        const competitionsData = await competitionsRes.json();
        
        const competitions = competitionsData.competitions?.map((comp: any) => ({
          id: comp.id,
          title: comp.title,
          type: 'competition' as EventType,
          endDate: comp.endDate,
          prizePool: comp.prize,
          // Count registrations for this competition
          participants: comp._count?.registrations || 0
        })) || [];

        setEvents(competitions);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
    return () => controller.abort();
  }, [session?.user?.id]); // Re-fetch when user ID changes


  const formatDate = (dateString: string) => {
    if (!dateString) return "No date set";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const getEventStatus = (endDate: string) => {
    if (!endDate) return { text: "Undefined", class: "bg-gray-100 text-gray-700" };
    
    const now = new Date();
    const end = new Date(endDate);
    
    if (isNaN(end.getTime())) return { text: "Invalid date", class: "bg-gray-100 text-gray-700" };
    
    return end > now
      ? { text: "Active", class: "bg-green-100 text-green-700" }
      : { text: "Completed", class: "bg-orange-100 text-orange-700" };
  };

  const getEventTypeBadge = (type: EventType) => {
    switch (type) {
      case 'competition':
        return { 
          text: "Heroic Challenge", 
          class: "bg-blue-100 text-blue-700",
          icon: <Award className="w-4 h-4" />
        };
      case 'talkshow':
        return { 
          text: "Hero's Council", 
          class: "bg-purple-100 text-purple-700",
          icon: <Mic className="w-4 h-4" />
        };
      default:
        return { 
          text: "Quest", 
          class: "bg-gray-100 text-gray-700",
          icon: <Sparkles className="w-4 h-4" />
        };
    }
  };

  return (
    <div className="flex min-h-screen bg-offWhite">
      {/* OROA Sidebar */}
      <BusinessSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        {/* Heroic Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-primary shadow-lg">
                <Sword className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-dark">
                Your Quests
              </h1>
            </div>
            <p className="text-medium">Manage your heroic challenges and councils</p>
          </div>
          <button 
            className="px-6 py-3 rounded-xl text-sm font-bold tracking-tight flex items-center justify-center whitespace-nowrap transition-all hover:shadow-lg active:scale-95 bg-primary text-white hover:bg-accent"
            onClick={() => router.push('/business-dashboard/create')}
          >
            <FiPlusCircle className="mr-2" />
            New Quest
          </button>
        </div>

        {/* Stats Overview */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-medium mb-1">Total Quests</p>
                  <h3 className="text-2xl font-bold text-dark">
                    {events.length}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FiAward className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-medium mb-1">Active Quests</p>
                  <h3 className="text-2xl font-bold text-dark">
                    {events.filter(e => getEventStatus(e.endDate).text === "Active").length}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <FiTrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-medium mb-1">Total Participants</p>
                  <h3 className="text-2xl font-bold text-dark">
                    {events.reduce((sum, event) => sum + (event.participants || 0), 0)}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <FaUsers className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-accent border-b-transparent animate-spin animation-delay-150"></div>
            </div>
            <p className="text-medium font-medium">Gathering your quests...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-6 rounded-xl mb-6 flex items-start bg-error/10 border-l-4 border-error">
            <div className="flex-shrink-0 mt-1 text-error">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-dark">Error loading quests</h3>
              <p className="text-medium">{error}</p>
              <button 
                className="mt-3 px-4 py-1.5 text-sm rounded-lg font-medium bg-error/20 text-dark"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl text-center bg-white shadow-soft border border-dashed border-primary/30">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-primary shadow-lg">
              <FaRocket className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-dark">No quests yet</h3>
            <p className="text-medium mb-6 max-w-md">
              Begin your journey by creating your first heroic challenge or council of experts.
            </p>
            <button 
              className="px-6 py-3 rounded-xl font-bold tracking-tight flex items-center transition-all hover:shadow-lg active:scale-95 bg-primary text-white hover:bg-accent"
              onClick={() => router.push('/business-dashboard/create')}
            >
              <FiPlusCircle className="mr-2" />
              Create Your First Quest
            </button>
          </div>
        )}

        {/* Events Table */}
        {!loading && !error && events.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl overflow-hidden bg-white shadow-medium">
              <table className="w-full">
                <thead>
                  <tr className="bg-light">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-primary">Quest</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-primary">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-primary">Participants</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-primary">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-primary">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-primary"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light">
                  {events.map((event) => {
                    const status = getEventStatus(event.endDate);
                    const typeBadge = getEventTypeBadge(event.type);
                    
                    return (
                      <tr
                        key={`${event.type}-${event.id}`}
                        className="hover:bg-primary/5 transition-colors duration-150 cursor-pointer group"
                        onClick={() => router.push(`/business-dashboard/${event.type}s/${event.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                              event.type === 'competition' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                            }`}>
                              {event.type === 'competition' ? <Award className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-dark">{event.title}</div>
                              <div className="text-xs text-medium mt-1">
                                {event.type === 'competition' 
                                  ? `🏆 ${event.prizePool || 'No prize pool'}`
                                  : `🎤 ${event.speaker || 'No speaker'}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {typeBadge.icon}
                            <span className="ml-2 text-sm font-medium text-dark">
                              {typeBadge.text}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaUsers className="text-secondary w-4 h-4" />
                            <span className="ml-2 text-sm font-medium text-dark">
                              {event.participants || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-secondary" />
                            <span className="ml-2 text-sm text-dark">
                              {formatDate(event.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <FiChevronRight className="w-5 h-5 text-secondary/60 group-hover:text-secondary transition-colors" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {events.map((event) => {
                const status = getEventStatus(event.endDate);
                const typeBadge = getEventTypeBadge(event.type);
                
                return (
                  <div
                    key={`${event.type}-${event.id}`}
                    className="p-5 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md group bg-white shadow-soft"
                    onClick={() => router.push(`/business-dashboard/${event.type}s/${event.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center ${
                          event.type === 'competition' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {event.type === 'competition' ? <Award className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-dark">{event.title}</h3>
                          <div className="flex flex-wrap mt-2 gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${typeBadge.class}`}>
                              {typeBadge.icon}
                              <span className="ml-1">{typeBadge.text}</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.class}`}>
                              {status.text}
                            </span>
                          </div>
                        </div>
                      </div>
                      <FiChevronRight className="w-5 h-5 text-secondary/60 group-hover:text-secondary transition-colors mt-1" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-light">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <FaUsers className="w-4 h-4 text-secondary mr-2" />
                          <span className="text-sm text-dark">
                            {event.participants || 0} participants
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 text-secondary mr-2" />
                          <span className="text-sm text-dark">
                            {formatDate(event.endDate)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-medium">
                        {event.type === 'competition' 
                          ? `🏆 ${event.prizePool || 'No prize pool'}`
                          : `🎤 ${event.speaker || 'No speaker'}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}