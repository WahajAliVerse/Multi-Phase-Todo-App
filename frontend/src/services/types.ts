/**
 * Type definitions for accessibility audit service
 */

export interface A11yAuditReport {
  timestamp: string;
  url: string;
  pageContent: string;
  violations: AuditRule[];
  incomplete: AuditRule[];
  passes: AuditRule[];
  inapplicable: AuditRule[];
  score: number;
}

export interface AuditRule {
  id: string;
  description: string;
  elements: string[];
  severity: 'critical' | 'moderate' | 'minor';
  helpUrl: string;
}