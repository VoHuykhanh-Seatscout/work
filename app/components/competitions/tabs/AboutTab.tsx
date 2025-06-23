import { m as motion } from "framer-motion";
import { 
  FiAward, 
  FiLayers, 
  FiPieChart, 
  FiEdit3,
  FiVideo
} from "react-icons/fi";
import { 
  FaPaintBrush, 
  FaLaptopCode, 
  FaLightbulb,
  FaCamera
} from "react-icons/fa";
import { GiAbstract024 } from "react-icons/gi";
import Image from "next/image";

export default function AboutTab({ competition }: { competition: any }) {
  const brandColors = {
  primary: "#5B2EFF",     // Bold electric purple (for buttons, highlights)
  secondary: "#3B1AB3",   // Deep violet (used in backgrounds or nav)
  accent: "#F4C300",    // Vivid yellow (for CTAs like "Start Competing")
  dark: "#0B0F19",        // Very dark navy (text and depth contrast)
  light: "#F4F6FF",       // Soft lavender white (backgrounds, cards)
  creative: "#FF7AD5",    // Vibrant pink (creative accents or tags)
  success: "#32D74B",     // Bright green (confirmation/status colors)
};

  {/* Utility for responsive icon size */}
// Utility for responsive icon size - Updated with much larger sizes
const getIconSizeClasses = (size: "base" | "large") => {
  switch (size) {
    case "large":
      return "w-[132px] h-[132px]"; // Increased from 98px
    case "base":
    default:
      return "w-16 h-16"; // Increased from w-14 h-14 (~5rem = 80px)
  }
};

  // Helper function to get the highest prize
  const getHighestPrize = () => {
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
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-12 px-4 py-8"
    >
      {/* Hero Overview */}
      <div className="space-y-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-6"
        >
          <div 
            className="w-12 h-1 rounded-full" 
            style={{ 
              background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.accent})`,
              boxShadow: `0 2px 8px ${brandColors.primary}30`
            }} 
          />
          <h3 
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ 
              color: brandColors.dark,
              textShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            Challenge Overview
          </h3>
        </motion.div>
        
        <div className="prose max-w-none space-y-6">
          {competition.description.split('\n').map((paragraph: string, i: number) => (
            <motion.p
              key={i}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-lg leading-relaxed"
              style={{ 
                color: `${brandColors.dark}CC`,
                lineHeight: '1.8'
              }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Creative Stats */}
      <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.5 }}
  className="grid grid-cols-1 md:grid-cols-3 gap-4"
>
  {/* Prize Card (normal size) */}
<StatCard 
  icon={
    <div className={`relative ${getIconSizeClasses("base")}`}>
      <Image 
        src="/q.png" 
        alt="Prize" 
        fill
        className="object-contain"
      />
    </div>
  }
  title="Prize"
  value={getHighestPrize()}
  color={brandColors.primary}
  brandColors={brandColors}
  iconSize="base"
/>

{/* Submissions Card (larger) */}
<StatCard 
  icon={
    <div className={`relative ${getIconSizeClasses("large")}`}>
      <Image 
        src="/r.png" 
        alt="Submissions" 
        fill
        className="object-contain"
      />
    </div>
  }
  title="Submissions"
  value={`${competition.submissionsCount || "Open"} Format`}
  color={brandColors.secondary}
  brandColors={brandColors}
  iconSize="large"
/>

{/* Participation Card (larger) */}
<StatCard 
  icon={
    <div className={`relative ${getIconSizeClasses("large")}`}>
      <Image 
        src="/s.png" 
        alt="Participation" 
        fill
        className="object-contain"
      />
    </div>
  }
  title="Participation"
  value={`${competition.participants.length}`}
  color={brandColors.accent}
  brandColors={brandColors}
  iconSize="large"
/>

</motion.div>

      {/* Categories Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="border-t pt-12 mt-8"
        style={{ borderColor: `${brandColors.dark}10` }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div className="space-y-4 max-w-md">
            <h3 
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ 
                color: brandColors.dark,
                textShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              Cartegories
            </h3>
            <p 
              className="text-lg"
              style={{ 
                color: `${brandColors.dark}AA`,
                lineHeight: '1.6'
              }}
            >
              Choose your creative path and showcase your unique skills
            </p>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <GiAbstract024 
                className="text-6xl opacity-10" 
                style={{ 
                  color: brandColors.primary,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }} 
              />
              <FaPaintBrush 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl" 
                style={{ 
                  color: brandColors.primary,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competition.categories.map((category: string, i: number) => (
            <CategoryCard 
              key={category} 
              category={category} 
              index={i}
              brandColors={brandColors}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}


const StatCard = ({ icon, title, value, color, brandColors, iconSize = 'base' }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string;
  color: string;
  brandColors: any;
  iconSize?: 'base' | 'large';
}) => (
  <motion.div
    whileHover={{ 
      y: -4,
      boxShadow: `0 8px 24px ${color}20`
    }}
    className={`p-4 rounded-xl transition-all flex flex-row items-center gap-4 ${
      iconSize === 'large' ? 'min-h-[120px]' : 'min-h-[110px]' // Increased heights
    }`}
    style={{
      backgroundColor: '#FFFFFF',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${color}15`
    }}
  >
    {/* Icon Container */}
    <div 
      className={`
        rounded-lg flex items-center justify-center transition-all flex-shrink-0
        ${iconSize === 'base' ? 'w-18 h-18' : 'w-[90px] h-[90px]'} // Slightly larger images
      `}
    >
      {icon}
    </div>
    
    {/* Text content */}
    <div className="flex flex-col">
      <h4 
        className="text-sm font-semibold uppercase tracking-wider mb-1.5" // Slightly larger text
        style={{ 
          color: brandColors.primary,
          letterSpacing: '0.05em'
        }}
      >
        {title}
      </h4>
      <p 
        className="text-xl font-bold"  
        style={{ 
          color: brandColors.dark,
        }}
      >
        {value}
      </p>
    </div>
  </motion.div>
);

const CategoryCard = ({ category, index, brandColors }: { 
  category: string, 
  index: number,
  brandColors: any
}) => {
  const colorMap: Record<string, string> = {
    tech: brandColors.secondary,
    design: brandColors.accent,
    art: brandColors.creative,
    photo: '#EC4899',
    video: '#3B82F6',
    writing: brandColors.success
  };

  const iconMap: Record<string, React.ReactNode> = {
    tech: <FaLaptopCode className="text-lg" />,
    design: <FaPaintBrush className="text-lg" />,
    art: <GiAbstract024 className="text-lg" />,
    photo: <FaCamera className="text-lg" />,
    video: <FiVideo className="text-lg" />,
    writing: <FiEdit3 className="text-lg" />
  };

  const matchedKey = Object.keys(colorMap).find(key => 
    category.toLowerCase().includes(key)
  ) || 'default';

  const bgColor = `${colorMap[matchedKey] || brandColors.primary}05`;
  const textColor = colorMap[matchedKey] || brandColors.primary;
  const icon = iconMap[matchedKey] || <FaLightbulb className="text-lg" />;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 + index * 0.1 }}
      whileHover={{ 
        y: -5,
        boxShadow: `0 8px 24px ${textColor}20`
      }}
      className="p-6 rounded-xl border flex items-start gap-4 transition-all"
      style={{
        backgroundColor: bgColor,
        borderColor: `${textColor}20`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all"
        style={{
          backgroundColor: `${textColor}10`,
          color: textColor,
          boxShadow: `inset 0 0 0 1px ${textColor}20`
        }}
      >
        {icon}
      </div>
      <div>
        <h4 
          className="font-bold text-lg mb-1 tracking-tight"
          style={{ 
            color: brandColors.dark,
            textShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          {category}
        </h4>
        <p 
          className="text-sm leading-relaxed"
          style={{ 
            color: `${brandColors.dark}AA`,
            lineHeight: '1.6'
          }}
        >
          {getCategoryDescription(category)}
        </p>
      </div>
    </motion.div>
  );
};

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    tech: "Innovative technical solutions and coding projects",
    design: "Visual creativity and aesthetic craftsmanship",
    art: "Expressive traditional or digital artwork",
    photo: "Captured moments and photographic storytelling",
    video: "Motion graphics and cinematic creations",
    writing: "Compelling narratives and written expression"
  };

  const matchedKey = Object.keys(descriptions).find(key => 
    category.toLowerCase().includes(key)
  );

  return descriptions[matchedKey || 'default'] || "Showcase your creative skills in this category";
}