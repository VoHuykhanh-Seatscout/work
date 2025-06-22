"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiAward, FiUsers, FiClock, FiMessageSquare, FiBook, FiArrowRight } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useState } from 'react';

// Updated brand colors to match your home page
const brandColors = {
  primary: "#5B2EFF",     // Bold electric purple (for buttons, highlights)
  secondary: "#3B1AB3",   // Deep violet (used in backgrounds or nav)
  accent: "#F4C300",    // Vivid yellow (for CTAs like "Start Competing")
  dark: "#0B0F19",        // Very dark navy (text and depth contrast)
  light: "#F4F6FF",       // Soft lavender white (backgrounds, cards)
  creative: "#FF7AD5",    // Vibrant pink (creative accents or tags)
  success: "#32D74B",     // Bright green (confirmation/status colors)
};

export default function HeroSection({ 
  competition,
  deadlinePassed,
  isRegistering,
  onRegister,
  router,
  submission
}: {
  competition: any;
  deadlinePassed: boolean;
  isRegistering: boolean;
  onRegister: () => void;
  router: any;
  submission?: any;
}) {
  // Get current round information
  const currentRound = competition.rounds?.find((round: any) => 
    new Date(round.startDate) <= new Date() && 
    new Date(round.endDate) >= new Date()
  );

  // Get next round for the user's submission
  const nextRound = submission?.nextRoundId 
    ? competition.rounds?.find((round: any) => round.id === submission.nextRoundId)
    : null;

  // Get the highest prize (lowest position number)
  const highestPrize = competition.prizes?.length 
    ? competition.prizes.reduce((prev: any, current: any) => 
        (prev.position < current.position) ? prev : current)
    : null;

  return (
    <div className="relative overflow-hidden rounded-3xl mb-12 border border-white/20">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GradientBackground />
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
        <CoverImage competition={competition} />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <CompetitionInfo 
                competition={competition} 
                currentRound={currentRound}
                nextRound={nextRound}
                highestPrize={highestPrize}
              />
              <RegistrationPanel 
                competition={competition}
                deadlinePassed={deadlinePassed}
                isRegistering={isRegistering}
                onRegister={onRegister}
                router={router}
                currentRound={currentRound}
                nextRound={nextRound}
                highestPrize={highestPrize}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

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
    className="relative w-full overflow-hidden"
    style={{
      aspectRatio: '1.9/1', 
      height: 'auto' // Let the height be determined by the aspect ratio
    }}
    initial={{ scale: 1.1 }}
    animate={{ scale: 1 }}
    transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
  >
    <Image
      src={competition.coverImage || "/default-coverImage.png"}
      alt={competition.title}
      fill
      className="object-cover"
      priority
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1536px"
      quality={100}
    />
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

const CompetitionInfo = ({ 
  competition, 
  currentRound,
  nextRound,
  highestPrize
}: { 
  competition: any;
  currentRound: any;
  nextRound: any;
  highestPrize: any;
}) => (
  <motion.div 
    className="flex-1 space-y-6 backdrop-blur-lg bg-white/90 p-8 rounded-2xl shadow-2xl border border-white/30"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2, duration: 0.8 }}
    style={{
      boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)'
    }}
  >
    <CompetitionTitle title={competition.title} />
    {competition.tagline && <Tagline tagline={competition.tagline} />}
    
    {/* Show current round or next round info */}
    {(currentRound || nextRound) && (
      <RoundStatusCard 
        currentRound={currentRound} 
        nextRound={nextRound} 
        competitionId={competition.id}
      />
    )}
    
    <StatusIndicators 
      competition={competition} 
      highestPrize={highestPrize}
    />
  </motion.div>
);

const RoundStatusCard = ({ currentRound, nextRound, competitionId }: any) => {
  const isNextRound = nextRound && !currentRound;
  const round = currentRound || nextRound;
  const isActive = !!currentRound;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-4 rounded-lg border"
      style={{
        backgroundColor: isActive 
          ? `${brandColors.primary}08` 
          : `${brandColors.secondary}08`,
        borderColor: isActive 
          ? `${brandColors.primary}20` 
          : `${brandColors.secondary}20`
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{
            backgroundColor: isActive 
              ? `${brandColors.primary}15` 
              : `${brandColors.secondary}15`,
            color: isActive 
              ? brandColors.primary 
              : brandColors.secondary
          }}
        >
          <FiBook size={20} />
        </div>
        <div>
          <h4 className="font-bold" style={{ color: brandColors.dark }}>
            {isNextRound ? 'Your Next Round' : 'Current Round'}
          </h4>
          <p className="text-sm" style={{ color: brandColors.dark }}>
            {round.name}
          </p>
          <Link 
            href={`/competitions/${competitionId}/rounds/${round.id}`}
            className="inline-flex items-center gap-1 mt-2 text-sm"
            style={{ color: isActive ? brandColors.primary : brandColors.secondary }}
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
      label={competition.categories[0] || 'Creative'} 
      color={brandColors.primary}
      icon={<FiAward className="w-4 h-4" />}
    />
    <StatusIndicator 
      label={`${competition.participants.length} Creators`} 
      color={brandColors.secondary}
      icon={<FiUsers className="w-4 h-4" />}
    />
    <StatusIndicator 
      label={highestPrize ? `${highestPrize.value || highestPrize.name}` : 'Exciting Prizes'} 
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

const RegistrationPanel = ({ 
  competition,
  deadlinePassed,
  isRegistering,
  onRegister,
  router,
  currentRound,
  nextRound,
  highestPrize
}: {
  competition: any;
  deadlinePassed: boolean;
  isRegistering: boolean;
  onRegister: () => void;
  router: any;
  currentRound?: any;
  nextRound?: any;
  highestPrize?: any;
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
      {competition.isRegistered ? (
        <RegisteredState 
          competition={competition} 
          router={router}
          currentRound={currentRound}
          nextRound={nextRound}
        />
      ) : (
        <RegistrationState 
          competition={competition}
          deadlinePassed={deadlinePassed}
          isRegistering={isRegistering}
          onRegister={onRegister}
          highestPrize={highestPrize}
        />
      )}
    </div>
  </motion.div>
);

const RegisteredState = ({ 
  competition, 
  router,
  currentRound,
  nextRound
}: { 
  competition: any; 
  router: any;
  currentRound?: any;
  nextRound?: any;
}) => (
  <div className="text-center space-y-6">
    <SuccessAnimation />
    <h3 className="text-2xl font-bold mb-2" style={{ color: brandColors.dark }}>
      You're Registered!
    </h3>
    
    {/* Show current round action if available */}
    {currentRound && (
      <RoundActionButton
        label="Go to Current Round"
        roundId={currentRound.id}
        competitionId={competition.id}
        color={brandColors.primary}
        router={router}
      />
    )}
    
    {/* Show next round action if available */}
    {nextRound && (
      <RoundActionButton
        label="Start Next Round"
        roundId={nextRound.id}
        competitionId={competition.id}
        color={brandColors.secondary}
        router={router}
      />
    )}
    
    <ChatWithHostButton organizerId={competition.organizer.id} router={router} />
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

const SuccessAnimation = () => (
  <motion.div 
    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 mx-auto relative"
    style={{
      backgroundColor: `${brandColors.primary}10`,
      border: `2px dashed ${brandColors.primary}`
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
      style={{ color: brandColors.primary }}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  </motion.div>
);

const ChatWithHostButton = ({ organizerId, router }: { organizerId: string; router: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChatClick = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/messages/conversations/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: organizerId })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const { conversation } = await res.json();
      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError("Failed to start conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <motion.button
        whileHover={{ 
          scale: 1.03, 
          boxShadow: `0 8px 20px ${brandColors.primary}40`
        }}
        whileTap={{ scale: 0.98 }}
        onClick={handleChatClick}
        className="w-full py-4 font-medium rounded-xl transition-all flex items-center justify-center gap-3 text-lg"
        style={{
          background: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.secondary})`,
          color: 'white',
          boxShadow: `0 4px 15px ${brandColors.primary}30`
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">↻</span>
            Loading...
          </span>
        ) : (
          <>
            <FiMessageSquare size={20} /> 
            <span>Chat with Host</span>
          </>
        )}
      </motion.button>
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

const RegistrationState = ({ 
  competition,
  deadlinePassed,
  isRegistering,
  onRegister,
  highestPrize
}: {
  competition: any;
  deadlinePassed: boolean;
  isRegistering: boolean;
  onRegister: () => void;
  highestPrize?: any;
}) => (
  <div className="space-y-6">
    <h3
  className="font-bold mb-4 text-center text-[25px]"
  style={{ color: brandColors.dark }}
>
  Join the Challenge
</h3>


    
    <div className="space-y-4">
      <InfoCard 
        icon={<FiAward size={22} />}
        title="Prize Pool"
        value={competition.prizes?.length ? (
          <div className="flex flex-col">
            {competition.prizes.slice(0, 3).map((prize: any) => (
              <span key={prize.id}>
                {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'} 
                {prize.value ? `${prize.value}` : prize.name}
              </span>
            ))}
            {competition.prizes.length > 3 && (
              <span className="text-sm opacity-80">+{competition.prizes.length - 3} more</span>
            )}
          </div>
        ) : competition.prize || "Exciting prizes"}
        color={brandColors.primary}
      />
      <InfoCard 
        icon={<FiUsers size={22} />}
        title="Community"
        value={`${competition.participants.length} creators`}
        color={brandColors.secondary}
      />
    </div>
    
    <RegisterButton 
      deadlinePassed={deadlinePassed}
      isRegistering={isRegistering}
      onRegister={onRegister}
    />
    
    {!deadlinePassed && (
      <DeadlineCountdown deadline={competition.deadline} />
    )}
  </div>
);

const InfoCard = ({ icon, title, value, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: React.ReactNode; // Changed from string to ReactNode
  color: string;
}) => (
  <motion.div 
    whileHover={{ y: -4, scale: 1.02 }}
    className="flex items-center gap-4 p-4 rounded-xl border"
    style={{
      backgroundColor: `${color}08`,
      borderColor: `${color}20`,
      backdropFilter: 'blur(4px)'
    }}
  >
    <div 
      className="p-3 rounded-lg flex-shrink-0"
      style={{
        backgroundColor: `${color}15`,
        color: color
      }}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium mb-1" style={{ color: brandColors.dark }}>
        {title}
      </p>
      <div className="font-bold text-lg" style={{ color: brandColors.dark }}>
        {value}
      </div>
    </div>
  </motion.div>
);

const RegisterButton = ({ 
  deadlinePassed,
  isRegistering,
  onRegister
}: {
  deadlinePassed: boolean;
  isRegistering: boolean;
  onRegister: () => void;
}) => (
  <motion.button
    onClick={onRegister}
    disabled={deadlinePassed || isRegistering}
    whileHover={!deadlinePassed && !isRegistering ? { 
      scale: 1.03,
      boxShadow: `0 10px 25px ${brandColors.primary}40`
    } : {}}
    whileTap={!deadlinePassed && !isRegistering ? { scale: 0.98 } : {}}
    className={`w-full py-4 font-bold rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
      deadlinePassed || isRegistering
        ? "bg-gray-100 cursor-not-allowed"
        : "text-white shadow-xl"
    }`}
    style={{
      background: !deadlinePassed && !isRegistering 
        ? `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.secondary})`
        : undefined,
      color: deadlinePassed || isRegistering ? `${brandColors.dark}40` : 'white'
    }}
  >
    {isRegistering && <LoadingBar />}
    <span className="relative z-10 flex items-center justify-center gap-2">
      {deadlinePassed
        ? "Registration Closed"
        : isRegistering
        ? <RegisteringState />
        : <RegisterNowState />}
    </span>
  </motion.button>
);

const LoadingBar = () => (
  <motion.span
    className="absolute left-0 top-0 h-full bg-white/30"
    initial={{ width: 0 }}
    animate={{ width: '100%' }}
    transition={{ duration: 2, repeat: Infinity }}
  />
);

const RegisteringState = () => (
  <>
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Securing Your Spot...
  </>
);

const RegisterNowState = () => (
  <>
    Register Now 
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
    </svg>
  </>
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
          <span>Closes in </span>
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