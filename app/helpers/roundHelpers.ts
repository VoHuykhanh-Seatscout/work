// helpers/roundHelpers.ts
import { RoundWithRelations } from '@/types/round'
export const parseRoundFromAPI = (data: any): RoundWithRelations => {
    return {
      ...data.round,
      startDate: new Date(data.round.startDate),
      endDate: new Date(data.round.endDate),
      resources: Array.isArray(data.round.resources) ? data.round.resources : [],
      submissionRules: {
        allowFileUpload: data.round.submissionRules?.allowFileUpload ?? false,
        allowExternalLinks: data.round.submissionRules?.allowExternalLinks ?? false,
        acceptLateSubmissions: data.round.submissionRules?.acceptLateSubmissions ?? false,
        showCountdown: data.round.submissionRules?.showCountdown ?? false,
        maxFileSizeMB: data.round.submissionRules?.maxFileSizeMB ?? 10,
        allowedFileTypes: Array.isArray(data.round.submissionRules?.allowedFileTypes) 
          ? data.round.submissionRules.allowedFileTypes 
          : []
      },
      evaluation: {
        rubric: Array.isArray(data.round.evaluation?.rubric) ? data.round.evaluation.rubric : [],
        judges: Array.isArray(data.round.evaluation?.judges) ? data.round.evaluation.judges : [],
        weight: data.round.evaluation?.weight ?? 100
      }
    }
  }