export interface AuditInput {
    resourceId: string;
    resourceType: 'S3_BUCKET' | 'EC2_INSTANCE';
  }
  
  export interface AuditResult {
    resourceId: string;
    violationFound: boolean;
    severity: 'LOW' | 'HIGH' | 'CRITICAL' | 'NONE';
    remediationPlan: string;
    timestamp: string;
  }