import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'
import { SelectWinnerForm } from './select-winner-form'
import { SubmissionStatus } from '@prisma/client'


interface PageProps {
 params: { id: string }
 searchParams: { [key: string]: string | string[] | undefined }
}


type SubmissionWithWinnerInfo = {
 id: string
 userId: string
 content: any
 competitionId: string
 status: SubmissionStatus
 createdAt: Date
 updatedAt: Date
 winningCompetitionId: string | null
 winningPrizeId: string | null
 user: {
   id: string
   name: string | null
   email: string | null
   profileImage: string | null
 }
 round: {
   id: string
 }
 competition: {
   id: string
   title: string
 }
 nextRound?: {
   id: string
 } | null
 winningPrize: {
   id: string
   competitionId: string
   name: string
   description: string | null
   value: string | null
   position: number
   winnerId: string | null
 } | null
 isWinner: boolean
 prize: {
   id: string
   competitionId: string
   name: string
   description: string | null
   value: string | null
   position: number
   winnerId: string | null
 } | null
}


export default async function SelectWinnerPage({ params, searchParams }: PageProps) {
 // Await params and searchParams
 const [awaitedParams, awaitedSearchParams] = await Promise.all([params, searchParams]);
  const id = awaitedParams.id;
 const submissionId = awaitedSearchParams.submissionId
   ? Array.isArray(awaitedSearchParams.submissionId)
     ? awaitedSearchParams.submissionId[0]
     : awaitedSearchParams.submissionId
   : undefined;


 if (!id) {
   return notFound()
 }


 try {
   const competition = await prisma.competition.findUnique({
 where: { id },
 include: {
   rounds: {
     orderBy: { endDate: 'asc' }, // Assuming rounds are ordered by date
     select: {
       id: true,
       endDate: true
     }
   },
   submissions: {
     where: {
       status: SubmissionStatus.approved,
       // Only include submissions from the final round
       roundId: {
         // This will be set after we determine the final round
       }
     },
     include: {
       user: {
         select: {
           id: true,
           name: true,
           email: true,
           profileImage: true
         }
       },
       winningPrize: true,
       round: {
         select: {
           id: true
         }
       },
       competition: {
         select: {
           id: true,
           title: true
         }
       },
       nextRound: {
         select: {
           id: true
         }
       }
     }
   },
   prizes: {
     orderBy: { position: 'asc' }
   }
 }
})


if (!competition) {
 return notFound()
}


// Determine the final round (last in the ordered list)
const finalRound = competition.rounds[competition.rounds.length - 1]


// Now filter submissions to only include those from the final round
const finalRoundSubmissions = competition.submissions.filter(
 sub => sub.roundId === finalRound.id
)


const submissionsWithWinnerInfo = finalRoundSubmissions.map((sub: any) => ({
 ...sub,
 isWinner: sub.winningCompetitionId !== null || sub.winningPrizeId !== null,
 prize: sub.winningPrize,
})) as SubmissionWithWinnerInfo[]


   if (!competition) {
     return notFound()
   }


   const preselectedSubmission = submissionId
     ? submissionsWithWinnerInfo.find(s => s.id === submissionId) ?? null
     : null


   let prizes = competition.prizes
  
 if (prizes.length === 0 && competition.prize) {
   // Create the default prize in database
   const defaultPrize = await prisma.prize.create({
     data: {
       competitionId: competition.id,
       name: competition.prize,
       position: 1,
     }
   })
   prizes = [defaultPrize]
 }


 // Check if all prizes have been assigned
 const allPrizesAssigned = prizes.every(prize => prize.winnerId !== null);
  // If all prizes are assigned, show congratulations and redirect
 if (allPrizesAssigned) {
   return (
     <div className="container mx-auto py-8 px-4">
       <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
         <div className="bg-green-100 p-6 rounded-full">
           <Trophy className="h-16 w-16 text-green-600" />
         </div>
         <h1 className="text-3xl font-bold">Congratulations!</h1>
         <p className="text-xl text-gray-600 max-w-2xl">
           You've successfully assigned all prizes for this competition.
         </p>
         <div className="flex gap-4 mt-6">
           <Link href="/business-dashboard">
             <Button className="bg-indigo-600 hover:bg-indigo-700">
               Back to Dashboard
             </Button>
           </Link>
           <Link href={`/business-dashboard/competitions/${id}`}>
             <Button variant="outline">
               View Competition
             </Button>
           </Link>
         </div>
       </div>
     </div>
   );
 }


   return (
     <div className="container mx-auto py-8 px-4">
       <div className="flex flex-col gap-6">
         <div className="flex items-center gap-4">
           <Link href={`/business-dashboard/competitions/${id}`}>
             <Button variant="outline" size="icon">
               <ArrowLeft className="h-4 w-4" />
             </Button>
           </Link>
           <h1 className="text-2xl font-bold">Select Winner: {competition.title}</h1>
         </div>


         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Trophy className="h-5 w-5" />
               Competition Prizes
             </CardTitle>
           </CardHeader>
           <CardContent>
             {prizes.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {prizes.map((prize: any) => (
                   <div key={prize.id} className="bg-muted px-3 py-1 rounded-full text-sm">
                     {prize.position === 1 ? '1st' :
                      prize.position === 2 ? '2nd' :
                      prize.position === 3 ? '3rd' :
                      `${prize.position}th`} Prize: {prize.name} {prize.value && `(${prize.value})`}
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-muted-foreground">No prizes have been defined for this competition yet.</p>
             )}
           </CardContent>
         </Card>


         <SelectWinnerForm
           competitionId={id}
           submissions={submissionsWithWinnerInfo}
           preselectedSubmission={preselectedSubmission}
           prizes={prizes}
         />
       </div>
     </div>
   )
 } catch (error) {
   console.error('Error in SelectWinnerPage:', error)
   return notFound()
 }
}
