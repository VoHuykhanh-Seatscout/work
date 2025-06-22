// actions/competitions.ts
'use server'

import { prisma } from '@/lib/prisma'

export async function setCompetitionWinner({
  competitionId,
  submissionId
}: {
  competitionId: string
  submissionId: string
}) {
  try {
    // First, ensure the submission belongs to the competition
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { competitionId: true }
    })

    if (!submission || submission.competitionId !== competitionId) {
      return { success: false, error: 'Invalid submission' }
    }

    // Update the competition with the winner
    await prisma.competition.update({
      where: { id: competitionId },
      data: {
        winnerId: submissionId,
      }
    })

    // You might also want to update the submission to mark it as winner
    await prisma.submission.update({
  where: { id: submissionId },
  data: {
    winningCompetitionId: competitionId
  }
})

    return { success: true }
  } catch (error) {
    console.error('Error setting competition winner:', error)
    return { success: false, error: 'Failed to set winner' }
  }
}