import { Message } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type MessageWithSender = Message & {
  senderName: string
}

export default function QandASection({
  competitionId,
  messages,
}: {
  competitionId: string
  messages: MessageWithSender[]
}) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Q&A / Announcements</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Post Announcement</h3>
        <div className="space-y-4">
          <Textarea placeholder="Title of your announcement" />
          <Textarea placeholder="Your message" rows={4} />
          <div className="flex justify-end">
            <Button>Post Announcement</Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Questions from Participants</h3>
        
        {messages.length === 0 ? (
          <p className="text-gray-500">No questions have been asked yet.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{message.senderName}</p>
                    <p className="text-gray-600">{message.content}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" size="sm">Reply</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}