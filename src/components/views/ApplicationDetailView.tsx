import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Scale, 
  Building2, 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  QrCode, 
  Printer, 
  Edit3, 
  Check, 
  X, 
  RotateCw, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  Application, 
  Finding, 
  DocumentRecord, 
  UserRole, 
  CrossDocDiscrepancy, 
  AuthenticationAttempt,
  WorkflowStatus
} from '../../types/index.ts';
import { 
  runValidation, 
  updateApplicationStatus, 
  submitReviewAction, 
  analyzeDocumentAI,
  fetchConsistencyCheck,
  verifyQrCode,
  verifySourceApi,
  recordManualVerification,
  fetchReport
} from '../../services/api.ts';

interface ApplicationDetailViewProps {
  application: Application;
  activeRole: UserRole;
  onBack: () => void;
  onRefresh: (updatedApp: Application) => void;
}

export const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
  application,
  activeRole,
  onBack,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<
    'findings' | 'documents' | 'consistency' | 'authentication' | 'infrastructure' | 'report'
  >('findings');

  const [currentApp, setCurrentApp] = useState<Application>(application);
  const [isValidating, setIsValidating] = useState(false);
  const [statusNotes, setStatusNotes] = useState(currentApp.reviewerNotes || '');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<WorkflowStatus>(currentApp.status);

  // Dismiss / Confirm Finding modal state
  const [actionFindingId, setActionFindingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'dismiss'>('confirm');
  const [actionReason, setActionReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Consistency State
  const [consistencyData, setConsistencyData] = useState<{
    totalDocumentsInspected: number;
    discrepanciesFound: number;
    discrepancies: CrossDocDiscrepancy[];
  } | null>(null);
  const [isLoadingConsistency, setIsLoadingConsistency] = useState(false);

  // AI Document Analysis modal
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Authentication Tab state
  const [qrInput, setQrInput] = useState('');
  const [authAuthority, setAuthAuthority] = useState('State Technical Education Registry');
  const [authRefNo, setAuthRefNo] = useState('');
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Report Preview
  const [reportData, setReportData] = useState<any | null>(null);

  useEffect(() => {
    setCurrentApp(application);
  }, [application]);

  // Load consistency data when tab selected
  useEffect(() => {
    if (activeTab === 'consistency' && !consistencyData) {
      loadConsistency();
    } else if (activeTab === 'report' && !reportData) {
      loadReport();
    }
  }, [activeTab]);

  const loadConsistency = async () => {
    setIsLoadingConsistency(true);
    try {
      const data = await fetchConsistencyCheck(currentApp.id);
      setConsistencyData(data);
    } catch (err) {
      console.error('Failed to load consistency data', err);
    } finally {
      setIsLoadingConsistency(false);
    }
  };

  const loadReport = async () => {
    try {
      const data = await fetchReport(currentApp.id);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report data', err);
    }
  };

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      const res = await runValidation(currentApp.id);
      setCurrentApp(res.application);
      onRefresh(res.application);
      loadConsistency();
    } catch (err) {
      console.error('Validation error', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdateStatusSubmit = async () => {
    try {
      const updated = await updateApplicationStatus(
        currentApp.id, 
        selectedStatus, 
        statusNotes, 
        activeRole
      );
      setCurrentApp(updated);
      onRefresh(updated);
      setIsChangingStatus(false);
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const handleReviewActionSubmit = async () => {
    if (!actionFindingId) return;
    setIsSubmittingAction(true);
    try {
      const res = await submitReviewAction({
        applicationId: currentApp.id,
        findingId: actionFindingId,
        action: actionType === 'confirm' ? 'confirm_finding' : 'dismiss_finding',
        reason: actionReason
      });
      setCurrentApp(res.application);
      onRefresh(res.application);
      setActionFindingId(null);
      setActionReason('');
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRunAiOnDoc = async (docId: string) => {
    setAnalyzingDocId(docId);
    setIsAnalyzingAi(true);
    setAiAnalysisResult(null);
    try {
      const res = await analyzeDocumentAI(docId);
      setAiAnalysisResult(res);
    } catch (err) {
      console.error('AI Analysis failed', err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleVerifyQr = async (docId: string) => {
    if (!qrInput.trim()) return;
    setIsVerifyingAuth(true);
    try {
      await verifyQrCode(docId, qrInput, authAuthority);
      setAuthSuccessMsg('QR Code decoded and verified successfully.');
      setQrInput('');
      const updated = await runValidation(currentApp.id);
      setCurrentApp(updated.application);
      onRefresh(updated.application);
    } catch (err) {
      console.error('QR verify error', err);
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  const handleVerifySourceApi = async (docId: string) => {
    if (!authRefNo.trim()) return;
    setIsVerifyingAuth(true);
    try {
      await verifySourceApi(docId, authAuthority, authRefNo);
      setAuthSuccessMsg(`Queried ${authAuthority} live endpoint. Verification recorded.`);
      setAuthRefNo('');
      const updated = await runValidation(currentApp.id);
      setCurrentApp(updated.application);
      onRefresh(updated.application);
    } catch (err) {
      console.error('Source API verify error', err);
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & App Summary Header */}
      <div className="space-y-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications Repository</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {currentApp.applicationId}
              </span>
              <span className="text-slate-300">·</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                currentApp.status === 'Rectification Requested'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : currentApp.status === 'Human Review'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : currentApp.status === 'Preliminary Validation'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {currentApp.status}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900 mt-1.5">
              {currentApp.institutionName}
            </h2>

            <div className="text-xs text-slate-500 font-mono flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span>PID: {currentApp.institutionIdentifier}</span>
              <span>·</span>
              <span>Category: {currentApp.category}</span>
              <span>·</span>
              <span>AY: {currentApp.academicYear}</span>
              <span>·</span>
              <span>State: {currentApp.state}</span>
              <span>·</span>
              <span>Intake: {currentApp.approvedIntake} → {currentApp.requestedIntake}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsChangingStatus(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
            >
              Update Workflow Status
            </button>

            <button
              onClick={handleRunValidation}
              disabled={isValidating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-2xs transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
              <span>{isValidating ? 'Validating...' : 'Re-Run Validation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {isChangingStatus && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Update Application Workflow Status</h3>
            <div className="space-y-1 text-xs">
              <label className="text-slate-600 font-medium">Workflow Stage</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as WorkflowStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-white focus:outline-none"
              >
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Preliminary Validation">Preliminary Validation</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Human Review">Human Review</option>
                <option value="Rectification Requested">Rectification Requested</option>
                <option value="Review Completed">Review Completed</option>
              </select>
            </div>
            <div className="space-y-1 text-xs">
              <label className="text-slate-600 font-medium">Reviewer Assessment Notes</label>
              <textarea
                rows={3}
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Enter notes justifying status transition..."
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => setIsChangingStatus(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatusSubmit}
                className="px-4 py-1.5 bg-teal-600 text-white rounded font-medium hover:bg-teal-700"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Action Confirmation / Dismissal Modal */}
      {actionFindingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">
              {actionType === 'confirm' ? 'Confirm Regulatory Finding' : 'Dismiss Regulatory Finding'}
            </h3>
            <p className="text-xs text-slate-500">
              {actionType === 'confirm'
                ? 'Confirming marks this finding as an established deficiency or requirement requiring institutional response.'
                : 'Dismissing requires recorded administrative justification under AICTE audit oversight.'}
            </p>
            <div className="space-y-1 text-xs">
              <label className="text-slate-700 font-medium">
                {actionType === 'dismiss' ? 'Mandatory Justification Reason *' : 'Reviewer Remarks'}
              </label>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionType === 'dismiss' ? 'e.g. Validated via physical file annexure / gazette exemption...' : 'Add remarks...'}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button
                onClick={() => {
                  setActionFindingId(null);
                  setActionReason('');
                }}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewActionSubmit}
                disabled={isSubmittingAction || (actionType === 'dismiss' && actionReason.trim().length < 5)}
                className={`px-4 py-1.5 text-white rounded font-medium ${
                  actionType === 'confirm' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-600 hover:bg-rose-700'
                } disabled:bg-slate-300`}
              >
                {isSubmittingAction ? 'Recording...' : actionType === 'confirm' ? 'Confirm Finding' : 'Dismiss Finding'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'findings'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Findings & Deficiencies ({currentApp.findings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents & Extracted Fields ({currentApp.documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consistency')}
          className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'consistency'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Cross-Doc Consistency</span>
        </button>

        <button
          onClick={() => setActiveTab('authentication')}
          className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'authentication'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Document Authentication (QR / API)</span>
        </button>

        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'infrastructure'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Infrastructure Evidence</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'report'
              ? 'border-teal-600 text-teal-700 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Assessment Report</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. AI Findings & Deficiencies */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Showing explainable rule-based and AI-assisted findings for this application:
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-rose-600 font-semibold">{currentApp.preliminaryScore?.deficiencies || 0} Critical Deficiencies</span>
              <span>·</span>
              <span className="text-amber-600 font-medium">{currentApp.preliminaryScore?.warnings || 0} Warnings</span>
              <span>·</span>
              <span className="text-emerald-600">{currentApp.preliminaryScore?.passedChecks || 0} Passed</span>
            </div>
          </div>

          {currentApp.findings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-400">
              No findings generated yet. Click "Re-Run Validation" to analyze documents.
            </div>
          ) : (
            <div className="space-y-3">
              {currentApp.findings.map((f) => {
                const isCritical = f.severity === 'critical';
                const isMajor = f.severity === 'major';
                const isInfo = f.severity === 'info';

                return (
                  <div 
                    key={f.id} 
                    className={`bg-white border rounded-lg p-4 space-y-3 transition-colors ${
                      f.reviewStatus === 'dismissed' 
                        ? 'opacity-60 bg-slate-50 border-slate-200' 
                        : isCritical 
                        ? 'border-rose-300' 
                        : isMajor 
                        ? 'border-amber-300' 
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        {isCritical ? (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : isMajor ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <h4 className="text-xs font-semibold text-slate-900">{f.title}</h4>
                        <span className="text-slate-400">·</span>
                        <span className="text-[11px] text-slate-500">{f.category}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className="text-slate-500">{f.validationMethod}</span>
                        <span>·</span>
                        <span className="text-slate-500">Confidence: {Math.round(f.confidence * 100)}%</span>
                        <span>·</span>
                        <span className={`px-2 py-0.5 rounded font-sans font-medium capitalize ${
                          f.reviewStatus === 'confirmed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : f.reviewStatus === 'dismissed'
                            ? 'bg-slate-100 text-slate-600 line-through'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {f.reviewStatus}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {f.explanation}
                    </p>

                    {/* Evidence Snippet Reference */}
                    {f.evidence && (
                      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-mono space-y-1">
                        <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                          Evidence Reference:
                        </div>
                        {f.evidence.sourceDocument && (
                          <div className="text-slate-700">Source Document: {f.evidence.sourceDocument} {f.evidence.page ? `(Page ${f.evidence.page})` : ''}</div>
                        )}
                        {f.evidence.snippet && (
                          <div className="text-slate-900 bg-white p-1.5 rounded border border-slate-200 text-[11px]">
                            "{f.evidence.snippet}"
                          </div>
                        )}
                        {f.evidence.fieldA && f.evidence.fieldB && (
                          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                            <div className="p-1 bg-white rounded border border-slate-200">
                              <span className="text-slate-400">{f.evidence.fieldA.label}:</span> {f.evidence.fieldA.value}
                            </div>
                            <div className="p-1 bg-white rounded border border-slate-200">
                              <span className="text-slate-400">{f.evidence.fieldB.label}:</span> {f.evidence.fieldB.value}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recommended Next Action & Human Review Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 text-xs">
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-800">Recommended Next Step:</span> {f.recommendedNextAction}
                      </div>

                      {activeRole !== 'Read-Only Auditor' && f.reviewStatus !== 'resolved' && (
                        <div className="flex items-center gap-2 shrink-0">
                          {f.reviewStatus !== 'confirmed' && (
                            <button
                              onClick={() => {
                                setActionFindingId(f.id);
                                setActionType('confirm');
                                setActionReason('');
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
                            >
                              Confirm Flag
                            </button>
                          )}
                          {f.reviewStatus !== 'dismissed' && (
                            <button
                              onClick={() => {
                                setActionFindingId(f.id);
                                setActionType('dismiss');
                                setActionReason('');
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                            >
                              Dismiss (With Reason)
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {f.reviewerNotes && (
                      <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 italic">
                        Reviewer Record: {f.reviewerNotes} {f.reviewedBy ? `— by ${f.reviewedBy}` : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. Documents & Extracted Fields */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Cryptographically verified documents and extracted metadata fields:
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {currentApp.documents.length} files attached
            </span>
          </div>

          <div className="space-y-3">
            {currentApp.documents.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="font-semibold text-xs text-slate-900">{doc.originalName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600">{doc.docCategory}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Uploaded: {new Date(doc.uploadTimestamp).toLocaleDateString()} · Size: {Math.round(doc.sizeBytes / 1024)} KB · Pages: {doc.pageCount || 1}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunAiOnDoc(doc.id)}
                      disabled={isAnalyzingAi}
                      className="px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 border border-teal-200 rounded flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Gemini AI Inspect</span>
                    </button>
                  </div>
                </div>

                {/* SHA-256 Hash Display */}
                <div className="text-[11px] font-mono bg-slate-50 border border-slate-200 rounded p-2 flex items-center justify-between text-slate-600">
                  <span className="truncate">SHA-256: {doc.sha256Hash}</span>
                  {doc.isDuplicateOfHash && (
                    <span className="text-rose-600 font-sans font-semibold shrink-0">
                      Duplicate File Flagged
                    </span>
                  )}
                </div>

                {/* Extracted Fields Matrix */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700">Extracted Fields:</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {doc.extractedFields.map((field, fIdx) => (
                      <div key={fIdx} className="p-2 bg-slate-50 border border-slate-100 rounded text-xs space-y-0.5">
                        <div className="text-[11px] text-slate-400">{field.label}</div>
                        <div className="font-mono text-slate-800 font-medium truncate" title={field.value}>
                          {field.value}
                        </div>
                        {field.isUserCorrected && (
                          <div className="text-[10px] text-teal-600 italic">User corrected</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extracted Snippet Preview */}
                {doc.extractedText && (
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500 font-medium">Text Stream Sample:</div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] font-mono text-slate-700 max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {doc.extractedText.slice(0, 600)}...
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* AI Document Analysis Dialog */}
          {analyzingDocId && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Gemini 3.8 Flash AI Analysis</h3>
                  </div>
                  <button
                    onClick={() => {
                      setAnalyzingDocId(null);
                      setAiAnalysisResult(null);
                    }}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isAnalyzingAi ? (
                  <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                    <RotateCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
                    <p>Executing structured regulatory analysis via Google Gemini API...</p>
                  </div>
                ) : aiAnalysisResult ? (
                  <div className="space-y-3 text-xs">
                    {!aiAnalysisResult.aiAvailable && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>{aiAnalysisResult.message}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-800">Summary:</span>
                      <p className="text-slate-700">{aiAnalysisResult.analysis?.summary}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-800">Identified Purpose:</span>
                      <p className="text-slate-700">{aiAnalysisResult.analysis?.purpose}</p>
                    </div>

                    {aiAnalysisResult.analysis?.potentialDeficienciesOrAnomalies && (
                      <div className="space-y-1.5 pt-2">
                        <span className="font-semibold text-slate-800">Potential Findings Identified:</span>
                        <div className="space-y-1.5">
                          {aiAnalysisResult.analysis.potentialDeficienciesOrAnomalies.map((item: any, idx: number) => (
                            <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                              <span className="font-semibold text-rose-700">[{item.severity}]</span> {item.explanation}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 pt-2">
                      <span className="font-semibold text-slate-800">Action Recommended:</span>
                      <p className="text-slate-700">{aiAnalysisResult.analysis?.recommendedNextAction}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setAnalyzingDocId(null);
                      setAiAnalysisResult(null);
                    }}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. Cross-Document Consistency Engine */}
      {activeTab === 'consistency' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Cross-Document Consistency Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated comparison of AICTE Permanent ID (PID), Institution Legal Name, and Dates across all attached files
            </p>
          </div>

          {isLoadingConsistency ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Running cross-document pairwise alignment...
            </div>
          ) : consistencyData && consistencyData.discrepancies.length > 0 ? (
            <div className="space-y-3">
              {consistencyData.discrepancies.map((disc, idx) => (
                <div key={idx} className="border border-amber-300 bg-amber-50/40 rounded-lg p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-900">{disc.field} Discrepancy</span>
                    <span className="font-mono text-[11px] text-amber-700">
                      Method: {disc.comparisonMethod} · Similarity: {Math.round(disc.similarityScore * 100)}%
                    </span>
                  </div>
                  <p className="text-slate-700">{disc.explanation}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 bg-white rounded border border-amber-200">
                      <div className="text-slate-400">{disc.docA.name}:</div>
                      <div className="text-slate-900 font-semibold">{disc.docA.value}</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-amber-200">
                      <div className="text-slate-400">{disc.docB.name}:</div>
                      <div className="text-slate-900 font-semibold">{disc.docB.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-600 flex flex-col items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-slate-800">Cross-Document Consistency Verified</span>
              <span className="text-slate-500">
                All extracted identifiers and institutional names align across submitted records.
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. Document Authentication */}
      {activeTab === 'authentication' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Verification Module */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                QR Code Cryptographic Verification
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Decode and cross-verify QR security codes on affidavits and state NOCs against AICTE verification endpoints.
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-slate-700 font-medium">Select Target Document</label>
              <select id="qr-target-doc" className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs bg-white">
                {currentApp.documents.map(d => (
                  <option key={d.id} value={d.id}>{d.originalName} ({d.docCategory})</option>
                ))}
              </select>

              <label className="text-slate-700 font-medium">QR Payload / Decoded Content</label>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="e.g. AICTE-VERIFY:PID=1-10928374:APP=AICTE-2026-EOA-10928"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-mono"
              />

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    const sel = (document.getElementById('qr-target-doc') as HTMLSelectElement)?.value;
                    if (sel) handleVerifyQr(sel);
                  }}
                  disabled={isVerifyingAuth || !qrInput.trim()}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-medium disabled:bg-slate-300"
                >
                  Verify QR Cryptographic Hash
                </button>
              </div>
            </div>
          </div>

          {/* Issuing Authority API Verification */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                Issuing Authority Official Source API
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Query state government DTE, Municipal Fire Directorate, or Affiliating University live registries.
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-slate-700 font-medium">Issuing Authority Gateway</label>
              <select
                value={authAuthority}
                onChange={(e) => setAuthAuthority(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs bg-white"
              >
                <option value="State Directorate of Technical Education">State Directorate of Technical Education</option>
                <option value="CIDCO / Municipal Fire Services Department">CIDCO / Municipal Fire Services Department</option>
                <option value="Affiliating University Syndicate Registry">Affiliating University Syndicate Registry</option>
                <option value="Council of Architecture Registry">Council of Architecture Registry</option>
              </select>

              <label className="text-slate-700 font-medium">Statutory Certificate Reference No.</label>
              <input
                type="text"
                value={authRefNo}
                onChange={(e) => setAuthRefNo(e.target.value)}
                placeholder="e.g. CIDCO/FIRE/2025/9821"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-mono"
              />

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    const sel = (document.getElementById('qr-target-doc') as HTMLSelectElement)?.value || currentApp.documents[0]?.id;
                    if (sel) handleVerifySourceApi(sel);
                  }}
                  disabled={isVerifyingAuth || !authRefNo.trim()}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-medium disabled:bg-slate-300"
                >
                  Query Official Gateway
                </button>
              </div>
            </div>

            {authSuccessMsg && (
              <div className="p-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded">
                {authSuccessMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. Infrastructure Evidence */}
      {activeTab === 'infrastructure' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                Campus Infrastructure & Spatial Evidence Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visual scrutiny of academic facilities, laboratory workstations, fire suppression, and barrier-free ramps
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg overflow-hidden space-y-3 p-3 bg-slate-50">
              <img
                src="/src/assets/images/infrastructure_campus_sample_1792991511564.jpg"
                alt="Engineering Campus Facility"
                className="w-full h-48 object-cover rounded"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs space-y-1">
                <div className="font-semibold text-slate-900">Engineering Academic Block A</div>
                <div className="text-slate-500">Claimed: 14,200 sq.m built-up area conforming to AICTE norms</div>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-700">
                  <span className="font-semibold text-teal-800">AI Visual Observation:</span> Multistory modern educational building with tiered glass facade, accessible ramps, and broad egress paths.
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 text-xs space-y-3 bg-white">
              <h4 className="font-semibold text-slate-800">Statutory Norms Checklist (AICTE APH 2026-27):</h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Classrooms Area (66 sq.m / division)</span>
                  <span className="text-emerald-700 font-semibold font-mono">Apparent Match</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Wheelchair Ramp & Tactile Paving (RPwD Act)</span>
                  <span className="text-emerald-700 font-semibold font-mono">Apparent Match</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Dedicated Fire Hose Reel & 50KL Tank</span>
                  <span className="text-amber-700 font-semibold font-mono">Physical Inspection Advised</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span>Computer Workstations (1:4 Student Ratio)</span>
                  <span className="text-emerald-700 font-semibold font-mono">Verified in Stock Register</span>
                </li>
              </ul>
              <div className="text-[11px] text-slate-400 italic">
                Note: Photogrammetric visual estimates do not substitute statutory physical scrutiny by an on-site Expert Visiting Committee (EVC).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. Preliminary Assessment Report */}
      {activeTab === 'report' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 max-w-4xl mx-auto shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/aicte_emblem_logo_1792991510533.jpg"
                alt="AICTE Logo"
                className="w-12 h-12 rounded-full border border-amber-500/30 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 tracking-wide">
                  ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                </div>
                <div className="text-[11px] text-slate-600">
                  Regulation Bureau · Statutory Approval Process 2026-2027
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Assessment Report</span>
            </button>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded leading-relaxed">
            <span className="font-semibold">MANDATORY STATUTORY DISCLAIMER:</span> This preliminary regulatory compliance document is an algorithmic decision-support assessment generated via AICTE SAKSHAM. It does NOT constitute final statutory approval or rejection. Final administrative authority remains vested exclusively with the AICTE Regulation Bureau and Competent Authority.
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400">Application Number:</div>
              <div className="font-mono font-bold text-slate-900">{currentApp.applicationId}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Permanent Institute ID:</div>
              <div className="font-mono font-bold text-slate-900">{currentApp.institutionIdentifier}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Institution Name:</div>
              <div className="font-semibold text-slate-900">{currentApp.institutionName}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400">Application Category:</div>
              <div className="text-slate-900">{currentApp.category}</div>
            </div>
          </div>

          {/* Findings Summary Table */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
              Compliance Findings Breakdown
            </div>
            <div className="border border-slate-200 rounded overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Finding Title</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentApp.findings.map(f => (
                    <tr key={f.id}>
                      <td className="px-3 py-2 text-slate-600">{f.category}</td>
                      <td className="px-3 py-2 text-slate-900 font-medium">{f.title}</td>
                      <td className="px-3 py-2 font-mono uppercase text-[11px]">
                        <span className={f.severity === 'critical' ? 'text-rose-600 font-bold' : f.severity === 'major' ? 'text-amber-600' : 'text-slate-500'}>
                          {f.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2 capitalize font-medium">{f.reviewStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Generated At: {new Date().toISOString()}</span>
            <span>Assessing Officer: {activeRole}</span>
          </div>
        </div>
      )}
    </div>
  );
};
