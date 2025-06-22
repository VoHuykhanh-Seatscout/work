import { motion } from "framer-motion";
import { brandColors } from "@/constants/colors";
import { FiAward, FiUsers, FiBookOpen, FiAlertCircle } from "react-icons/fi";

export default function RulesTab({ competition }: { competition: any }) {
  const sections = [
    {
      title: "Competition Rules",
      content: competition.rules,
      icon: <FiBookOpen className="w-5 h-5" />,
      color: brandColors.primary
    },
    {
      title: "Eligibility",
      content: competition.eligibility || "Open to all participants",
      icon: <FiUsers className="w-5 h-5" />,
      color: brandColors.secondary
    },
    ...(competition.judgingCriteria ? [{
      title: "Judging Criteria",
      content: competition.judgingCriteria,
      icon: <FiAward className="w-5 h-5" />,
      color: brandColors.accent
    }] : [])
  ];

  return (
    <div className="space-y-10">
      {sections.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.15 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${section.color}10`,
                color: section.color
              }}
            >
              {section.icon}
            </div>
            <h3 
              className="text-3xl font-bold"
              style={{ color: brandColors.neutral }}
            >
              {section.title}
            </h3>
          </div>
          
          <div 
            className={`prose max-w-none p-6 rounded-xl ${
              !section.content ? "flex items-center gap-3 text-yellow-600 bg-yellow-50" : ""
            }`}
            style={{
              backgroundColor: section.content ? `${brandColors.neutral}03` : undefined,
              borderLeft: section.content ? `4px solid ${section.color}` : undefined,
              color: brandColors.neutral
            }}
          >
            {section.content ? (
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            ) : (
              <>
                <FiAlertCircle className="w-5 h-5" />
                <span>No {section.title.toLowerCase()} provided yet</span>
              </>
            )}
          </div>
        </motion.div>
      ))}

      {/* Important Note Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: sections.length * 0.15 + 0.2 }}
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: `${brandColors.primary}05`,
          borderColor: `${brandColors.primary}20`
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="p-2 rounded-lg flex-shrink-0"
            style={{
              backgroundColor: `${brandColors.primary}10`,
              color: brandColors.primary
            }}
          >
            <FiAlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2" style={{ color: brandColors.neutral }}>
              Important Note
            </h4>
            <p className="text-sm" style={{ color: `${brandColors.neutral}80` }}>
              Please read all rules carefully. Violation of any rules may result in disqualification. 
              Contact {competition.contactEmail} if you have any questions.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}