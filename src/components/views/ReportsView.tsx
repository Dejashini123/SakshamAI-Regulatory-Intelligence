import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Eye, 
  ExternalLink, 
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Application, DashboardStats } from '../../types/index.ts';
import { fetchReport } from '../../services/api.ts';

interface ReportsViewProps {
  applications: Application[];
  stats: DashboardStats | null;
  onSelectApplication: (app: Application) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  applications,
  stats,
  onSelectApplication
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [report, setReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async (appId: string) => {
    setSelectedAppId(appId);
    setIsLoading(true);
    try {
      const data = await fetchReport(appId);
      setReport(data);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/reports/export/csv';
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Reports & Preliminary Assessment Summaries
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official decision-support documentation and data exports for regulatory committees
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-2xs transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Download All Applications (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            Select Institution Application
          </div>
          <div className="space-y-2">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => handleGenerateReport(app.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedAppId === app.id
                    ? 'border-teal-500 bg-teal-50/40 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold text-slate-900 line-clamp-1">{app.institutionName}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {app.applicationId} · PID: {app.institutionIdentifier}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-600">{app.category}</span>
                  <span className="font-mono text-slate-700 font-semibold">{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Preview Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Generating preliminary assessment report...
            </div>
          ) : report ? (
            <div className="space-y-5">
              {/* Report Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/src/assets/images/aicte_emblem_logo_1792991510533.jpg"
                    alt="AICTE Seal"
                    className="w-12 h-12 rounded-full border border-amber-500/30 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-wide">
                      ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Regulation Bureau · Preliminary Validation Assessment
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              {/* Mandatory Legal Statement */}
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded leading-relaxed">
                <span className="font-semibold">MANDATORY STATUTORY NOTICE:</span> {report.regulatoryStatement}
              </div>

              {/* App Summary Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Report Reference:</span>
                  <div className="font-mono font-bold text-slate-800">{report.reportId}</div>
                </div>
                <div>
                  <span className="text-slate-400">Generated Timestamp:</span>
                  <div className="font-mono text-slate-800">{report.generatedAt}</div>
                </div>
                <div>
                  <span className="text-slate-400">Institution:</span>
                  <div className="font-semibold text-slate-900">{report.application.name}</div>
                </div>
                <div>
                  <span className="text-slate-400">AICTE Permanent ID:</span>
                  <div className="font-mono text-slate-800">{report.application.pid}</div>
                </div>
                <div>
                  <span className="text-slate-400">Category:</span>
                  <div className="text-slate-800">{report.application.category}</div>
                </div>
                <div>
                  <span className="text-slate-400">Academic Year:</span>
                  <div className="font-mono text-slate-800">{report.application.academicYear}</div>
                </div>
              </div>

              {/* Validation Summary */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500">Passed Checks: </span>
                  <span className="text-emerald-700 font-bold">{report.validationScore?.passedChecks || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500">Deficiencies: </span>
                  <span className="text-rose-700 font-bold">{report.validationScore?.deficiencies || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500">Warnings: </span>
                  <span className="text-amber-700 font-bold">{report.validationScore?.warnings || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500">Status: </span>
                  <span className="text-slate-900 font-bold">{report.application.status}</span>
                </div>
              </div>

              {/* Findings List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Documentary Findings Summary ({report.findings.length})
                </div>
                <div className="space-y-1.5 text-xs">
                  {report.findings.map((f: any) => (
                    <div key={f.id} className="p-2.5 bg-slate-50 rounded border border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-800">{f.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{f.explanation}</div>
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase shrink-0 ${
                        f.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        {f.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assessing Officer Signoff */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Assessing Role: {report.assessingOfficer}</span>
                <span>AICTE Regulation Bureau Decision Support</span>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Select an application on the left to generate its preliminary assessment report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
