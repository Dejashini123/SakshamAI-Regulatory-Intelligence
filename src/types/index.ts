export type UserRole = 
  | 'Administrator' 
  | 'Regulatory Reviewer' 
  | 'Verification Officer' 
  | 'Read-Only Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type ApplicationCategory =
  | 'Extension of Approval (EoA)'
  | 'New Programme or Course'
  | 'Intake Change'
  | 'Institution Information Change'
  | 'Other Approval-Related Changes';

export type WorkflowStatus =
  | 'Draft'
  | 'Submitted'
  | 'Preliminary Validation'
  | 'Pending Verification'
  | 'Human Review'
  | 'Rectification Requested'
  | 'Review Completed';

export type FindingSeverity = 'critical' | 'major' | 'minor' | 'info';

export type FindingCategory =
  | 'Document Completeness'
  | 'Date & Expiry'
  | 'Cross-Document Consistency'
  | 'Authentication & Integrity'
  | 'Regulatory Threshold'
  | 'Infrastructure Adequacy'
  | 'Anomaly Alert';

export type ValidationMethod = 
  | 'rule-based' 
  | 'ocr' 
  | 'ai-assisted' 
  | 'external-source';

export type ReviewStatus = 'flagged' | 'confirmed' | 'dismissed' | 'resolved';

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  sourceDocId?: string;
  sourceFilename?: string;
  page?: number;
  snippet?: string;
  confidence?: number;
  isUserCorrected?: boolean;
}

export interface DocumentRecord {
  id: string;
  applicationId: string;
  filename: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  docCategory: 
    | 'Affidavit / Undertaking'
    | 'Accreditation Certificate (NBA/NAAC)'
    | 'NOC / State Govt Permission'
    | 'University Affiliation Letter'
    | 'Land & Building Ownership Document'
    | 'Fire Safety Certificate'
    | 'Building Plan & Occupancy Certificate'
    | 'Faculty & Staff Roster'
    | 'Processing Fee Receipt'
    | 'Previous Approval Order'
    | 'Infrastructure Photograph'
    | 'Other Supporting Document';
  pageCount?: number;
  extractedText?: string;
  extractedFields: ExtractedField[];
  uploadTimestamp: string;
  isDuplicateOfHash?: string;
  isCorruptedOrUnreadable?: boolean;
  qrDecodedData?: string;
  digitalSignatureStatus?: 'verified' | 'unverified' | 'self-signed' | 'none';
  digitalSignatureDetails?: string;
}

export interface Finding {
  id: string;
  applicationId: string;
  ruleId?: string;
  documentId?: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  explanation: string;
  evidence: {
    sourceDocument?: string;
    page?: number;
    snippet?: string;
    fieldA?: { label: string; value: string; doc: string };
    fieldB?: { label: string; value: string; doc: string };
  };
  confidence: number;
  recommendedNextAction: string;
  validationMethod: ValidationMethod;
  reviewStatus: ReviewStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ComplianceRule {
  id: string;
  ruleId: string;
  name: string;
  category: ApplicationCategory | 'All Categories';
  description: string;
  severity: FindingSeverity;
  sourceReference: string; // e.g. "AICTE APH 2026-27 Sec 2.4"
  effectiveDate: string;
  version: string;
  isEnabled: boolean;
  isDemonstrationRule: boolean;
  requiredDocType?: string;
  requiredField?: string;
  conditionType: 
    | 'document_presence' 
    | 'validity_date' 
    | 'consistency_match' 
    | 'intake_ratio' 
    | 'infrastructure_item';
}

export interface CrossDocDiscrepancy {
  field: string;
  docA: { name: string; value: string; snippet?: string };
  docB: { name: string; value: string; snippet?: string };
  comparisonMethod: 'exact' | 'normalized' | 'fuzzy';
  similarityScore: number;
  explanation: string;
  severity: FindingSeverity;
}

export interface AuthenticationAttempt {
  id: string;
  documentId: string;
  applicationId: string;
  type: 'qr_code' | 'issuing_authority_api' | 'digital_signature' | 'manual_verification';
  authorityName: string;
  referenceNumber: string;
  endpointUrl?: string;
  timestamp: string;
  status: 
    | 'Verified by authorized source' 
    | 'Mismatch detected' 
    | 'Expired' 
    | 'Pending verification' 
    | 'Source unavailable' 
    | 'Manual review required' 
    | 'Not verifiable with current integrations';
  responseDetails?: string;
  verifiedByActor?: string;
}

export interface AnomalyAlert {
  id: string;
  applicationId: string;
  documentId?: string;
  title: string;
  reason: string;
  evidence: string;
  detectionMethod: 'sha256_exact_match' | 'date_anomaly' | 'metadata_conflict' | 'text_similarity';
  severity: FindingSeverity;
  limitations: string;
  suggestedNextStep: string;
  status: 'pending_review' | 'acknowledged' | 'dismissed';
}

export interface InfrastructureEvidence {
  id: string;
  applicationId: string;
  category: 'Classrooms' | 'Computer Lab' | 'Central Library' | 'Barrier-Free Access' | 'Fire Safety System' | 'Solar / Eco Infrastructure';
  title: string;
  description: string;
  claimedSpecification: string;
  imageUrl?: string;
  ocrDetectedText?: string;
  aiVisualObservations?: string;
  inspectionRecommendation: string;
  complianceState: 'Apparent Match' | 'Discrepancy Flagged' | 'Physical Inspection Advised';
}

export interface ReviewerAction {
  id: string;
  applicationId: string;
  findingId?: string;
  actor: string;
  role: UserRole;
  action: 'confirm_finding' | 'dismiss_finding' | 'request_rectification' | 'complete_review' | 'add_note' | 'verify_doc';
  reason: string;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  recordId: string;
  outcome: 'SUCCESS' | 'WARNING' | 'FAILED' | 'RECORDED';
  details: string;
}

export interface Application {
  id: string;
  applicationId: string; // e.g. "AICTE-2026-EOA-98102"
  institutionName: string;
  institutionIdentifier: string; // AICTE Permanent ID (PID)
  category: ApplicationCategory;
  academicYear: string;
  submissionDate: string;
  institutionType: 'Engineering & Technology' | 'Polytechnic Diploma' | 'Management (MBA/PGDM)' | 'MCA' | 'Pharmacy' | 'Architecture';
  state: string;
  status: WorkflowStatus;
  approvedIntake: number;
  requestedIntake: number;
  programmesList: string[];
  documents: DocumentRecord[];
  findings: Finding[];
  reviewerNotes: string;
  lastValidatedAt?: string;
  preliminaryScore?: {
    passedChecks: number;
    warnings: number;
    deficiencies: number;
    unresolvedCount: number;
  };
}

export interface DashboardStats {
  totalApplications: number;
  validationCompleted: number;
  deficienciesIdentified: number;
  pendingAuthorityVerification: number;
  manualReviewRequired: number;
  expiredDocumentsDetected: number;
  potentialAnomaliesFlagged: number;
  averageProcessingTimeHours: number;
  categoryDistribution: { category: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  deficiencyCategories: { category: string; count: number }[];
}
