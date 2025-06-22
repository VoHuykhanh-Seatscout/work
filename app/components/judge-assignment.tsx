'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

type Judge = {
  id: string
  name: string
}

export function JudgeAssignment({
  competitionId,
  assignedJudges,
  onJudgesChange,
}: {
  competitionId: string
  assignedJudges: string[]
  onJudgesChange: (judges: string[]) => void
}) {
  // Mock data - replace with actual API call
  const availableJudges: Judge[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Alex Johnson' },
  ]

  const addJudge = (judgeId: string) => {
    if (!assignedJudges.includes(judgeId)) {
      onJudgesChange([...assignedJudges, judgeId])
    }
  }

  const removeJudge = (judgeId: string) => {
    onJudgesChange(assignedJudges.filter(id => id !== judgeId))
  }

  return (
    <div className="space-y-2">
      <Select onValueChange={addJudge}>
        <SelectTrigger>
          <SelectValue placeholder="Select a judge" />
        </SelectTrigger>
        <SelectContent>
          {availableJudges
            .filter(judge => !assignedJudges.includes(judge.id))
            .map(judge => (
              <SelectItem key={judge.id} value={judge.id}>
                {judge.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2 mt-2">
        {assignedJudges.map(judgeId => {
          const judge = availableJudges.find(j => j.id === judgeId)
          return (
            <Badge key={judgeId} className="flex items-center gap-1">
              {judge?.name || judgeId}
              <button onClick={() => removeJudge(judgeId)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}