"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiShare2, FiDownload, FiAward, FiUsers, FiEdit, FiEye, FiGrid, FiCalendar, FiClock, FiLock, FiSearch } from "react-icons/fi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewSection from './components/OverviewSection';
import RoundsSection from './components/RoundsSection';
import SubmissionsSection from './components/SubmissionsSection';
import ParticipantsSection from './components/ParticipantsSection';
import HeroSection from './components/HeroSection';
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { CompetitionDetails } from "@/types/competition";
import BusinessSidebar from "@/components/BusinessSidebar";
import { Award, Calendar, Sword, ChevronRight, Trophy, Mic, Users, FileText, Sparkles } from "lucide-react";

interface PageProps {
  params: {
    id: string;
  };
}

const brandColors = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
};

export default function CompetitionDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [competition, setCompetition] = useState<CompetitionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const competitionId = params.id;
        if (!competitionId) {
          throw new Error('Competition ID is missing');
        }

        const response = await fetch(`/api/competitions/${competitionId}?includeRounds=true&includeWinners=true`);
        if (!response.ok) {
          throw new Error('Failed to fetch competition');
        }
        const data = await response.json();
        setCompetition(data);
        
        setIsOrganizer(session?.user?.id === data.organizer.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [params.id, session?.user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-offWhite">
        <BusinessSidebar />
        <div className="flex-1 p-6 md:p-8">
          <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-white/80 backdrop-blur-sm shadow-soft">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-accent border-b-transparent animate-spin animation-delay-150"></div>
            </div>
            <p className="text-medium font-medium">Gathering your quest details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="flex min-h-screen bg-offWhite">
        <BusinessSidebar />
        <div className="flex-1 p-6 md:p-8">
          <div className="p-6 rounded-xl mb-6 flex items-start bg-error/10 border-l-4 border-error">
            <div className="flex-shrink-0 mt-1 text-error">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-dark">Error loading quest</h3>
              <p className="text-medium">{error || "Competition not found"}</p>
              <button 
                className="mt-3 px-4 py-1.5 text-sm rounded-lg font-medium bg-error/20 text-dark"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    const now = new Date();
    const startDate = new Date(competition.startDate);
    const endDate = new Date(competition.endDate);
    
    if (now < startDate) {
      return { text: "Upcoming", class: "bg-blue-100 text-blue-700" };
    } else if (now > endDate) {
      return { text: "Completed", class: "bg-orange-100 text-orange-700" };
    } else {
      return { text: "Active", class: "bg-green-100 text-green-700" };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="flex min-h-screen bg-offWhite">
      {/* Business Sidebar */}
      <BusinessSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        {/* Back navigation */}
        <div className="mb-6">
          <motion.button
            onClick={() => router.back()}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-sm font-medium group"
          >
            <FiArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5 text-primary" />
            <span className="text-primary/80 group-hover:text-primary transition-all">Back to dashboard</span>
          </motion.button>
        </div>

        {/* Hero Section */}
        <HeroSection 
          competition={competition} 
          isOrganizer={isOrganizer}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-medium mb-1">Participants</p>
                <h3 className="text-2xl font-bold text-dark">
                  {competition.participants?.length || 0}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-medium mb-1">Submissions</p>
                <h3 className="text-2xl font-bold text-dark">
                  {competition.submissions?.length || 0}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-medium mb-1">Status</p>
                <h3 className="text-2xl font-bold text-dark">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.class}`}>
                    {statusBadge.text}
                  </span>
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-medium mb-1">Prize Pool</p>
                <h3 className="text-2xl font-bold text-dark">
                  {competition.prize || "None"}
                </h3>
              </div>
              <div className="p-2 rounded-lg bg-creative/10 text-creative">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-xl shadow-medium overflow-hidden">
          <Tabs defaultValue="overview">
            <TabsList className="bg-transparent p-0 border-b border-gray-200 w-full justify-start gap-0">
              <TabsTrigger 
                value="overview" 
                className="relative px-6 py-4 rounded-none group data-[state=active]:bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  <FiGrid className="h-5 w-5 text-primary/80 group-data-[state=active]:text-primary" />
                  <span className="text-primary/80 group-data-[state=active]:text-primary">Overview</span>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-data-[state=active]:scale-x-100 origin-left transition-transform duration-300 bg-primary" 
                />
              </TabsTrigger>
              
              <TabsTrigger 
                value="rounds" 
                className="relative px-6 py-4 rounded-none group data-[state=active]:bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  <FiAward className="h-5 w-5 text-primary/80 group-data-[state=active]:text-primary" />
                  <span className="text-primary/80 group-data-[state=active]:text-primary">Rounds</span>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-data-[state=active]:scale-x-100 origin-left transition-transform duration-300 bg-primary" 
                />
              </TabsTrigger>
              
              <TabsTrigger 
                value="submissions" 
                className="relative px-6 py-4 rounded-none group data-[state=active]:bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  <FiAward className="h-5 w-5 text-primary/80 group-data-[state=active]:text-primary" />
                  <span className="text-primary/80 group-data-[state=active]:text-primary">Submissions</span>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-data-[state=active]:scale-x-100 origin-left transition-transform duration-300 bg-primary" 
                />
              </TabsTrigger>
              
              <TabsTrigger 
                value="participants" 
                className="relative px-6 py-4 rounded-none group data-[state=active]:bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  <FiUsers className="h-5 w-5 text-primary/80 group-data-[state=active]:text-primary" />
                  <span className="text-primary/80 group-data-[state=active]:text-primary">Participants</span>
                </div>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-data-[state=active]:scale-x-100 origin-left transition-transform duration-300 bg-primary" 
                />
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="overview">
                <OverviewSection competition={competition} />
              </TabsContent>
              
              <TabsContent value="rounds">
                <RoundsSection 
                  competition={{
                    id: competition.id,
                    startDate: new Date(competition.startDate),
                    endDate: new Date(competition.endDate)
                  }}
                  roundDescriptions={competition.rounds?.map(round => ({
                    id: round.id,
                    name: round.name,
                    description: round.description || '',
                    startDate: round.startDate.toString(),
                    endDate: round.endDate.toString(),
                    deliverables: round.deliverables || '',
                    judgingMethod: round.judgingMethod || '',
                    criteria: JSON.stringify(round.criteria || {})
                  })) || []}
                />
              </TabsContent>
              
              <TabsContent value="submissions">
                <SubmissionsSection competitionId={competition.id} />
              </TabsContent>
              
              <TabsContent value="participants">
                <ParticipantsSection 
                  participants={competition.participants || []} 
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}