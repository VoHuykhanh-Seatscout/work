// src/types/submission.ts
import type { Submission, Prize, User } from '@prisma/client'

export interface SubmissionWithUser extends Submission {
  user: Pick<User, 'id' | 'name' | 'email' | 'profileImage'>
  prizes: Prize[]
}

export type PrizeWithWinner = Prize & {
  winner?: SubmissionWithUser | null
}