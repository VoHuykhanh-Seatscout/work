import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { FiClock, FiBook, FiAward, FiArrowRight } from "react-icons/fi";
import { brandColors } from "@/constants/colors";
import { safeFormatDate } from "@/utils/date";
import Link from "next/link";
import type { SubmissionStatus } from "@prisma/client";

// Define a fallback success color since it's not in brandColors
const SUCCESS_COLOR = '#10B981';


interface Round {
  id: string;
  name: string;
  description?: string | null;
  startDate: string | Date;
  endDate: string | Date;  // Changed from just string
  status: string;
  deliverables?: string | null;
  judgingMethod?: string | null;
}

interface TimelineTabProps {
  competition: {
    id: string;
    startDate: string | Date;
    deadline: string | Date;
    endDate: string | Date;
    rounds?: Round[];
    isRegistered: boolean;
  };
  submission?: {
    id: string;
    nextRoundId?: string;
    status: SubmissionStatus;
  };
}

export default function TimelineTab({ competition, submission }: TimelineTabProps) {
  if (!competition) return null;

  // Validate and filter rounds to ensure they have required fields
  const validRounds = (competition.rounds || [])
    .filter(round => 
      round.name && 
      round.startDate && 
      round.endDate && 
      !isNaN(new Date(round.startDate).getTime()) && 
      !isNaN(new Date(round.endDate).getTime())
    );

  // Create phases array with registration, submission, rounds, and winner announcement
  const phases = [
    { 
      name: "Registration Opens", 
      date: competition.startDate,
      description: "Participants can register for the competition",
      icon: <FiBook size={18} />,
      color: brandColors.primary
    },
    { 
      name: "Submission Deadline", 
      date: competition.deadline,
      description: "Last day to submit entries",
      icon: <FiBook size={18} />,
      color: brandColors.secondary
    },
    ...validRounds.map((round, index) => ({
      name: round.name,
      date: round.endDate,
      description: round.description || `Competition round ${index + 1}`,
      icon: <FiAward size={18} />,
      color: index % 2 === 0 ? brandColors.accent : SUCCESS_COLOR,
      roundData: round
    })),
    { 
      name: "Results Announcement", 
      date: competition.endDate,
      description: "Winners will be announced",
      icon: <FiAward size={18} />,
      color: brandColors.primary
    }
  ];

  // Sort phases by date, filtering out any with invalid dates
  const sortedPhases = phases
    .filter(phase => {
      try {
        return !isNaN(new Date(phase.date).getTime());
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentDate = new Date();
  
  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-bold" style={{ color: brandColors.neutral }}>
        Competition Timeline
      </h3>
      
      {sortedPhases.length > 0 ? (
        <div className="relative">
          <div 
            className="absolute left-4 h-full w-0.5 top-0"
            style={{ backgroundColor: `${brandColors.neutral}10` }}
          />
          
          <div className="space-y-8 pl-12">
            {sortedPhases.map((phase, index) => (
              <TimelinePhase
                key={`${phase.name}-${index}`}
                phase={phase}
                index={index}
                currentDate={currentDate}
                competition={competition}
                sortedPhases={sortedPhases}
                submission={submission}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-lg bg-gray-50 text-center">
          <p className="text-gray-500">No timeline data available</p>
        </div>
      )}
      
      {validRounds.length > 0 && (
        <RoundsSection 
          competition={{ ...competition, rounds: validRounds }} 
          submission={submission}
        />
      )}
    </div>
  );
}

const TimelinePhase = ({ 
  phase, 
  index, 
  currentDate, 
  competition,
  sortedPhases,
  submission
}: {
  phase: any;
  index: number;
  currentDate: Date;
  competition: any;
  sortedPhases: any[];
  submission?: any;
}) => {
  try {
    const phaseDate = new Date(phase.date);
    if (isNaN(phaseDate.getTime())) return null;

    const isActive = currentDate >= new Date(sortedPhases[Math.max(0, index-1)]?.date || competition.startDate) && 
                    currentDate <= phaseDate;
    const isPast = currentDate > phaseDate;
    const isRound = 'roundData' in phase;
    const isLiveRound = isRound && phase.roundData.status === 'live' && 
                       currentDate >= new Date(phase.roundData.startDate) && 
                       currentDate <= new Date(phase.roundData.endDate);
    
    // Check if this is the next round for an advanced submission
    const isNextRoundForSubmission = isRound && submission?.nextRoundId === phase.roundData.id;
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative"
      >
        <div 
          className="absolute -left-12 top-1 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center shadow-md"
          style={{
            backgroundColor: phase.color,
            borderColor: isActive ? phase.color : 'white'
          }}
        >
          {phase.icon}
        </div>
        
        <div 
          className="p-6 rounded-xl shadow-sm border transition-all"
          style={{
            backgroundColor: isActive ? `${phase.color}08` : 'white',
            borderColor: isActive ? `${phase.color}30` : `${brandColors.neutral}10`,
            boxShadow: isActive ? `0 4px 20px ${phase.color}15` : 'none'
          }}
        >
          <PhaseHeader phase={phase} isActive={isActive} isPast={isPast} />
          
          <p className="text-sm mb-4" style={{ color: brandColors.neutral }}>
            {phase.description}
            {isNextRoundForSubmission && (
              <span className="ml-2" style={{ color: SUCCESS_COLOR }}>(Your next round)</span>
            )}
          </p>
          
          {(isLiveRound || isNextRoundForSubmission) && competition.isRegistered && (
            <div className="mt-4">
              <Link 
                href={`/competitions/${competition.id}/rounds/${phase.roundData.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: isNextRoundForSubmission 
                    ? `${SUCCESS_COLOR}10` 
                    : `${phase.color}10`,
                  color: isNextRoundForSubmission 
                    ? SUCCESS_COLOR 
                    : phase.color,
                  border: `1px solid ${isNextRoundForSubmission 
                    ? `${SUCCESS_COLOR}20` 
                    : `${phase.color}20`}`
                }}
              >
                <span>
                  {isNextRoundForSubmission ? 'Start Next Round' : 'View Round Details'}
                </span>
                <FiArrowRight size={16} />
              </Link>
            </div>
          )}
          
          {isRound && (
            <RoundDetails round={phase.roundData} />
          )}
        </div>
      </motion.div>
    );
  } catch (error) {
    console.error('Error rendering timeline phase:', error);
    return null;
  }
};

const PhaseHeader = ({ phase, isActive, isPast }: any) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h4 className="font-bold text-xl mb-1" style={{ color: brandColors.neutral }}>
        {phase.name}
      </h4>
      <p className="flex items-center gap-2 text-sm mb-3" style={{ color: brandColors.neutral }}>
        <FiClock size={16} />
        {safeFormatDate(phase.date, 'MMM d, yyyy h:mm a')}
        {isActive && (
          <ActiveBadge color={phase.color} />
        )}
        {isPast && (
          <CompletedBadge />
        )}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <TimeRemainingBadge date={phase.date} color={phase.color} />
    </div>
  </div>
);

const ActiveBadge = ({ color }: { color: string }) => (
  <span 
    className="text-xs px-2 py-1 rounded-full ml-2"
    style={{
      backgroundColor: `${color}20`,
      color: color
    }}
  >
    Current Phase
  </span>
);

const CompletedBadge = () => (
  <span 
    className="text-xs px-2 py-1 rounded-full ml-2"
    style={{
      backgroundColor: `${brandColors.neutral}10`,
      color: brandColors.neutral
    }}
  >
    Completed
  </span>
);

const TimeRemainingBadge = ({ date, color }: { date: string; color: string }) => {
  if (!date) {
    return (
      <span 
        className="text-sm px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${color}10`,
          color: color,
          border: `1px solid ${color}20`
        }}
      >
        No date specified
      </span>
    );
  }

  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date");
    }

    return (
      <span 
        className="text-sm px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${color}10`,
          color: color,
          border: `1px solid ${color}20`
        }}
      >
        {formatDistanceToNow(parsedDate, { addSuffix: true })}
      </span>
    );
  } catch (error) {
    return (
      <span 
        className="text-sm px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${color}10`,
          color: color,
          border: `1px solid ${color}20`
        }}
      >
        Invalid date
      </span>
    );
  }
};

const RoundDetails = ({ round }: any) => (
  <div className="mt-4 space-y-4">
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h5 className="font-medium text-sm mb-1" style={{ color: brandColors.neutral }}>
          <FiClock className="inline mr-2" />
          Duration
        </h5>
        <p className="text-sm" style={{ color: brandColors.neutral }}>
          {safeFormatDate(round.startDate)} - {safeFormatDate(round.endDate)}
        </p>
      </div>
      
      {round.status && (
        <div>
          <h5 className="font-medium text-sm mb-1" style={{ color: brandColors.neutral }}>
            <FiBook className="inline mr-2" />
            Status
          </h5>
          <p className="text-sm capitalize" style={{ color: brandColors.neutral }}>
            {round.status}
            {round.status === 'live' && (
              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </p>
        </div>
      )}
    </div>
    
    {round.deliverables && (
      <div>
        <h5 className="font-medium text-sm mb-1" style={{ color: brandColors.neutral }}>
          <FiBook className="inline mr-2" />
          Deliverables
        </h5>
        <p className="text-sm" style={{ color: brandColors.neutral }}>
          {round.deliverables}
        </p>
      </div>
    )}
    
    {round.judgingMethod && (
      <div>
        <h5 className="font-medium text-sm mb-1" style={{ color: brandColors.neutral }}>
          <FiAward className="inline mr-2" />
          Judging Method
        </h5>
        <p className="text-sm" style={{ color: brandColors.neutral }}>
          {round.judgingMethod}
        </p>
      </div>
    )}
  </div>
);

const RoundsSection = ({ competition, submission }: { competition: any; submission?: any }) => {
  const currentDate = new Date();
  
  return (
    <div className="space-y-6 mt-12">
      <h3 className="text-2xl font-bold" style={{ color: brandColors.neutral }}>
        Round Details
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[...competition.rounds].sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        ).map((round: any) => (
          <RoundCard 
            key={round.id}
            round={round}
            currentDate={currentDate}
            competition={competition}
            submission={submission}
          />
        ))}
      </div>
    </div>
  );
};

const RoundCard = ({ round, currentDate, competition, submission }: any) => {
  const isLive = round.status === 'live' && 
                 currentDate >= new Date(round.startDate) && 
                 currentDate <= new Date(round.endDate);
  
  const isNextRoundForSubmission = submission?.nextRoundId === round.id;
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 rounded-xl border relative"
      style={{
        backgroundColor: `${brandColors.light}`,
        borderColor: `${brandColors.neutral}10`,
        boxShadow: `0 4px 12px ${brandColors.neutral}05`
      }}
    >
      {isNextRoundForSubmission && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Your Round
        </div>
      )}
      
      <RoundCardHeader round={round} isLive={isLive} isNextRound={isNextRoundForSubmission} />
      
      <RoundCardDetails round={round} />
      
      {/* Show View Assignment button for live rounds or next round */}
      {(isLive || isNextRoundForSubmission) && competition.isRegistered && (
        <ViewRoundDetailsButton 
          competitionId={competition.id}
          roundId={round.id}
          isNextRound={isNextRoundForSubmission}
        />
      )}
    </motion.div>
  );
};

const RoundCardHeader = ({ round, isLive, isNextRound }: any) => (
  <div className="flex items-start justify-between gap-4 mb-4">
    <h4 className="font-bold text-xl" style={{ 
      color: isNextRound ? SUCCESS_COLOR : brandColors.neutral 
    }}>
      {round.name}
    </h4>
    <RoundStatusBadge 
      status={round.status} 
      isLive={isLive} 
      isNextRound={isNextRound} 
    />
  </div>
);

const RoundStatusBadge = ({ status, isLive, isNextRound }: any) => (
  <span 
    className="text-xs px-2 py-1 rounded-full capitalize"
    style={{
      backgroundColor: isNextRound 
        ? `${SUCCESS_COLOR}10` 
        : isLive 
          ? `${brandColors.primary}10` 
          : status === 'completed' 
            ? `${brandColors.neutral}10` 
            : `${brandColors.secondary}10`,
      color: isNextRound 
        ? SUCCESS_COLOR 
        : isLive 
          ? brandColors.primary 
          : status === 'completed' 
            ? brandColors.neutral 
            : brandColors.secondary
    }}
  >
    {status}
    {(isLive || isNextRound) && (
      <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
    )}
  </span>
);

const RoundCardDetails = ({ round }: any) => (
  <>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-xs font-medium mb-1" style={{ color: brandColors.neutral }}>
          Start Date
        </p>
        <p className="text-sm" style={{ color: brandColors.neutral }}>
          {safeFormatDate(round.startDate)}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium mb-1" style={{ color: brandColors.neutral }}>
          End Date
        </p>
        <p className="text-sm" style={{ color: brandColors.neutral }}>
          {safeFormatDate(round.endDate)}
        </p>
      </div>
    </div>
    
    {round.description && (
      <div className="mb-4">
        <p className="text-xs font-medium mb-1" style={{ color: brandColors.neutral }}>
          Description
        </p>
        <div 
          className="prose max-w-none text-sm"
          style={{ color: brandColors.neutral }}
          dangerouslySetInnerHTML={{ __html: round.description }} 
        />
      </div>
    )}
    
    {round.deliverables && (
      <div className="mb-4">
        <p className="text-xs font-medium mb-1" style={{ color: brandColors.neutral }}>
          Deliverables
        </p>
        <p className="text-sm" style={{ color: brandColors.neutral }}>
          {round.deliverables}
        </p>
      </div>
    )}
    
    {round.judgingMethod && (
      <div>
        <p className="text-xs font-medium mb-1" style={{ color: brandColors.neutral }}>
          Judging Method
        </p>
        <p className="text-sm" style={{ color: brandColors.neutral }}>
          {round.judgingMethod}
        </p>
      </div>
    )}
  </>
);

const ViewRoundDetailsButton = ({ competitionId, roundId, isNextRound }: any) => (
  <Link 
    href={`/competitions/${competitionId}/rounds/${roundId}`}
    className="mt-4 w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-105"
    style={{
      backgroundColor: isNextRound 
        ? `${SUCCESS_COLOR}10` 
        : `${brandColors.primary}10`,
      color: isNextRound 
        ? SUCCESS_COLOR 
        : brandColors.primary,
      border: isNextRound 
        ? `1px solid ${SUCCESS_COLOR}20` 
        : `1px solid ${brandColors.primary}20`
    }}
  >
    <FiBook size={16} />
    {isNextRound ? 'Start Next Round' : 'View Round Details'}
  </Link>
);