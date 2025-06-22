'use client'

import { toast } from 'sonner'
import { updateSubmissionStatus, updateSubmissionRound } from '@/actions/submissions'
import { Button } from '@/components/ui/button'

export function SubmissionEvaluation({
  submissionId,
  isFinalRound,
  advanced,
  roundEnded,
  status
}: {
  submissionId: string
  isFinalRound: boolean
  advanced: boolean
  roundEnded: boolean
  status: string
}) {
  const handleStatusUpdate = async (formData: FormData, newStatus: 'approved' | 'rejected') => {
    try {
      const result = await updateSubmissionStatus({
        submissionId,
        status: newStatus,
        feedback: formData.get('feedback') as string
      })
      
      if (result.success) {
        toast.success(`Submission ${newStatus} successfully`)
      } else {
        toast.error(result.error || `Failed to ${newStatus} submission`)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const handleAdvance = async (formData: FormData) => {
    try {
      const result = await updateSubmissionRound({
        submissionId,
        advance: true
      })
      
      if (result.success) {
        toast.success('Submission advanced to next round successfully')
      } else {
        if (result.error?.includes('final round')) {
          toast.info('This is the final round - no further advancement possible')
        } else {
          toast.error(result.error || 'Failed to advance submission')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <form>
      <div className="space-y-2">
        <div className="text-sm font-medium leading-none">
          Evaluation Comments
        </div>
        <textarea
          name="feedback"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
          placeholder="Provide constructive feedback for the participant..."
        />
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {roundEnded && (
          <div className="space-y-2">
            <div className="text-sm font-medium leading-none">
              Submission Status
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                formAction={(formData) => handleStatusUpdate(formData, 'approved')}
                variant="default"
                className="flex-1"
              >
                Approve Submission
              </Button>
              <Button
                formAction={(formData) => handleStatusUpdate(formData, 'rejected')}
                variant="destructive"
                className="flex-1"
              >
                Not Accepted
              </Button>
            </div>
          </div>
        )}

        {roundEnded && status === 'approved' && (
          <div className="space-y-2 pt-2">
            <div className="text-sm font-medium leading-none">
              Round Progression
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                formAction={handleAdvance}
                variant="default"
                className="flex-1"
                disabled={isFinalRound || advanced}
                onClick={(e) => {
                  if (isFinalRound) {
                    e.preventDefault()
                    toast.info('This is the final round - no further advancement possible')
                  }
                }}
              >
                {advanced 
                  ? 'Already Advanced' 
                  : isFinalRound 
                    ? 'Final Round' 
                    : 'Advance to Next Round'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}