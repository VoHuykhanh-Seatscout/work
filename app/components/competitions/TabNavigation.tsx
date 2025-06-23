import { m as motion } from "framer-motion";
import { FiCalendar, FiMail, FiGlobe, FiMessageSquare, FiUser, FiAward, FiBook, FiClock, FiUsers } from "react-icons/fi";
interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
    creative: string;
    success: string;
  };
}

const brandColors = {
  primary: "#5B2EFF",     // Bold electric purple (for buttons, highlights)
  secondary: "#3B1AB3",   // Deep violet (used in backgrounds or nav)
  accent: "#F4C300",    // Vivid yellow (for CTAs like "Start Competing")
  dark: "#0B0F19",        // Very dark navy (text and depth contrast)
  light: "#F4F6FF",       // Soft lavender white (backgrounds, cards)
  creative: "#FF7AD5",    // Vibrant pink (creative accents or tags)
  success: "#32D74B",     // Bright green (confirmation/status colors)
};

const tabs = [
  { id: "about", label: "About", icon: FiBook },
  { id: "prizes", label: "Prizes", icon: FiAward },
  { id: "rules", label: "Rules", icon: FiBook },
  { id: "judging", label: "Judging", icon: FiAward },
  { id: "timeline", label: "Timeline", icon: FiClock },
  { id: "participants", label: "Participants", icon: FiUsers },
  { id: "contact", label: "Contact", icon: FiMail },
];

export default function TabNavigation({ 
  activeTab, 
  setActiveTab,
  colors = brandColors // Default to brandColors if not provided
}: TabNavigationProps) {
  return (
    <div 
      className="sticky top-20 z-10 mb-8 pt-6 pb-2"
      style={{
        background: `linear-gradient(to bottom, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 100%)`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${brandColors.primary}20`
      }}
    >
      <nav className="flex overflow-x-auto pb-2 scrollbar-hide px-4">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabButton 
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
}

const TabButton = ({ tab, isActive, onClick }: { 
  tab: { id: string; label: string; icon: any };
  isActive: boolean;
  onClick: () => void;
}) => {
  const Icon = tab.icon;
  
  return (
    <motion.button
      onClick={onClick}
      className={`relative px-5 py-3 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
        isActive
          ? "text-white"
          : "hover:bg-gray-100/70"
      }`}
      style={{
        backgroundColor: isActive ? brandColors.primary : 'transparent',
        color: isActive ? 'white' : brandColors.dark,
        fontVariationSettings: '"wght" 500',
        border: isActive ? 'none' : `1px solid ${brandColors.primary}10`,
        boxShadow: isActive ? `0 4px 20px ${brandColors.primary}30` : 'none'
      }}
      whileHover={{ 
        scale: isActive ? 1 : 1.05,
        backgroundColor: isActive ? brandColors.primary : `${brandColors.primary}08`
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon 
        size={16} 
        style={{ 
          color: isActive ? 'white' : brandColors.dark,
          strokeWidth: isActive ? 2.5 : 2
        }} 
      />
      <span>{tab.label}</span>
      
      {isActive && (
        <motion.div 
          layoutId="tabIndicator"
          className="absolute bottom-0 left-0 right-0 h-1 mx-auto"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.8)',
            width: '60%',
            originX: 0 // Important for proper sliding animation
          }}
          transition={{ 
            type: "spring", 
            bounce: 0.2, 
            duration: 0.3 
          }}
        />
      )}
      
      {/* Hover state background */}
      {!isActive && (
        <motion.span
          className="absolute inset-0 rounded-xl"
          style={{
            backgroundColor: `${brandColors.primary}05`,
            zIndex: -1
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  );
};