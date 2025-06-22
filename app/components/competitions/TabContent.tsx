"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { CompetitionDetails } from "@/types/competition";
import AboutTab from "./tabs/AboutTab";
import PrizesTab from "./tabs/PrizesTab";
import RulesTab from "./tabs/RulesTab";
import JudgingTab from "./tabs/JudgingTab";
import TimelineTab from "./tabs/TimelineTab";
import ParticipantsTab from "./tabs/ParticipantsTab";
import ContactTab from "./tabs/ContactTab";

const brandColors = {
  primary: "#5B2EFF",     // Bold electric purple (for buttons, highlights)
  secondary: "#3B1AB3",   // Deep violet (used in backgrounds or nav)
  accent: "#F4C300",    // Vivid yellow (for CTAs like "Start Competing")
  dark: "#0B0F19",        // Very dark navy (text and depth contrast)
  light: "#F4F6FF",       // Soft lavender white (backgrounds, cards)
  creative: "#FF7AD5",    // Vibrant pink (creative accents or tags)
  success: "#32D74B",     // Bright green (confirmation/status colors)
};

interface TabContentProps {
  activeTab: string;
  competition: CompetitionDetails;
  router: ReturnType<typeof useRouter>;
  colors?: typeof brandColors;
}

export default function TabContent({ 
  activeTab, 
  competition, 
  router 
}: TabContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl p-8 shadow-xl relative overflow-hidden"
        style={{
          backgroundColor: 'white',
          border: `1px solid rgba(29, 29, 31, 0.1)`,
          boxShadow: `0 12px 32px ${brandColors.primary}10`,
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-5"
            style={{ backgroundColor: brandColors.primary }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.div 
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-5"
            style={{ backgroundColor: brandColors.accent }}
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 5
            }}
          />
        </div>
        
        {/* Tab indicator */}
        <motion.div 
          className="absolute top-0 left-0 h-1 rounded-r-full"
          style={{ 
            backgroundColor: brandColors.primary,
            width: '40px'
          }}
          initial={{ width: 0 }}
          animate={{ width: '40px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />
        
        {/* Tab content with improved spacing */}
        <div className="relative z-10">
          {activeTab === "about" && <AboutTab competition={competition} />}
          {activeTab === "prizes" && <PrizesTab competition={competition} />}
          {activeTab === "rules" && <RulesTab competition={competition} />}
          {activeTab === "judging" && <JudgingTab competition={competition} />}
          {activeTab === "timeline" && <TimelineTab competition={competition} />}
          {activeTab === "participants" && <ParticipantsTab competition={competition} router={router} />}
          {activeTab === "contact" && <ContactTab competition={competition} router={router} />}
        </div>
        
        {/* Subtle tab indicator at bottom */}
        <motion.div 
          className="absolute bottom-0 left-1/2 h-1 rounded-full"
          style={{ 
            backgroundColor: brandColors.primary,
            width: '20%',
            x: '-50%'
          }}
          initial={{ width: 0 }}
          animate={{ width: '20%' }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}