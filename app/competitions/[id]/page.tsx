"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow, format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiArrowLeft, 
  FiShare2, 
  FiClock, 
  FiCalendar, 
  FiAward, 
  FiUser,
  FiAlertCircle,
  FiSearch,
  FiChevronRight,
  FiLock
} from "react-icons/fi";
import Image from "next/image";

// Components
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/competitions/HeroSection";
import TabNavigation from "@/components/competitions/TabNavigation";
import TabContent from "@/components/competitions/TabContent";
import type { Submission, User } from '@prisma/client';
import WinnerCelebration from "@/components/competitions/WinnersCelebration"

// Types
import type { CompetitionDetails as CompetitionDetailsType, Prize, SubmissionWithWinnerInfo } from "@/types/competition";

// Brand colors
const brandColors = {
  primary: "#5B2EFF",     // Bold electric purple (for buttons, highlights)
  secondary: "#3B1AB3",   // Deep violet (used in backgrounds or nav)
  accent: "#F4C300",    // Vivid yellow (for CTAs like "Start Competing")
  dark: "#0B0F19",        // Very dark navy (text and depth contrast)
  light: "#F4F6FF",       // Soft lavender white (backgrounds, cards)
  creative: "#FF7AD5",    // Vibrant pink (creative accents or tags)
  success: "#32D74B",     // Bright green (confirmation/status colors)
};

function safeFormatDate(dateString: string | Date | undefined, formatStr: string = 'MMM d, yyyy'): string {
  if (!dateString) return 'Date not specified';
  
  try {
    // Create date in local timezone but ignore time portion
    const date = new Date(dateString);
    const localDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    
    return format(localDate, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}


type Platform = 'twitter' | 'facebook' | 'linkedin' | 'copy';

interface PlatformData {
  color: string;
  icon: string;
  label: string;
}

interface WinnerData {
  prize: Prize;
  winner: (Submission & { user: User }) | null;
}

const WinnerBanner = ({ router }: { router: ReturnType<typeof useRouter> }) => {
  const [showCelebration, setShowCelebration] = useState(true);

  return (
    <>
      {showCelebration && (
        <WinnerCelebration onClose={() => setShowCelebration(false)} />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8"
      >
        <div 
          className="relative bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 md:p-8 overflow-hidden"
          style={{
            boxShadow: `0 10px 40px ${brandColors.primary}15`
          }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200 rounded-full opacity-20" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-200 rounded-full opacity-20" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FiAward className="text-2xl text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-orange-900">
                    Congratulations! 🎉
                  </h3>
                </div>
                <p className="text-orange-800/90 max-w-2xl">
                  You've won a prize in this competition! Your submission stood out among many excellent entries. 
                  We'll be in touch shortly with details about your prize.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    router.push('/competitions');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Explore More Competitions
                  <FiChevronRight className="mt-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default function CompetitionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [competition, setCompetition] = useState<CompetitionDetailsType | null>(null);
  const [winners, setWinners] = useState<WinnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isWinner, setIsWinner] = useState(false);

  useEffect(() => {
    async function fetchCompetition() {
      try {
        const res = await fetch(`/api/competitions/${id}?includeRounds=true&includeWinners=true`);
        if (!res.ok) throw new Error("Competition not found");
        const data = await res.json();
        setCompetition(data);
        
        if (data.prizes) {
          const winnersData = data.prizes.map((prize: Prize & { winner?: Submission & { user: User } }) => ({
            prize,
            winner: prize.winner ? {
              ...prize.winner,
              user: prize.winner.user
            } : null
          }));
          setWinners(winnersData);

          if (session?.user?.id) {
            const userIsWinner = winnersData.some(
              (winnerData: WinnerData) => winnerData.winner?.user.id === session.user.id
            );
            setIsWinner(userIsWinner);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchCompetition();
  }, [id, session?.user?.id]);

  const handleRegister = async () => {
  if (!session?.user) {
    toast.error("You must be logged in to register.");
    return;
  }

  try {
    setIsRegistering(true);
    const res = await fetch("/api/competitions/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        competitionId: id,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Registration failed");
    }

    const result = await res.json();
    
    const updatedRes = await fetch(`/api/competitions/${id}`);
    const updatedData = await updatedRes.json();
    setCompetition(updatedData);
    
    toast.success(
      <div>
        <p>Successfully registered!</p>
        <p className="text-sm">+30 XP gained</p>
      </div>
    );
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Registration failed");
  } finally {
    setIsRegistering(false);
  }
};

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!competition) {
    return <NotFound />;
  }

  const deadlinePassed = competition.deadline 
    ? new Date(competition.deadline) < new Date() 
    : false;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background elements (keep this part) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10"
          style={{
            background: `radial-gradient(ellipse at 70% 70%, ${brandColors.accent}40, transparent 70%)`,
            filter: 'blur(100px)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%'
          }}
          animate={{
            x: [0, -80, -40, -60, 0],
            y: [0, 80, 40, 60, 0],
            rotate: [0, -20, 15, -5, 0],
            borderRadius: [
              '30% 70% 70% 30% / 30% 30% 70% 70%',
              '60% 40% 30% 70% / 60% 30% 70% 40%',
              '40% 60% 60% 40% / 40% 60% 60% 40%',
              '30% 70% 70% 30% / 30% 30% 70% 70%'
            ]
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 7
          }}
        />
      </div>

      <Navbar />
      <Toaster position="top-center" />
      
      {/* Hero section */}
<div className="max-w-7xl mx-auto px-6 pt-28">
  <HeroSection 
    competition={competition} 
    deadlinePassed={deadlinePassed}
    isRegistering={isRegistering}
    onRegister={handleRegister}
    router={router}
  />
</div>

{/* Only show WinnerBanner if winner exists */}
{isWinner && <WinnerBanner router={router} />}

{/* Main content with conditional spacing */}
<div className={`max-w-7xl mx-auto px-6 pb-2 space-y-8 relative z-10 ${isWinner ? 'mt-[-16px]' : 'mt-[-16px]'}`}>
  {/* Enhanced Metadata Cards with Concentrated, Visible Shadows */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Timeline Card */}
    <div 
      className="flex items-center gap-5 p-4 rounded-xl border border-neutral-100 bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{ boxShadow: '6px 7px 2px rgba(91, 46, 255, 0.25)' }}
    >
      <div className="flex-shrink-0">
        <Image 
          src="/n.png" 
          alt="Timeline" 
          width={80}  
          height={80}
          className="w-16 h-16 object-contain"  
        />
      </div>
      <div className="space-y-1">
        <h4 className="font-medium text-sm text-gray-500">Timeline</h4>
        <p className="text-xl font-medium text-gray-900">
          {formatCompetitionTimeline(competition.startDate, competition.endDate)}
        </p>
      </div>
    </div>

    {/* Current Round Card */}
    <div 
      className="flex items-center gap-5 p-4 rounded-xl border border-neutral-100 bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{ boxShadow: '6px 7px 2px rgba(59, 26, 179, 0.25)' }}
    >
      <div className="flex-shrink-0">
        <Image 
          src="/o.png" 
          alt="Current Round" 
          width={80}
          height={80}
          className="w-16 h-16 object-contain"
        />
      </div>
      <div className="space-y-1">
        <h4 className="font-medium text-sm text-gray-500">Current Round</h4>
        <p className="text-xl font-medium text-gray-900">
          {getCurrentRoundStatus(competition)}
        </p>
      </div>
    </div>

    {/* Prize Card */}
    <div 
      className="flex items-center gap-5 p-4 rounded-xl border border-neutral-100 bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{ boxShadow: '6px 7px 2px rgba(244, 195, 0, 0.25)' }}
    >
      <div className="flex-shrink-0">
        <Image 
          src="/p.png" 
          alt="Prize" 
          width={80}
          height={80}
          className="w-16 h-16 object-contain"
        />
      </div>
      <div className="space-y-1">
        <h4 className="font-medium text-sm text-gray-500">Prize</h4>
        <p className="text-xl font-medium text-gray-900">
          {getPrizeSummary(competition)}
        </p>
      </div>
    </div>
  </div>

  {/* Tab navigation */}
  <TabNavigation 
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    colors={brandColors}
  />
  
  {/* Tab content */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <TabContent 
      activeTab={activeTab}
      competition={competition}
      router={router}
      colors={brandColors}
    />
  </motion.div>

  {/* Enhanced Winners section and Creator profile */}
  <div className="pt-16 border-t border-neutral-100/50" pb-12px>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Winners section - Enhanced */}
      {winners.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
              <FiAward className="text-2xl text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight" style={{ color: brandColors.dark }}>
              Winners & Prizes
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {winners.map((winnerData: WinnerData) => (
              <WinnerCard 
                key={winnerData.prize.id}
                prize={winnerData.prize}
                winner={winnerData.winner}
                competitionTitle={competition.title}
                colors={brandColors}
              />
            ))}
          </div>
        </div>
      )}

      {/* Creator profile - Enhanced */}
      {competition.organizer && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
              <FiUser className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight" style={{ color: brandColors.dark }}>
              Challenge Creator
            </h3>
          </div>
          
          <div className="bg-white rounded-xl border border-neutral-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div 
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-md"
                style={{ boxShadow: `0 4px 20px ${brandColors.primary}15` }}
              >
                {competition.organizer.profileImage ? (
                  <img 
                    src={competition.organizer.profileImage} 
                    alt={competition.organizer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser size={28} className="text-neutral-500" />
                )}
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold" style={{ color: brandColors.dark }}>
                  {competition.organizer.name}
                </h4>
                <p className="text-sm font-medium" style={{ color: `${brandColors.dark}70` }}>
                  Competition Organizer
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

{/* Footer - Clean Apple-like design with all black text */}
<footer className="bg-white border-t border-gray-100 py-12 px-6 mt-20">
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
  );
}

interface CreativePillProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
  color?: string;
}

const CreativePill = ({ icon, title, children, accent = false, color = brandColors.primary }: CreativePillProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-4 rounded-xl border border-neutral-100 hover:shadow-sm transition-all"
    style={{
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      backgroundColor: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(8px)'
    }}
  >
    <div className="flex items-center gap-3 mb-2">
      <div 
        className={`p-2 rounded-lg ${accent ? 'bg-red-100 text-red-500' : 'bg-neutral-100'}`}
        style={{
          backgroundColor: `${color}10`,
          color: accent ? '#EF4444' : color
        }}
      >
        {icon}
      </div>
      <h4 
        className="font-medium text-sm"
        style={{ color: `${brandColors.dark}80` }}
      >
        {title}
      </h4>
    </div>
    <p 
      className={`text-lg ${accent ? 'text-red-500' : ''}`}
      style={{ 
        color: accent ? '#EF4444' : brandColors.dark,
        fontWeight: 500
      }}
    >
      {children}
    </p>
  </motion.div>
);

interface PlayfulShareButtonProps {
  platform: Platform;
  competitionId: string;
  competitionTitle: string;
  colors: typeof brandColors;
}

const PlayfulShareButton = ({ platform, competitionId, competitionTitle, colors }: PlayfulShareButtonProps) => {
  const platformData: Record<Platform, PlatformData> = {
    twitter: { color: colors.primary, icon: '🐦', label: 'Tweet' },
    facebook: { color: colors.secondary, icon: '👍', label: 'Share' },
    linkedin: { color: colors.accent, icon: '💼', label: 'Post' },
    copy: { color: colors.dark, icon: '🔗', label: 'Copy Link' }
  };

  const handleShare = () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/competitions/${competitionId}` : '';
    const title = `Check out this creative competition: ${competitionTitle}`;

    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
        break;
    }
  };

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className="px-5 py-3 rounded-lg flex items-center gap-2 text-sm font-medium transition-all"
      style={{ 
        backgroundColor: `${platformData[platform].color}10`, 
        color: platformData[platform].color,
        border: `1px solid ${platformData[platform].color}20`
      }}
    >
      <span className="text-lg">{platformData[platform].icon}</span>
      {platformData[platform].label}
    </motion.button>
  );
};

interface WinnerCardProps {
  prize: Prize;
  winner: (Submission & { user: User }) | null;
  competitionTitle: string;
  colors: typeof brandColors;
}

const WinnerCard = ({ prize, winner, competitionTitle, colors }: WinnerCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-6 rounded-xl border border-neutral-100 hover:shadow-sm transition-all"
    style={{
      backgroundColor: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div 
        className={`p-3 rounded-lg ${winner ? 'bg-yellow-100' : 'bg-gray-100'}`}
        style={{
          backgroundColor: winner ? `${colors.primary}10` : `${colors.dark}10`,
          color: winner ? colors.primary : `${colors.dark}50`,
          border: `1px solid ${winner ? `${colors.primary}20` : `${colors.dark}10`}`
        }}
      >
        <FiAward className="w-6 h-6" />
      </div>
      <div>
        <h4 
          className="font-medium"
          style={{ color: colors.dark }}
        >
          {prize.name}
        </h4>
        {prize.value && (
          <p 
            className="text-sm"
            style={{ color: `${colors.dark}70` }}
          >
            Value: {prize.value}
          </p>
        )}
      </div>
    </div>
    
    {winner ? (
      <div className="mt-4">
        <h5 
          className="text-sm font-medium mb-2"
          style={{ color: `${colors.dark}70` }}
        >
          Winner
        </h5>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm"
            style={{
              boxShadow: `0 2px 8px ${colors.primary}20`
            }}
          >
            {winner.user.profileImage ? (
              <img 
                src={winner.user.profileImage} 
                alt={winner.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser size={16} className="text-neutral-400" />
            )}
          </div>
          <div>
            <p 
              className="font-medium"
              style={{ color: colors.dark }}
            >
              {winner.user.name}
            </p>
            <p 
              className="text-xs"
              style={{ color: `${colors.dark}70` }}
            >
              {competitionTitle}
            </p>
          </div>
        </div>
      </div>
    ) : (
      <p 
        className="text-sm mt-4"
        style={{ color: `${colors.dark}70` }}
      >
        Winner not yet announced
      </p>
    )}
    
    {prize.description && (
      <p 
        className="text-sm mt-4"
        style={{ color: `${colors.dark}70` }}
      >
        {prize.description}
      </p>
    )}
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-12 h-12 rounded-full border-2 border-transparent"
      style={{
        borderTopColor: brandColors.primary,
        borderRightColor: brandColors.primary
      }}
    />
  </div>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center p-6 max-w-md">
      <div 
        className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"
        style={{
          boxShadow: `0 4px 12px ${brandColors.primary}20`
        }}
      >
        <FiAlertCircle size={24} className="text-red-500" />
      </div>
      <h3 
        className="text-lg font-medium mb-2"
        style={{ color: brandColors.dark }}
      >
        Something went wrong
      </h3>
      <p 
        className="text-sm"
        style={{ color: `${brandColors.dark}70` }}
      >
        {error}
      </p>
    </div>
  </div>
);

function getPrizeSummary(competition: any): string {
  // If we have structured prizes, show the highest prize
  if (competition.prizes?.length > 0) {
    // Sort by position (1st place first)
    const sortedPrizes = [...competition.prizes].sort((a, b) => a.position - b.position);
    const highestPrize = sortedPrizes[0];
    
    if (highestPrize.value) {
      // Format currency if value looks like a number
      if (/^\d+$/.test(highestPrize.value)) {
        return `$${Number(highestPrize.value).toLocaleString()}`;
      }
      return highestPrize.value;
    }
    return highestPrize.name || 'Exciting prizes';
  }
  
  // Fallback to legacy prize string
  if (competition.prize) {
    // If the prize string contains multiple prizes, just show the first one
    const firstPrize = competition.prize.split(/[;|,\n-]/)[0].trim();
    return firstPrize || 'Creative rewards';
  }
  
  return 'Creative rewards';
}

function formatCompetitionTimeline(startDate: string | Date, endDate: string | Date): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Normalize dates to local time (ignoring time portion)
    const startLocal = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endLocal = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    // If same day, show single date
    if (isSameDay(startLocal, endLocal)) {
      return format(startLocal, 'MMM d, yyyy');
    }
    
    // Same year, show without year for start date
    if (startLocal.getFullYear() === endLocal.getFullYear()) {
      return `${format(startLocal, 'MMM d')} - ${format(endLocal, 'MMM d, yyyy')}`;
    }
    
    // Different years, show full dates
    return `${format(startLocal, 'MMM d, yyyy')} - ${format(endLocal, 'MMM d, yyyy')}`;
  } catch (e) {
    console.error('Error formatting timeline:', e);
    return 'Invalid date range';
  }
}

// Update the isSameDay function to use local dates
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getCurrentRoundStatus(competition: CompetitionDetailsType): string {
  if (!competition.rounds || competition.rounds.length === 0) {
    return 'No rounds scheduled';
  }

  const now = new Date();
  const currentRound = competition.rounds.find(round => 
    new Date(round.startDate) <= now && new Date(round.endDate) >= now
  );

  if (currentRound) {
    return currentRound.name;
  }

  const upcomingRound = competition.rounds.find(round => 
    new Date(round.startDate) > now
  );

  if (upcomingRound) {
    return `Upcoming: ${upcomingRound.name}`;
  }

  return 'Competition ended';
}


const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center p-6 max-w-md">
      <div 
        className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4"
        style={{
          boxShadow: `0 4px 12px ${brandColors.primary}20`
        }}
      >
        <FiSearch size={24} className="text-yellow-500" />
      </div>
      <h3 
        className="text-lg font-medium mb-2"
        style={{ color: brandColors.dark }}
      >
        Competition not found
      </h3>
      <p 
        className="text-sm"
        style={{ color: `${brandColors.dark}70` }}
      >
        The competition you're looking for doesn't exist or may have been removed.
      </p>
    </div>
    
  </div>
);