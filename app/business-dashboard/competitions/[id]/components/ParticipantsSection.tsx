// components/ParticipantsSection.tsx
import User from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: string
  name: string
  email: string
  // other user fields
}

interface ParticipantsSectionProps {
  participants: User[]
}

export default function ParticipantsSection({ participants }: ParticipantsSectionProps) {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Participants ({participants.length})</h2>
        <Button variant="outline">Export List</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Registered At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell>{participant.name}</TableCell>
              <TableCell>{participant.email}</TableCell>
              <TableCell>{/* Registration date */}</TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Registered
                </span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">Message</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}