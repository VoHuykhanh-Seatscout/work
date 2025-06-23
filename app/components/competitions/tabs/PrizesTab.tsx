"use client";

import { m as motion } from "framer-motion";
import { FiAward } from "react-icons/fi";
import { brandColors } from "@/constants/colors";

export default function PrizesTab({ competition }: { competition: any }) {
  // Define color options for different prize tiers
  const prizeColors = [
    brandColors.primary,    // 1st place
    brandColors.neutral,    // 2nd place
    brandColors.secondary,  // 3rd place
    '#8B5CF6',             // 4th place (purple)
    '#EC4899',             // 5th place (pink)
    '#3B82F6',             // 6th place (blue)
  ];

  // Helper function to parse prize string (fallback)
  const parsePrizes = (prizeString: string) => {
    if (!prizeString) return [];
    
    // Try to split by common delimiters
    const delimiters = [';', '|', '\n', '-'];
    
    for (const delimiter of delimiters) {
      if (prizeString.includes(delimiter)) {
        return prizeString.split(delimiter)
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }
    }
    
    // If no delimiters found, return as single prize
    return [prizeString];
  };

  // Create prize tiers - prioritize structured prizes from API
  const prizeTiers = competition.prizes?.length > 0
    ? competition.prizes
        .sort((a: any, b: any) => a.position - b.position)
        .map((prize: any) => ({
          id: prize.id,
          place: getPlacementLabel(prize.position),
          prize: formatPrizeValue(prize),
          color: prizeColors[prize.position - 1] || brandColors.accent,
          icon: <FiAward size={24} style={{ 
            color: prizeColors[prize.position - 1] || brandColors.accent 
          }} />,
          winner: prize.winner ? {
            name: prize.winner.user?.name || "Winner",
            avatar: prize.winner.user?.profileImage
          } : null
        }))
    : parsePrizes(competition.prize).map((prize: string, index: number) => ({
        place: getPlacementLabel(index + 1),
        prize: prize,
        color: prizeColors[index] || brandColors.accent,
        icon: <FiAward size={24} style={{ color: prizeColors[index] || brandColors.accent }} />,
        winner: null
      }));

  return (
    <div className="space-y-8">
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-bold mb-6"
        style={{ color: brandColors.neutral }}
      >
        Prize Details
      </motion.h3>
      
      {prizeTiers.length > 0 ? (
        <div className={`grid gap-6 ${prizeTiers.length > 1 ? 'md:grid-cols-2' : ''} ${prizeTiers.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {prizeTiers.map((tier: any, index: number) => (
            <PrizeTierCard 
              key={tier.id || index} 
              tier={tier} 
              index={index}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-gray-50"
        >
          <p style={{ color: brandColors.neutral }}>
            Prize information will be announced soon.
          </p>
        </motion.div>
      )}
      
      {(competition.rules?.includes('additional prizes') || competition.prizes?.length > 6) && (
        <AdditionalPrizesNote />
      )}
    </div>
  );
}

function PrizeTierCard({ tier, index }: { tier: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: `0 8px 24px ${tier.color}20` }}
      className="p-6 rounded-xl border transition-all duration-300 h-full flex flex-col"
      style={{
        backgroundColor: `${tier.color}05`,
        borderColor: `${tier.color}20`,
        boxShadow: `0 4px 12px ${tier.color}10`
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="p-3 rounded-full flex-shrink-0"
          style={{
            backgroundColor: `${tier.color}15`,
            border: `1px solid ${tier.color}30`
          }}
        >
          {tier.icon}
        </motion.div>
        <div>
          <h4 className="text-xl font-bold" style={{ color: tier.color }}>
            {tier.place}
          </h4>
          {tier.winner && (
            <p className="text-sm mt-1" style={{ color: brandColors.neutral }}>
              Winner: {tier.winner.name}
            </p>
          )}
        </div>
      </div>
      <div className="prose max-w-none flex-grow" style={{ color: brandColors.neutral }}>
        <p>{tier.prize}</p>
      </div>
    </motion.div>
  );
}

function AdditionalPrizesNote() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-6 p-4 rounded-lg"
      style={{
        backgroundColor: `${brandColors.accent}10`,
        borderLeft: `4px solid ${brandColors.accent}`
      }}
    >
      <p className="font-medium" style={{ color: brandColors.neutral }}>
        Additional prizes may be awarded based on competition rules and judging criteria.
      </p>
    </motion.div>
  );
}

// Helper function to format prize value from structured prize object
function formatPrizeValue(prize: any): string {
  if (prize.value && prize.name) {
    return `${prize.name}: ${prize.value}`;
  }
  return prize.value || prize.name || prize.description || "Prize details coming soon";
}

// Helper function to get proper placement labels
function getPlacementLabel(position: number): string {
  if (position === 1) return "Grand Prize";
  if (position === 2) return "Runner Up";
  
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = position % 100;
  const suffix = suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
  return `${position}${suffix} Place`;
}