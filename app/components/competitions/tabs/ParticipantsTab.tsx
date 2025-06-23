import Image from "next/image";
import { m as motion } from "framer-motion";
import { brandColors } from "@/constants/colors";

export default function ParticipantsTab({ competition, router }: { competition: any; router: any }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold" style={{ color: brandColors.neutral }}>
          Participants
        </h3>
        <p className="text-lg" style={{ color: brandColors.neutral }}>
          {competition.participants.length} registered
        </p>
      </div>
      
      {competition.participants.length > 0 ? (
        <ParticipantsGrid participants={competition.participants} router={router} />
      ) : (
        <NoParticipantsMessage />
      )}
    </div>
  );
}

const ParticipantsGrid = ({ participants, router }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {participants.map((participant: any) => (
      <ParticipantCard 
        key={participant.user.id}
        participant={participant}
        router={router}
      />
    ))}
  </div>
);

const ParticipantCard = ({ participant, router }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-4 rounded-xl border flex flex-col items-center text-center"
    style={{
      backgroundColor: 'white',
      borderColor: `${brandColors.neutral}10`,
      boxShadow: `0 4px 6px ${brandColors.neutral}05`
    }}
  >
    <ParticipantAvatar user={participant.user} />
    <h4 className="font-bold" style={{ color: brandColors.neutral }}>
      {participant.user.name}
    </h4>
    <p className="text-sm opacity-70" style={{ color: brandColors.neutral }}>
      {participant.user.email}
    </p>
    <ViewProfileButton userId={participant.user.id} router={router} />
  </motion.div>
);

const ParticipantAvatar = ({ user }: any) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="relative h-16 w-16 rounded-full overflow-hidden border-2 mb-3"
    style={{
      borderColor: brandColors.primary,
      boxShadow: `0 4px 12px ${brandColors.primary}20`
    }}
  >
    <Image
      src={user.profileImage || "/default-avatar.png"}
      alt={user.name}
      fill
      className="object-cover"
      sizes="64px"
    />
  </motion.div>
);

const ViewProfileButton = ({ userId, router }: any) => (
  <motion.button
    onClick={() => router.push(`/profile/${userId}`)}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className="mt-3 px-3 py-1 rounded-lg text-xs font-medium transition-all"
    style={{
      backgroundColor: `${brandColors.primary}10`,
      color: brandColors.primary
    }}
  >
    View Profile
  </motion.button>
);

const NoParticipantsMessage = () => (
  <div 
    className="p-8 rounded-xl border text-center"
    style={{
      backgroundColor: `${brandColors.light}`,
      borderColor: `${brandColors.neutral}10`
    }}
  >
    <p className="text-lg" style={{ color: brandColors.neutral }}>
      No participants yet. Be the first to register!
    </p>
  </div>
);