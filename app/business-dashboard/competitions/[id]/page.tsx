import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CompetitionDetails } from "@/types/competition";
import CompetitionDetailPage from "./CompetitionDetailPage";

async function getCompetition(id: string): Promise<CompetitionDetails> {
  const res = await fetch(`http://localhost:3000/api/competitions/${id}?includeRounds=true&includeWinners=true`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) throw new Error('Failed to fetch competition');
  return res.json();
}

// Option 1: Simple inline typing
export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const competition = await getCompetition(params.id);
  
  return (
    <CompetitionDetailPage 
      competition={competition}
      isOrganizer={session?.user?.id === competition.organizer.id}
    />
  );
}