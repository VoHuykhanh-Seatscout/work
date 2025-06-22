


// app/business-dashboard/competitions/[id]/select-winner/select-prize-dialog.tsx
'use client'


import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger
} from '@/components/ui/dialog'
import { Medal } from 'lucide-react'
import { Prize } from '@prisma/client'


interface SelectPrizeDialogProps {
 prizes: Prize[]
 onSelect: (prizeId: string) => void
 isLoading: boolean
}


export function SelectPrizeDialog({ prizes, onSelect, isLoading }: SelectPrizeDialogProps) {
 const [open, setOpen] = useState(false)
 const [selectedPrize, setSelectedPrize] = useState<string | null>(null)


 const handleSelect = () => {
   if (!selectedPrize) return
   onSelect(selectedPrize)
   setOpen(false)
   setSelectedPrize(null)
 }


 return (
   <Dialog open={open} onOpenChange={setOpen}>
     <DialogTrigger asChild>
       <Button className="gap-1">
         <Medal className="w-4 h-4" />
         Assign Prize
       </Button>
     </DialogTrigger>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Select Prize to Award</DialogTitle>
       </DialogHeader>
       <div className="space-y-4">
         {prizes.length > 0 ? (
           <>
             <div className="grid gap-2">
               {prizes.map(prize => (
                 <div
                   key={prize.id}
                   className={`border rounded-lg p-4 cursor-pointer ${
                     selectedPrize === prize.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                   }`}
                   onClick={() => setSelectedPrize(prize.id)}
                 >
                   <h3 className="font-medium">
                     {prize.position === 1 ? '1st Place' :
                      prize.position === 2 ? '2nd Place' :
                      prize.position === 3 ? '3rd Place' :
                      `${prize.position}th Place`}: {prize.name}
                   </h3>
                   {prize.description && (
                     <p className="text-sm text-muted-foreground mt-1">
                       {prize.description}
                     </p>
                   )}
                 </div>
               ))}
             </div>
             <Button
               onClick={handleSelect}
               disabled={!selectedPrize || isLoading}
               className="w-full"
             >
               {isLoading ? 'Assigning...' : 'Assign Selected Prize'}
             </Button>
           </>
         ) : (
           <p className="text-muted-foreground text-center py-4">
             All prizes have been awarded
           </p>
         )}
       </div>
     </DialogContent>
   </Dialog>
 )
}
