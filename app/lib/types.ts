// lib/types.ts
import { Submission, User } from '@prisma/client'

export type SubmissionWithUser = Submission & {
  user: Pick<User, 'id' | 'name' | 'email' | 'profileImage'>
}