"use client";
import { CompetitionDetails } from "@/types/competition";
import BusinessSidebar from "@/components/BusinessSidebar";
import OverviewSection from './components/OverviewSection';
import RoundsSection from './components/RoundsSection';
import SubmissionsSection from './components/SubmissionsSection';
import ParticipantsSection from './components/ParticipantsSection';
import HeroSection from './components/HeroSection';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Award, Calendar, Users, FileText, Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { 
  FiAward, 
  FiArrowLeft,
  FiGrid,
  FiUsers
} from "react-icons/fi";

interface PageProps {
  params: {
    id: string
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
};

async function getCompetition(id: string): Promise<CompetitionDetails> {
  const res = await fetch(`http://localhost:3000/api/competitions/${id}?includeRounds=true&includeWinners=true`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) throw new Error('Failed to fetch competition');
  return res.json();
}

export default async function CompetitionDetailPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions);
  const competition = await getCompetition(params.id);
  const isOrganizer = session?.user?.id === competition.organizer.id;

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