import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  FileCode, 
  Trash2, 
  Edit3, 
  Save, 
  Sparkles,
  Info
} from 'lucide-react';
import { Application, ApplicationCategory, DocumentRecord, ExtractedField } from '../../types/index.ts';
import { createApplication, uploadDocuments, runValidation, updateDocumentFields } from '../../services/api.ts';

interface NewValidationViewProps {
  onValidationComplete: (app: Application) => void;
  onCancel: () => void;
}

export const NewValidationView: React.FC<NewValidationViewProps> = ({
  onValidationComplete,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [institutionName, setInstitutionName] = useState('Bharati Vidyapeeth College of Engineering');
  const [institutionIdentifier, setInstitutionIdentifier] = useState('1-50291823');
  const [category, setCategory] = useState<ApplicationCategory>('Extension of Approval (EoA)');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [institutionType, setInstitutionType] = useState<Application['institutionType']>('Engineering & Technology');
  const [state, setState] = useState('Maharashtra');
  const [approvedIntake, setApprovedIntake] = useState(360);
  const [requestedIntake, setRequestedIntake] = useState(360);

  // Upload & Document State
  const [createdApp, setCreatedApp] = useState<Application | null>(null);
  const [selectedDocCategory, setSelectedDocCategory] = useState<DocumentRecord['docCategory']>('Affidavit / Undertaking');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<DocumentRecord[]>([]);

  // Field Correction State
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<ExtractedField[]>([]);

  // Validation Running State
  const [isValidating, setIsValidating] = useState(false);

  // Category Checklist definition (Demonstration Rules APH 2026-27)
  const categoryChecklists: Record<ApplicationCategory, { required: string[]; notes: string }> = {
    'Extension of Approval (EoA)': {
      required: [
        'Affidavit-1 on Non-Judicial Stamp Paper (Rs 100)',
        'Fire & Life Safety NOC / Renewal Certificate',
        'Registered Land Deed / Valid Lease Agreement',
        'University Affiliation Approval Order 2026-27'
      ],
      notes: 'Standard annual EoA verification under AICTE APH 2026-27 Chapter II.'
    },
    'New Programme or Course': {
      required: [
        'Detailed Project Report (DPR)',
        'State Government NOC for New Programme',
        'Curricular Syllabus & Affiliating University NOC',
        'Additional Built-up Space Architectural Plan',
        'Faculty Recruitment Undertaking'
      ],
      notes: 'New technical disciplines require university syndicate resolution and state clearance.'
    },
    'Intake Change': {
      required: [
        'Cadre-wise Faculty Roster (1:20 Ratio)',
        'Laboratory Equipment & Computer Stock Register',
        'NBA Accreditation Certificate (for >240 intake increments)',
        'University NOC for Division Expansion'
      ],
      notes: 'Cadre ratio and laboratory workstation capacity must support expanded intake.'
    },
    'Institution Information Change': {
      required: [
        'Society / Trust Resolution for Name/Site Change',
        'State Government Gazette Corrigendum',
        'Sub-Registrar Land Title Transfer Deed',
        'Joint Undertaking Affidavit'
      ],
      notes: 'All changes in institutional name or site require tripartite authority alignment.'
    },
    'Other Approval-Related Changes': {
      required: [
        'Executive Council AICTE Approval Petition',
        'Statutory Fee Payment Receipt',
        'Supporting Regulatory Evidence'
      ],
      notes: 'Ad-hoc changes assessed against specific governing regulations.'
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim()) return;

    try {
      const app = await createApplication({
        institutionName,
        institutionIdentifier,
        category,
        academicYear,
        institutionType,
        state,
        approvedIntake: Number(approvedIntake),
        requestedIntake: Number(requestedIntake),
        programmesList: [
          'B.Tech Computer Science (120)',
          'B.Tech Mechanical Engineering (60)',
          'B.Tech Electronics & Telecomm (120)',
          'B.Tech Civil Engineering (60)'
        ]
      });
      setCreatedApp(app);
      setStep(2);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to initialize intake application.');
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUploadSubmit = async () => {
    if (!createdApp || uploadFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadDocuments(createdApp.id, selectedDocCategory, uploadFiles);
      setUploadedDocs((prev) => [...prev, ...res.documents]);
      setUploadFiles([]);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Quick Seed Sample Test Document for rapid user testing!
  const handleQuickSeedSampleDoc = async () => {
    if (!createdApp) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      // Create a virtual synthetic text/PDF file representing an AICTE affidavit
      const sampleContent = `%PDF-1.4\nAICTE STATUTORY AFFIDAVIT - 2026-27\nInstitution: ${createdApp.institutionName}\nPID: ${createdApp.institutionIdentifier}\nAcademic Year: 2026-2027\nState: ${createdApp.state}\nExpiry Date: 2027-06-30\nCertificate No: AICTE/AFF/2026/8912\nSolemnly affirmed by authorized trust secretary.`;
      const blob = new Blob([sampleContent], { type: 'application/pdf' });
      const sampleFile = new File([blob], `Affidavit_${createdApp.institutionIdentifier}_2026.pdf`, { type: 'application/pdf' });

      const res = await uploadDocuments(createdApp.id, 'Affidavit / Undertaking', [sampleFile]);
      setUploadedDocs((prev) => [...prev, ...res.documents]);
    } catch (err: any) {
      setUploadError(err.message || 'Sample generation failed');
    } finally {
      setIsUploading(false);
    }
  };

  const startFieldEditing = (doc: DocumentRecord) => {
    setEditingDocId(doc.id);
    setEditingFields([...doc.extractedFields]);
  };

  const saveFieldEditing = async (docId: string) => {
    try {
      await updateDocumentFields(docId, editingFields);
      setUploadedDocs((prev) => 
        prev.map(d => d.id === docId ? { ...d, extractedFields: editingFields } : d)
      );
      setEditingDocId(null);
    } catch (err) {
      console.error('Failed to save field corrections', err);
    }
  };

  const handleExecuteValidation = async () => {
    if (!createdApp) return;
    setIsValidating(true);
    try {
      const res = await runValidation(createdApp.id);
      onValidationComplete(res.application);
    } catch (err: any) {
      setUploadError(err.message || 'Validation execution failed');
      setIsValidating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Steps */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-medium ${
            step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
          }`}>1</span>
          <span className={`font-medium ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
            Intake & Category Setup
          </span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-medium ${
            step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
          }`}>2</span>
          <span className={`font-medium ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
            Document Upload & Extraction
          </span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-medium ${
            step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
          }`}>3</span>
          <span className={`font-medium ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
            Run Preliminary Validation
          </span>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* STEP 1: Application Intake Form */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Step 1: Institutional Information & Approval Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify the institution particulars as recorded in the AICTE Web Portal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Institution Legal Name *</label>
              <input
                type="text"
                required
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. Bharati Vidyapeeth College of Engineering"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Permanent Institute ID (PID) *</label>
              <input
                type="text"
                required
                value={institutionIdentifier}
                onChange={(e) => setInstitutionIdentifier(e.target.value)}
                placeholder="e.g. 1-50291823"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Application Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ApplicationCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                <option value="New Programme or Course">New Programme or Course</option>
                <option value="Intake Change">Intake Change</option>
                <option value="Institution Information Change">Institution Information Change</option>
                <option value="Other Approval-Related Changes">Other Approval-Related Changes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Academic Year</label>
              <input
                type="text"
                readOnly
                value={academicYear}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-slate-50 text-slate-600 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Institution Type</label>
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Engineering & Technology">Engineering & Technology</option>
                <option value="Polytechnic Diploma">Polytechnic Diploma</option>
                <option value="Management (MBA/PGDM)">Management (MBA/PGDM)</option>
                <option value="MCA">MCA</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Architecture">Architecture</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">State / Union Territory</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Approved Intake (Current)</label>
              <input
                type="number"
                value={approvedIntake}
                onChange={(e) => setApprovedIntake(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Requested Intake (Proposed)</label>
              <input
                type="number"
                value={requestedIntake}
                onChange={(e) => setRequestedIntake(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs font-mono focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Category Checklist Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-800 font-semibold">
              <span>Required Checklist for: {category}</span>
              <span className="text-[11px] text-teal-700">Demonstration Rule Engine</span>
            </div>
            <p className="text-slate-500 text-[11px]">{categoryChecklists[category].notes}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
              {categoryChecklists[category].required.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-2xs"
            >
              <span>Save & Proceed to Document Upload</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Document Upload & Field Extraction */}
      {step === 2 && createdApp && (
        <div className="space-y-5">
          {/* Header Summary */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-semibold text-slate-900">{createdApp.institutionName}</div>
              <div className="text-slate-500 font-mono mt-0.5">
                Application: {createdApp.applicationId} · PID: {createdApp.institutionIdentifier} · {createdApp.category}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickSeedSampleDoc}
                disabled={isUploading}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
                title="Generates a synthetic PDF document in memory and uploads it for test verification"
              >
                + Quick Sample Document
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Upload Statutory Documents (PDF / PNG / JPEG)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Every uploaded file is hashed with SHA-256 for cryptographic integrity and checked for duplicates.
                </p>
              </div>

              {/* Document Category Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Document Type:</span>
                <select
                  value={selectedDocCategory}
                  onChange={(e) => setSelectedDocCategory(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white text-slate-800 focus:outline-none"
                >
                  <option value="Affidavit / Undertaking">Affidavit / Undertaking</option>
                  <option value="Fire Safety Certificate">Fire Safety Certificate</option>
                  <option value="Land & Building Ownership Document">Land & Building Ownership Document</option>
                  <option value="University Affiliation Letter">University Affiliation Letter</option>
                  <option value="Building Plan & Occupancy Certificate">Building Plan & Occupancy Certificate</option>
                  <option value="Accreditation Certificate (NBA/NAAC)">Accreditation Certificate (NBA/NAAC)</option>
                  <option value="Other Supporting Document">Other Supporting Document</option>
                </select>
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <input
                id="file-upload-input"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-800">
                Drag and drop files here, or <span className="text-teal-600 underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PDF, PNG, JPG (up to 25 MB per file)
              </p>
            </div>

            {/* Selected files staging */}
            {uploadFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-medium text-slate-700">Files Ready for Upload:</div>
                <div className="space-y-1">
                  {uploadFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{f.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          ({Math.round(f.size / 1024)} KB)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{selectedDocCategory}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    {isUploading ? 'Uploading & Extracting...' : 'Upload & Extract Text'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Uploaded Documents & Field Extraction Review */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Uploaded Document Records ({uploadedDocs.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Review extracted institutional identifiers, validity dates, and SHA-256 integrity hashes.
                </p>
              </div>
            </div>

            {uploadedDocs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-slate-100 rounded bg-slate-50">
                No documents uploaded yet. Upload required statutory files or use "+ Quick Sample Document" to test.
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="font-semibold text-slate-900 text-xs">{doc.originalName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-600">{doc.docCategory}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                        <span title={doc.sha256Hash}>SHA256: {doc.sha256Hash.slice(0, 16)}...</span>
                        {doc.isDuplicateOfHash && (
                          <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-sans font-medium">
                            Duplicate Detected!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Extracted Fields Editor */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">Extracted Fields:</span>
                        {editingDocId === doc.id ? (
                          <button
                            onClick={() => saveFieldEditing(doc.id)}
                            className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save Corrections</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => startFieldEditing(doc)}
                            className="text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Correct Extracted Fields</span>
                          </button>
                        )}
                      </div>

                      {editingDocId === doc.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {editingFields.map((field, fIdx) => (
                            <div key={fIdx} className="space-y-1 p-2 bg-slate-50 rounded border border-slate-200">
                              <span className="text-slate-500 text-[11px]">{field.label}</span>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => {
                                  const updated = [...editingFields];
                                  updated[fIdx].value = e.target.value;
                                  setEditingFields(updated);
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                          {doc.extractedFields.map((field, fIdx) => (
                            <div key={fIdx} className="p-2 bg-slate-50 rounded border border-slate-100">
                              <div className="text-[11px] text-slate-400">{field.label}</div>
                              <div className="font-mono text-slate-800 font-medium truncate mt-0.5" title={field.value}>
                                {field.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 1</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={uploadedDocs.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 rounded shadow-2xs"
              >
                <span>Proceed to Preliminary Validation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Execute Validation */}
      {step === 3 && createdApp && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Step 3: Run AI & Regulatory Rule Validation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Execute deterministic compliance checks, cross-document comparison, and Gemini AI analysis
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Application Summary:</span>
              <span className="font-mono text-slate-500">{createdApp.applicationId}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>Institution: <span className="font-medium text-slate-900">{createdApp.institutionName}</span></div>
              <div>Permanent ID: <span className="font-mono text-slate-900">{createdApp.institutionIdentifier}</span></div>
              <div>Category: <span className="font-medium text-slate-900">{createdApp.category}</span></div>
              <div>Uploaded Documents: <span className="font-mono text-slate-900">{uploadedDocs.length} files</span></div>
            </div>
          </div>

          <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-lg text-xs text-teal-900 space-y-2">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Automated Verification Pipeline Overview:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-teal-800/90 pl-1">
              <li>Deterministic checklist completeness verification (APH 2026-27 norms)</li>
              <li>Expiry date checking against Academic Year 2026-2027</li>
              <li>Cross-document consistency engine matching PID and Institution Legal Name</li>
              <li>Exact SHA-256 cryptographic duplicate detection across all applications</li>
              <li>Gemini 3.8 Flash AI document understanding and contextual anomaly flagging</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Uploads</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteValidation}
              disabled={isValidating}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isValidating ? 'Executing Validation Pipeline...' : 'Start Preliminary Validation'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
