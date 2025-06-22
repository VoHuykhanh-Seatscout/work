'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { SubmissionStatus } from '@prisma/client'

interface UpdateSubmissionParams {
  submissionId: string
  status: SubmissionStatus
  feedback?: string
}

export async function updateSubmissionStatus({
  submissionId,
  status,
  feedback
}: UpdateSubmissionParams) {
  try {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status,
        feedback,
        reviewedAt: new Date()
      }
    })

    revalidatePath(`/submissions/${submissionId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating submission:', error)
    return { success: false, error: 'Failed to update submission' }
  }
}

export async function updateSubmissionRound({
  submissionId,
  advance
}: {
  submissionId: string
  advance: boolean
}) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        round: true,
        competition: {
          include: {
            rounds: {
              orderBy: {
                endDate: 'asc'
              }
            }
          }
        }
      }
    })

    if (!submission) {
      return { success: false, error: 'Submission not found' }
    }

    if (!advance) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: { 
          advanced: false,
          nextRoundId: null
        }
      })
      revalidatePath(`/submissions/${submissionId}`)
      return { success: true }
    }

    const currentRoundIndex = submission.competition.rounds.findIndex(
      r => r.id === submission.round.id
    )
    
    if (currentRoundIndex === -1 || currentRoundIndex === submission.competition.rounds.length - 1) {
      return { 
        success: false, 
        error: 'This is already the final round - cannot advance further' 
      }
    }

    const nextRound = submission.competition.rounds[currentRoundIndex + 1]

    await prisma.submission.update({
      where: { id: submissionId },
      data: { 
        advanced: true,
        nextRoundId: nextRound.id
      }
    })

    revalidatePath(`/submissions/${submissionId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating submission round:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update round' 
    }
  }
}