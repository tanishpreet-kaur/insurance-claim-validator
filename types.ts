
export interface ClaimFile {
  name: string;
  type: string;
  size: number;
  base64: string;
}

export interface PolicyCheckResult {
  policyActive: boolean;
  incidentCovered: boolean;
  timeLimitOk: boolean;
}

export interface AnalysisResult {
  finalVerdict: 'Valid' | 'Invalid' | 'Suspicious';
  fraudScore: number;
  summary: string;
  estimatedPayout: string;
  policyChecks: PolicyCheckResult;
}