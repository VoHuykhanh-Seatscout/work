import { Round as PrismaRound, Resource as PrismaResource, RoundStatus } from '@prisma/client';

export interface SubmissionRules {
  allowFileUpload: boolean;
  allowExternalLinks: boolean;
  acceptLateSubmissions: boolean;
  showCountdown: boolean;
  maxFileSizeMB: number;
  allowedFileTypes: string[];
}

export interface RoundEvaluation {
  rubric?: {
    name: string;
    maxScore: number;
  }[];
  judges?: string[];
  weight: number;
}

export interface Resource extends PrismaResource {
  publicId: string;
  type: string | null;
  size: number | null;
}

export interface RoundWithRelations extends Omit<PrismaRound, 'evaluation' | 'submissionRules'> {
  resources: Resource[];
  submissionRules: SubmissionRules;
  evaluation: RoundEvaluation;
  competition: {
    organizerId: string;
  };
}