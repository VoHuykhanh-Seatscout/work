import { m as motion } from "framer-motion";
import { brandColors } from "@/constants/colors";


export default function JudgingTab({ competition }: { competition: any }) {
  return (
    <div className="space-y-8">
      <h3 
        className="text-3xl font-bold"
        style={{ color: brandColors.neutral }}
      >
        Judging Criteria
      </h3>
      
      {competition.judgingCriteria ? (
        <div 
          className="prose max-w-none"
          style={{ color: brandColors.neutral }}
          dangerouslySetInnerHTML={{ __html: competition.judgingCriteria }} 
        />
      ) : (
        <div className="space-y-6">
          <NoCriteriaMessage />
          <DefaultCriteriaList />
        </div>
      )}
    </div>
  );
}

const NoCriteriaMessage = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="p-6 rounded-xl border"
    style={{
      backgroundColor: `${brandColors.light}`,
      borderColor: `${brandColors.neutral}10`
    }}
  >
    <p className="text-lg" style={{ color: brandColors.neutral }}>
      The organizer hasn't provided specific judging criteria yet. Here are some common factors that might be considered:
    </p>
  </motion.div>
);

const DefaultCriteriaList = () => {
  const criteria = [
    { 
      name: "Creativity", 
      description: "Originality and innovative thinking in the solution",
      color: brandColors.primary 
    },
    { 
      name: "Execution", 
      description: "Quality and completeness of the implementation",
      color: brandColors.secondary 
    },
    { 
      name: "Impact", 
      description: "Potential positive effect on the target audience",
      color: brandColors.accent 
    },
    { 
      name: "Presentation", 
      description: "Clarity and effectiveness of communication",
      color: '#10B981' 
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {criteria.map((criterion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: `${criterion.color}05`,
            borderColor: `${criterion.color}20`
          }}
          whileHover={{ y: -5 }}
        >
          <h4 
            className="text-xl font-bold mb-2"
            style={{ color: criterion.color }}
          >
            {criterion.name}
          </h4>
          <p style={{ color: brandColors.neutral }}>
            {criterion.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};