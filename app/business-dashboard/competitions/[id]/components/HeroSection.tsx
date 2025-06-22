"use client";

import { motion } from "framer-motion";
import { FiAward, FiUsers, FiClock, FiBook, FiArrowRight, FiEdit, FiEye } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitionDetails, Round } from "@/types/competition";
import Link from 'next/link';


// Brand colors
const brandColors = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
};

interface HeroSectionProps {
  competition?: CompetitionDetails | null;
  isOrganizer?: boolean;
  isLoading?: boolean;
}

interface CompetitionInfoProps {
  competition: CompetitionDetails;
  currentRound?: Round;
  highestPrize: string;
}

export default function HeroSection({ 
  competition,
  isOrganizer = false,
  isLoading = false
}: HeroSectionProps) {
  const router = useRouter();

  if (isLoading) {
    return <HeroSectionSkeleton />;
  }

  if (!competition) {
    return (
      <div className="relative overflow-hidden rounded-3xl mb-12 border border-white/20 h-[32rem] flex items-center justify-center">
        <div className="text-center">
          <p>Competition not found</p>
        </div>
      </div>
    );
  }

  const currentRound = competition.rounds?.find((round) => 
    new Date(round.startDate) <= new Date() && 
    new Date(round.endDate) >= new Date()
  );

  const highestPrize = competition.prize || "Exciting prizes";

  return (
    <div className="relative overflow-hidden rounded-3xl mb-12 border border-white/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GradientBackground />
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl"
        style={glassMorphismStyle}
      >
        <CoverImage competition={competition} />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <CompetitionInfo 
                competition={competition} 
                currentRound={currentRound}
                highestPrize={highestPrize}
              />
              <OrganizerPanel 
                competition={competition}
                isOrganizer={isOrganizer}
                router={router}
                currentRound={currentRound}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


// Skeleton loading state
const HeroSectionSkeleton = () => (
  <div className="relative overflow-hidden rounded-3xl mb-12 border border-white/20 h-[32rem]">
    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800" />
    <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 backdrop-blur-lg bg-white/90 p-8 rounded-2xl shadow-2xl border border-white/30">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-5/6 mb-6" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[360px]">
            <div className="p-8 rounded-2xl border shadow-2xl backdrop-blur-lg bg-white/95">
              <Skeleton className="h-8 w-3/4 mx-auto mb-6" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Updated CompetitionInfo with proper null checks
const CompetitionInfo = ({ 
  competition, 
  currentRound,
  highestPrize
}: CompetitionInfoProps) => (
  <motion.div 
    className="flex-1 space-y-6 backdrop-blur-lg bg-white/90 p-8 rounded-2xl shadow-2xl border border-white/30"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2, duration: 0.8 }}
  >
    <CompetitionTitle title={competition.title} />
    {competition.description && <Tagline tagline={competition.description} />}
    
    {currentRound && (
      <RoundStatusCard 
        currentRound={currentRound} 
        competitionId={competition.id}
      />
    )}
    
    <StatusIndicators 
      competition={competition} 
      highestPrize={highestPrize}
    />
  </motion.div>
);

const GradientBackground = () => (
  <div 
    className="absolute inset-0 opacity-10 animate-gradient"
    style={{
      backgroundImage: `
        radial-gradient(circle at 20% 30%, ${brandColors.primary} 0%, transparent 25%),
        radial-gradient(circle at 80% 70%, ${brandColors.secondary} 0%, transparent 25%),
        radial-gradient(circle at 50% 50%, ${brandColors.accent} 0%, transparent 15%)
      `,
      backgroundSize: '200% 200%',
      animation: 'gradientFlow 15s ease infinite'
    }}
  />
);

const glassMorphismStyle = {
  backdropFilter: 'blur(12px)',
  background: 'rgba(255, 255, 255, 0.05)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)'
};

const CoverImage = ({ competition }: { competition: any }) => (
  <motion.div 
    className="relative h-[32rem] w-full overflow-hidden"
    initial={{ scale: 1.1 }}
    animate={{ scale: 1 }}
    transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/30" />
    <div 
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, 
          ${brandColors.primary}15 0%, 
          ${brandColors.secondary}10 50%, 
          ${brandColors.accent}05 100%)`
      }}
    />
  </motion.div>
);



const RoundStatusCard = ({ currentRound, competitionId }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: `${brandColors.primary}08`,
        borderColor: `${brandColors.primary}20`
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{
            backgroundColor: `${brandColors.primary}15`,
            color: brandColors.primary
          }}
        >
          <FiBook size={20} />
        </div>
        <div>
          <h4 className="font-bold" style={{ color: brandColors.dark }}>
            Current Round
          </h4>
          <p className="text-sm" style={{ color: brandColors.dark }}>
            {currentRound.name}
          </p>
          <Link 
            href={`/competitions/${competitionId}/rounds/${currentRound.id}`}
            className="inline-flex items-center gap-1 mt-2 text-sm"
            style={{ color: brandColors.primary }}
          >
            View details <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const CompetitionTitle = ({ title }: { title: string }) => (
  <motion.h1 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.3 }}
    className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
    style={{
      background: `linear-gradient(45deg, 
        ${brandColors.primary} 0%, 
        ${brandColors.secondary} 50%, 
        ${brandColors.accent} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 2px 10px rgba(0,0,0,0.1)',
      lineHeight: 1.2
    }}
  >
    {title}
  </motion.h1>
);

const Tagline = ({ tagline }: { tagline: string }) => (
  <motion.p 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.4 }}
    className="text-xl md:text-2xl font-medium max-w-3xl leading-relaxed"
    style={{
      color: brandColors.dark,
      fontWeight: 450,
      textShadow: '0 1px 2px rgba(255,255,255,0.8)'
    }}
  >
    {tagline}
  </motion.p>
);

const StatusIndicators = ({ competition, highestPrize }: { competition: any; highestPrize: any }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="flex flex-wrap gap-3 mt-6"
  >
    <StatusIndicator 
      label={competition.category || 'Creative'} 
      color={brandColors.primary}
      icon={<FiAward className="w-4 h-4" />}
    />
    <StatusIndicator 
      label={`${competition.registrations?.length || 0} Participants`} 
      color={brandColors.secondary}
      icon={<FiUsers className="w-4 h-4" />}
    />
    <StatusIndicator 
      label={highestPrize} 
      color={brandColors.accent}
      icon={<FiAward className="w-4 h-4" />}
    />
  </motion.div>
);

const StatusIndicator = ({ label, color, icon }: { label: string; color: string; icon: React.ReactNode }) => (
  <motion.span
    whileHover={{ y: -3, scale: 1.05 }}
    className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
    style={{
      backgroundColor: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      backdropFilter: 'blur(4px)'
    }}
  >
    {icon}
    {label}
  </motion.span>
);

const OrganizerPanel = ({ 
  competition,
  isOrganizer,
  router,
  currentRound
}: {
  competition: any;
  isOrganizer: boolean;
  router: any;
  currentRound?: any;
}) => (
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
      {isOrganizer ? (
        <OrganizerState 
          competition={competition} 
          router={router}
          currentRound={currentRound}
        />
      ) : (
        <ViewerState 
          competition={competition}
          router={router}
        />
      )}
    </div>
  </motion.div>
);

const OrganizerState = ({ 
  competition, 
  router,
  currentRound
}: { 
  competition: any; 
  router: any;
  currentRound?: any;
}) => (
  <div className="text-center space-y-6">
    <h3 className="text-2xl font-bold mb-2" style={{ color: brandColors.dark }}>
      Competition Dashboard
    </h3>
    
    {/* Show current round action if available */}
    {currentRound && (
      <RoundActionButton
        label="Manage Current Round"
        roundId={currentRound.id}
        competitionId={competition.id}
        color={brandColors.primary}
        router={router}
      />
    )}
    
    <EditCompetitionButton competitionId={competition.id} router={router} />
    
    <ViewPublicPageButton competitionId={competition.id} router={router} />
  </div>
);

const ViewerState = ({ 
  competition,
  router
}: {
  competition: any;
  router: any;
}) => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: brandColors.dark }}>
      Competition Details
    </h3>
    
    <ViewPublicPageButton competitionId={competition.id} router={router} />
    
    <DeadlineCountdown deadline={competition.endDate} />
  </div>
);

const RoundActionButton = ({ 
  label, 
  roundId, 
  competitionId,
  color,
  router
}: {
  label: string;
  roundId: string;
  competitionId: string;
  color: string;
  router: any;
}) => (
  <motion.button
    whileHover={{ 
      scale: 1.03, 
      boxShadow: `0 8px 20px ${color}40`
    }}
    whileTap={{ scale: 0.98 }}
    onClick={() => router.push(`/competitions/${competitionId}/rounds/${roundId}`)}
    className="w-full py-3 font-medium rounded-xl transition-all flex items-center justify-center gap-3 text-lg"
    style={{
      backgroundColor: `${color}10`,
      color: color,
      border: `1px solid ${color}20`,
      boxShadow: `0 4px 15px ${color}20`
    }}
  >
    <FiBook size={20} /> 
    <span>{label}</span>
  </motion.button>
);

const EditCompetitionButton = ({ competitionId, router }: { competitionId: string; router: any }) => (
  <motion.button
    whileHover={{ 
      scale: 1.03, 
      boxShadow: `0 8px 20px ${brandColors.secondary}40`
    }}
    whileTap={{ scale: 0.98 }}
    onClick={() => router.push(`/competitions/${competitionId}/edit`)}
    className="w-full py-3 font-medium rounded-xl transition-all flex items-center justify-center gap-3 text-lg"
    style={{
      backgroundColor: `${brandColors.secondary}10`,
      color: brandColors.secondary,
      border: `1px solid ${brandColors.secondary}20`,
      boxShadow: `0 4px 15px ${brandColors.secondary}20`
    }}
  >
    <FiEdit size={20} /> 
    <span>Edit Competition</span>
  </motion.button>
);

const ViewPublicPageButton = ({ competitionId, router }: { competitionId: string; router: any }) => (
  <motion.button
    whileHover={{ 
      scale: 1.03, 
      boxShadow: `0 8px 20px ${brandColors.primary}40`
    }}
    whileTap={{ scale: 0.98 }}
    onClick={() => router.push(`/competitions/${competitionId}`)}
    className="w-full py-4 font-medium rounded-xl transition-all flex items-center justify-center gap-3 text-lg"
    style={{
      background: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.secondary})`,
      color: 'white',
      boxShadow: `0 4px 15px ${brandColors.primary}30`
    }}
  >
    <FiEye size={20} /> 
    <span>View Public Page</span>
  </motion.button>
);

const DeadlineCountdown = ({ deadline }: { deadline: string | undefined }) => {
  if (!deadline) {
    return (
      <div className="text-center">
        <p className="text-sm mt-4 flex items-center justify-center gap-2" style={{ color: brandColors.dark }}>
          <FiClock size={18} />
          <span>No deadline specified</span>
        </p>
      </div>
    );
  }

  try {
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error("Invalid date");
    }

    return (
      <div className="text-center">
        <motion.p 
          className="text-sm mt-4 flex items-center justify-center gap-2"
          style={{ color: brandColors.dark }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <FiClock size={18} />
          <span>Ends in </span>
          <motion.span 
            className="font-semibold"
            style={{ color: brandColors.accent }}
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
            {formatDistanceToNow(deadlineDate, { addSuffix: true })}
          </motion.span>
        </motion.p>
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center">
        <p className="text-sm mt-4 flex items-center justify-center gap-2" style={{ color: brandColors.dark }}>
          <FiClock size={18} />
          <span>Invalid deadline</span>
        </p>
      </div>
    );
  }
};