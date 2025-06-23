import { m as motion } from "framer-motion";
import { FiMail, FiGlobe, FiMessageSquare, FiPhone, FiUser } from "react-icons/fi";
import { FaRegHandshake } from "react-icons/fa";

const brandColors = {
  primary: "#D84315",
  secondary: "#FF5722",
  accent: "#FF7043",
  dark: "#212121",
  light: "#FFF3E0",
  creative: "#8A2BE2",
  success: "#30D158",
};

export default function ContactTab({ competition, router }: { competition: any; router: any }) {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <h3 
          className="text-4xl font-bold tracking-tight"
          style={{ 
            backgroundImage: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.accent})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Contact Information
        </h3>
        <p 
          className="text-lg font-medium tracking-tight"
          style={{ color: `${brandColors.dark}90` }}
        >
          Get in touch with the competition organizers
        </p>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <ContactCard 
          icon={<FiMail className="w-5 h-5" />}
          title="Email"
          value={competition.contactEmail}
          color={brandColors.primary}
          type="email"
          delay={0.1}
        />
        
        {competition.website && (
          <ContactCard 
            icon={<FiGlobe className="w-5 h-5" />}
            title="Website"
            value={competition.website}
            color={brandColors.accent}
            type="website"
            delay={0.2}
          />
        )}

        {competition.phone && (
          <ContactCard 
            icon={<FiPhone className="w-5 h-5" />}
            title="Phone"
            value={competition.phone}
            color={brandColors.secondary}
            type="phone"
            delay={0.3}
          />
        )}

        {competition.organizer && (
          <ContactCard 
            icon={<FiUser className="w-5 h-5" />}
            title="Organizer"
            value={competition.organizer.name}
            color={brandColors.creative}
            type="organizer"
            delay={0.4}
          />
        )}
      </div>
      
      <ContactOrganizerSection organizer={competition.organizer} router={router} />
    </div>
  );
}

const ContactCard = ({ icon, title, value, color, type, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ 
      y: -5,
      boxShadow: `0 10px 25px -5px ${color}30`
    }}
    className="p-6 rounded-xl border flex items-start gap-4 transition-all group"
    style={{
      backgroundColor: `${brandColors.light}`,
      borderColor: `${color}20`,
      boxShadow: `0 4px 12px ${color}10`
    }}
  >
    <div 
      className="p-3 rounded-lg flex-shrink-0 transition-all group-hover:scale-110"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        boxShadow: `inset 0 0 0 1px ${color}20`
      }}
    >
      {icon}
    </div>
    <div className="overflow-hidden">
      <h4 
        className="font-bold text-lg mb-1 truncate" 
        style={{ color: brandColors.dark }}
      >
        {title}
      </h4>
      <div className="truncate">
        {type === 'email' ? (
          <a 
            href={`mailto:${value}`}
            className="hover:underline transition-all font-medium"
            style={{ color: color }}
          >
            {value}
          </a>
        ) : type === 'website' ? (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-all font-medium"
            style={{ color: color }}
          >
            {value.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
          </a>
        ) : type === 'phone' ? (
          <a 
            href={`tel:${value.replace(/\D/g, '')}`}
            className="hover:underline transition-all font-medium"
            style={{ color: color }}
          >
            {value}
          </a>
        ) : (
          <span className="font-medium" style={{ color: brandColors.dark }}>
            {value}
          </span>
        )}
      </div>
    </div>
  </motion.div>
);

const ContactOrganizerSection = ({ organizer, router }: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="pt-10 mt-8 border-t space-y-6"
    style={{ borderColor: `${brandColors.dark}10` }}
  >
    <div className="space-y-3">
      <h4 
        className="font-bold text-2xl tracking-tight"
        style={{ 
          backgroundImage: `linear-gradient(45deg, ${brandColors.primary}, ${brandColors.accent})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent'
        }}
      >
        Direct Message
      </h4>
      <p 
        className="text-lg font-medium"
        style={{ color: `${brandColors.dark}80` }}
      >
        Have specific questions? Send a direct message to the organizer.
      </p>
    </div>
    
    <div className="flex flex-wrap gap-6">
      <ContactOrganizerButton 
        organizerId={organizer.id} 
        name={organizer.name} 
        router={router} 
      />
      
      <motion.button
        whileHover={{ 
          scale: 1.03,
          backgroundColor: `${brandColors.light}`
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push(`/organizers/${organizer.id}`)}
        className="px-6 py-3 font-medium rounded-xl transition-all flex items-center gap-3 border"
        style={{
          borderColor: `${brandColors.dark}15`,
          color: brandColors.dark,
          backgroundColor: 'white'
        }}
      >
        <FiUser className="w-5 h-5" /> 
        <span>View Organizer Profile</span>
      </motion.button>

      {organizer.partnershipContact && (
        <motion.button
          whileHover={{ 
            scale: 1.03,
            backgroundColor: `${brandColors.light}`
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/message-organizer/${organizer.id}?type=partnership`)}
          className="px-6 py-3 font-medium rounded-xl transition-all flex items-center gap-3 border"
          style={{
            borderColor: `${brandColors.creative}20`,
            color: brandColors.creative,
            backgroundColor: 'white'
          }}
        >
          <FaRegHandshake className="w-5 h-5" /> 
          <span>Partnership Inquiry</span>
        </motion.button>
      )}
    </div>
  </motion.div>
);

const ContactOrganizerButton = ({ organizerId, name, router }: any) => (
  <motion.button
    onClick={() => router.push(`/message-organizer/${organizerId}`)}
    whileHover={{ 
      scale: 1.05,
      boxShadow: `0 8px 24px ${brandColors.primary}40`
    }}
    whileTap={{ scale: 0.97 }}
    className="px-7 py-3.5 font-medium rounded-xl transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
    style={{
      backgroundColor: brandColors.primary,
      color: 'white'
    }}
  >
    <FiMessageSquare className="w-5 h-5" /> 
    <span>Message {name.split(' ')[0]}</span>
    <motion.span
      animate={{ 
        x: [0, 4, 0],
        opacity: [1, 0.8, 1]
      }}
      transition={{ 
        duration: 1.8,
        repeat: Infinity
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </motion.span>
  </motion.button>
);