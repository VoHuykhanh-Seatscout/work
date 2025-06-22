import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CompetitionHeaderProps {
  id: string
  title: string
  endDate: Date
  participationType?: string
}

interface HeaderProps {
  competition: {
    id: string
    title: string
    endDate: Date
    participationType: 'INDIVIDUAL' | 'TEAM'
  }
  stats: {
    totalSignups: number
    roundsPublished: number
    submissionsReceived: number
  }
}

export default function Header({ competition, stats }: HeaderProps) {
  const isOpen = new Date(competition.endDate) > new Date()
  
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">{competition.title}</h1>
        <div className="flex gap-2 mt-2">
          <Badge variant={isOpen ? 'default' : 'destructive'}>
            {isOpen ? 'Open' : 'Closed'}
          </Badge>
          <Badge variant="secondary">
            {competition.participationType || 'Individual'}
          </Badge>
        </div>
      </div>
      <Button variant="outline">Edit Competition</Button>
    </div>
  )
}