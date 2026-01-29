import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';
import { AuditInput, AuditResult } from './types';

// Tool Working (Retries & Timeouts)
const { fetchResourceMetadata, analyzeSecurityRisk, generateFixScript } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    initialInterval: '1s',
    maximumAttempts: 5,
  },
});

export async function infrastructureAuditWorkflow(input: AuditInput): Promise<AuditResult> {
  //Get data
  const metadata = await fetchResourceMetadata(input);

  //Analyze
  const risk = await analyzeSecurityRisk(metadata);

  //Plan Fix
  const fix = await generateFixScript(risk.level);

  return {
    resourceId: input.resourceId,
    violationFound: risk.violation,
    severity: risk.level as any,
    remediationPlan: fix,
    timestamp: new Date().toISOString(),
  };
}