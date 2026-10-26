import { 
  Application, 
  DashboardStats, 
  ComplianceRule, 
  AuditEvent, 
  AnomalyAlert, 
  InfrastructureEvidence,
  AuthenticationAttempt,
  UserRole,
  ExtractedField,
  CrossDocDiscrepancy
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchCurrentUser(): Promise<{ role: UserRole; name: string; email: string; department: string }> {
  const res = await fetch(`${API_BASE}/auth/current-user`);
  return res.json();
}

export async function switchUserRole(role: UserRole) {
  const res = await fetch(`${API_BASE}/auth/switch-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  return res.json();
}

export async function fetchApplications(params?: { category?: string; status?: string; search?: string }): Promise<Application[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== 'All') searchParams.set('category', params.category);
  if (params?.status && params.status !== 'All') searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);

  const res = await fetch(`${API_BASE}/applications?${searchParams.toString()}`);
  return res.json();
}

export async function fetchApplicationById(id: string): Promise<Application> {
  const res = await fetch(`${API_BASE}/applications/${id}`);
  if (!res.ok) throw new Error('Application not found');
  return res.json();
}

export async function createApplication(data: Partial<Application>): Promise<Application> {
  const res = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create application');
  }
  return res.json();
}

export async function updateApplicationStatus(id: string, status: string, notes?: string, reviewerName?: string) {
  const res = await fetch(`${API_BASE}/applications/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes, reviewerName })
  });
  return res.json();
}

export async function uploadDocuments(applicationId: string, docCategory: string, files: File[]) {
  const formData = new FormData();
  formData.append('applicationId', applicationId);
  formData.append('docCategory', docCategory);
  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to upload documents');
  }
  return res.json();
}

export async function updateDocumentFields(docId: string, fields: ExtractedField[]) {
  const res = await fetch(`${API_BASE}/documents/${docId}/fields`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
  return res.json();
}

export async function analyzeDocumentAI(docId: string) {
  const res = await fetch(`${API_BASE}/documents/${docId}/ai-analyze`, {
    method: 'POST'
  });
  return res.json();
}

export async function runValidation(applicationId: string) {
  const res = await fetch(`${API_BASE}/applications/${applicationId}/run-validation`, {
    method: 'POST'
  });
  return res.json();
}

export async function fetchConsistencyCheck(applicationId: string): Promise<{
  applicationId: string;
  totalDocumentsInspected: number;
  discrepanciesFound: number;
  discrepancies: CrossDocDiscrepancy[];
}> {
  const res = await fetch(`${API_BASE}/consistency/check/${applicationId}`);
  return res.json();
}

export async function verifyQrCode(documentId: string, qrData: string, authorityName?: string) {
  const res = await fetch(`${API_BASE}/authentication/verify-qr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, qrData, authorityName })
  });
  return res.json();
}

export async function verifySourceApi(documentId: string, authorityName: string, referenceNumber: string) {
  const res = await fetch(`${API_BASE}/authentication/verify-source`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, authorityName, referenceNumber })
  });
  return res.json();
}

export async function recordManualVerification(documentId: string, authorityName: string, referenceNumber: string, status: string, comments: string) {
  const res = await fetch(`${API_BASE}/authentication/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, authorityName, referenceNumber, status, comments })
  });
  return res.json();
}

export async function submitReviewAction(data: { applicationId: string; findingId?: string; action: string; reason: string }) {
  const res = await fetch(`${API_BASE}/reviews/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit review action');
  }
  return res.json();
}

export async function fetchRules(): Promise<ComplianceRule[]> {
  const res = await fetch(`${API_BASE}/rules`);
  return res.json();
}

export async function createRule(rule: Partial<ComplianceRule>): Promise<ComplianceRule> {
  const res = await fetch(`${API_BASE}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule)
  });
  return res.json();
}

export async function toggleRule(id: string): Promise<ComplianceRule> {
  const res = await fetch(`${API_BASE}/rules/${id}/toggle`, {
    method: 'PATCH'
  });
  return res.json();
}

export async function fetchAuditTrail(): Promise<AuditEvent[]> {
  const res = await fetch(`${API_BASE}/audit-trail`);
  return res.json();
}

export async function fetchAnomalies(): Promise<AnomalyAlert[]> {
  const res = await fetch(`${API_BASE}/anomalies`);
  return res.json();
}

export async function updateAnomalyStatus(id: string, status: 'acknowledged' | 'dismissed') {
  const res = await fetch(`${API_BASE}/anomalies/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function fetchInfrastructure(applicationId?: string): Promise<InfrastructureEvidence[]> {
  const query = applicationId ? `?applicationId=${applicationId}` : '';
  const res = await fetch(`${API_BASE}/infrastructure${query}`);
  return res.json();
}

export async function fetchReport(applicationId: string) {
  const res = await fetch(`${API_BASE}/reports/${applicationId}`);
  return res.json();
}

export async function resetDemoDatabase() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  return res.json();
}
