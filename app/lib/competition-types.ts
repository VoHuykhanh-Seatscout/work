// src/lib/competition-types.ts
export type FrontendJudgingMethod = 'PANEL' | 'PUBLIC_VOTE' | 'COMBINATION';
export type BackendJudgingMethod = 'PANEL' | 'PEER' | 'PUBLIC' | 'HYBRID';

export const convertToBackendMethod = (
  method: FrontendJudgingMethod
): BackendJudgingMethod => {
  const mapping: Record<FrontendJudgingMethod, BackendJudgingMethod> = {
    PANEL: 'PANEL',
    PUBLIC_VOTE: 'PUBLIC',
    COMBINATION: 'HYBRID'
  };
  return mapping[method];
};

export const convertToFrontendMethod = (
  method: BackendJudgingMethod
): FrontendJudgingMethod => {
  const mapping: Record<BackendJudgingMethod, FrontendJudgingMethod> = {
    PANEL: 'PANEL',
    PUBLIC: 'PUBLIC_VOTE',
    PEER: 'PANEL', // Default fallback
    HYBRID: 'COMBINATION'
  };
  return mapping[method];
};