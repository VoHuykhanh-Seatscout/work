


'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Medal } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


interface Prize {
 id: string
 name: string
 description: string | null
 competitionId: string
 winnerId: string | null
 value: string | null
 position: number
}


interface User {
 id: string
 name: string | null
 email: string | null
 profileImage: string | null
}


interface Submission {
 id: string
 userId: string
 content: any
 competitionId: string
 status: string
 createdAt: Date
 updatedAt: Date
 winningCompetitionId: string | null
 winningPrizeId: string | null
 user: User
 winningPrize: Prize | null
}


interface SubmissionWithWinnerInfo extends Submission {
 isWinner: boolean
 prize: Prize | null
}


interface SelectWinnerFormProps {
 competitionId: string
 submissions: SubmissionWithWinnerInfo[]
 preselectedSubmission?: SubmissionWithWinnerInfo | null
 prizes: Prize[]
}


export function SelectWinnerForm({
 competitionId,
 submissions,
 preselectedSubmission,
 prizes
}: SelectWinnerFormProps) {
 const router = useRouter()
 const [selectedSubmission, setSelectedSubmission] = useState<string>(
   preselectedSubmission?.id || ''
 )
 const [selectedPrize, setSelectedPrize] = useState<string>(
   preselectedSubmission?.winningPrizeId || ''
 )
 const [isSubmitting, setIsSubmitting] = useState(false)


 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   setIsSubmitting(true)


   if (!selectedSubmission || !selectedPrize) {
     toast({
       title: 'Error',
       description: 'Please select both a submission and a prize',
       variant: 'destructive',
     })
     setIsSubmitting(false)
     return
   }


   try {
     const response = await fetch(
       `/api/competitions/${competitionId}/prizes/${selectedPrize}/assign`,
       {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           submissionId: selectedSubmission,
         }),
       }
     )


     const data = await response.json()


     if (!response.ok) {
       throw new Error(data.error || 'Failed to select winner')
     }


     toast({
       title: 'Success!',
       description: 'Winner selected successfully.',
     })


     router.refresh()
     router.push(`/business-dashboard/competitions/${competitionId}`)
   } catch (error) {
     toast({
       title: 'Error',
       description: error instanceof Error ? error.message : 'Failed to select winner. Please try again.',
       variant: 'destructive',
     })
   } finally {
     setIsSubmitting(false)
   }
 }


 return (
   <form onSubmit={handleSubmit} className="space-y-6">
     <div className="space-y-4">
       <h2 className="text-lg font-medium">Select a Winner</h2>
      
       <RadioGroup
         value={selectedSubmission}
         onValueChange={setSelectedSubmission}
         className="grid gap-4"
       >
         {submissions.map((submission) => (
           <div key={submission.id} className="flex items-center space-x-4">
             <RadioGroupItem
               value={submission.id}
               id={submission.id}
               disabled={submission.isWinner && !preselectedSubmission}
             />
             <Label htmlFor={submission.id} className="flex flex-col space-y-1">
               <div className="flex items-center gap-4">
                 {submission.user.profileImage ? (
                   <img
                     src={submission.user.profileImage}
                     alt={submission.user.name || 'User'}
                     className="w-10 h-10 rounded-full"
                   />
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                     {submission.user.name?.charAt(0) || 'U'}
                   </div>
                 )}
                 <div>
                   <h3 className="font-medium">{submission.user.name || 'Unknown User'}</h3>
                   <div className="flex gap-2">
                     {submission.isWinner && submission.prize && (
                       <Badge variant="outline" className="gap-1">
                         <Medal className="w-3 h-3" />
                         {submission.prize.position === 1 ? '1st' :
                          submission.prize.position === 2 ? '2nd' :
                          submission.prize.position === 3 ? '3rd' :
                          `${submission.prize.position}th`} Prize
                       </Badge>
                     )}
                   </div>
                 </div>
               </div>
             </Label>
           </div>
         ))}
       </RadioGroup>
     </div>


     <div className="space-y-4">
       <h2 className="text-lg font-medium">Select Prize</h2>
       <Select
         value={selectedPrize}
         onValueChange={setSelectedPrize}
         required
         disabled={isSubmitting}
       >
         <SelectTrigger className="w-full">
           <SelectValue placeholder="Select a prize" />
         </SelectTrigger>
         <SelectContent>
           {prizes.map((prize) => (
             <SelectItem
               key={prize.id}
               value={prize.id}
               disabled={!!prize.winnerId && prize.id !== selectedPrize}
             >
               {prize.position === 1 ? '1st' :
                prize.position === 2 ? '2nd' :
                prize.position === 3 ? '3rd' :
                `${prize.position}th`} Prize: {prize.name}
               {prize.winnerId && prize.id !== selectedPrize && ' (Already assigned)'}
             </SelectItem>
           ))}
         </SelectContent>
       </Select>
     </div>


     <Button
       type="submit"
       disabled={!selectedSubmission || !selectedPrize || isSubmitting}
       className="w-full sm:w-auto"
     >
       {isSubmitting ? 'Processing...' : 'Select Winner'}
     </Button>
   </form>
 )
}
