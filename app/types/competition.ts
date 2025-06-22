import { Competition as PrismaCompetition, User as PrismaUser, Round as PrismaRound } from "@prisma/client";

// Judging Method Types
export type FrontendJudgingMethod = 'PANEL' | 'PUBLIC_VOTE' | 'COMBINATION';
export type BackendJudgingMethod = 'PANEL' | 'PEER' | 'PUBLIC' | 'HYBRID';

export const judgingMethodMap: Record<FrontendJudgingMethod, BackendJudgingMethod> = {
  PANEL: 'PANEL',
  PUBLIC_VOTE: 'PUBLIC',
  COMBINATION: 'HYBRID'
};

export const toBackendJudgingMethod = (method: FrontendJudgingMethod): BackendJudgingMethod => {
  return judgingMethodMap[method];
};

export const toFrontendJudgingMethod = (method: BackendJudgingMethod): FrontendJudgingMethod => {
  const reverseMap = {
    PANEL: 'PANEL',
    PUBLIC: 'PUBLIC_VOTE',
    PEER: 'PANEL', // Fallback
    HYBRID: 'COMBINATION'
  };
  return reverseMap[method] as FrontendJudgingMethod;
};

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface RoundDescription {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  deliverables: string;
  judgingMethod: string;
  criteria: string;
}

// Round Types
export interface Round {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  deliverables: string | null;
  judgingMethod: string | null;
  criteria: any;
  evaluation: any;
  submissionRules: any;
  resources: any;
}

// Submission Types
export interface Submission {
  id: string;
  userId: string;
  content: any;
  competitionId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  isWinner?: boolean;
  user: User;
  winningPrize?: Prize | null;
}

export interface SubmissionWithWinnerInfo extends Submission {
  isWinner: boolean;
  prize: Prize | null;
  round: Round;
  competition: {
    id: string;
    title: string;
  };
  nextRound?: Round | null;
}

// Prize Types
export interface Prize {
  id: string;
  name: string;
  description: string | null;
  competitionId: string;
  winnerId: string | null;
  value: string | null;
  position: number;
}

// Competition Types
export interface ExtendedCompetition extends PrismaCompetition {
  organizer: User;
  rounds?: Round[];
  participants: User[];
  registrations?: { user: User }[];
  stats?: {
    totalParticipants: number;
    roundsCount: number;
    submissionsCount: number;
  };
}

export interface CompetitionDetails extends ExtendedCompetition {
  tagline: string;
  deadline: Date | string;
  rules: string;
  judgingCriteria: string;
  eligibility: string;
  website: string;
  teamSize: number;
  numberOfRounds: number;
  socialMediaLinks: any;
  hashtags: string;
  coverImage: string | null;
  logo: string;
  organizerName: string;
  organizerDescription: string;
  isRegistered: boolean;
  submissions?: SubmissionWithWinnerInfo[];
  prizes?: Prize[];
}

// Form Props
export interface SelectWinnerFormProps {
  competitionId: string;
  submissions: SubmissionWithWinnerInfo[];
  preselectedSubmission?: SubmissionWithWinnerInfo | null;
  prizes: Prize[];
}

// API Response Types
export interface CompetitionResponse {
  success: boolean;
  data?: CompetitionDetails;
  error?: string;
}

export interface CompetitionListResponse {
  success: boolean;
  data?: CompetitionDetails[];
  error?: string;
}