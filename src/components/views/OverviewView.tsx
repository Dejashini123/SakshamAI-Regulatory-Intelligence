import React from 'react';
import { 
  Files, 
  CheckCircle, 
  AlertOctagon, 
  Clock, 
  AlertTriangle, 
  FileWarning, 
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  History
} from 'lucide-react';
import { Application, DashboardStats, AuditEvent } from '../../types/index.ts';

interface OverviewViewProps {
  stats: DashboardStats | null;
  applications: Application[];
  recentAudits: AuditEvent[];
  onSelectApplication: (app: Application) => void;
  onNavigate: (view: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  stats,
  applications,
  recentAudits,
  onSelectApplication,
  onNavigate
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading regulatory metrics...
      </div>
    );
  }

  // High-priority applications (those with critical deficiencies or anomalies)
  const priorityQueue = applications.filter(
    (a) => a.status === 'Rectification Requested' || a.status === 'Human Review' || (a.preliminaryScore?.deficiencies || 0) > 0
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">AICTE Decision-Support Boundary Notice:</span> This system provides automated preliminary checks, cross-document discrepancy flagging, and authentication verification to support authorized reviewers. Final statutory approval or rejection decisions rest exclusively with the AICTE Regulation Bureau and Executive Committee.
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Total Applications</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {stats.totalApplications}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Academic Year 2026-2027</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Validation Completed</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono tabular-nums">
            {stats.validationCompleted}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            <span>Algorithmic checks executed</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Deficiencies Flagged</div>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono tabular-nums">
            {stats.deficienciesIdentified}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-2">
            <span>Requires rectification notice</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Potential Anomalies</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono tabular-nums">
            {stats.potentialAnomaliesFlagged}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-2">
            <span>SHA-256 duplicate / date flags</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
          <span className="text-slate-500">Pending Authority Verification</span>
          <div className="text-lg font-semibold text-slate-800 mt-1 font-mono tabular-nums">
            {stats.pendingAuthorityVerification}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
          <span className="text-slate-500">Human Review Required</span>
          <div className="text-lg font-semibold text-slate-800 mt-1 font-mono tabular-nums">
            {stats.manualReviewRequired}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
          <span className="text-slate-500">Expired Documents Detected</span>
          <div className="text-lg font-semibold text-rose-700 mt-1 font-mono tabular-nums">
            {stats.expiredDocumentsDetected}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
          <span className="text-slate-500">Avg. Processing Time</span>
          <div className="text-lg font-semibold text-teal-700 mt-1 font-mono tabular-nums">
            {stats.averageProcessingTimeHours}h
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-900 tracking-wide uppercase">
              Workflow Status Breakdown
            </h2>
            <span className="text-[11px] text-slate-400">Current Intake Batch</span>
          </div>

          <div className="space-y-3">
            {stats.statusDistribution.map((item) => {
              const total = stats.totalApplications || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.status} className="text-xs">
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span className="font-medium">{item.status}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deficiency Categories */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-900 tracking-wide uppercase">
              Deficiency Categories Identified
            </h2>
            <button 
              onClick={() => onNavigate('rules')}
              className="text-[11px] text-teal-600 hover:text-teal-700 font-medium"
            >
              View Configured Rules
            </button>
          </div>

          <div className="space-y-3">
            {stats.deficiencyCategories.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                No active deficiencies recorded in current intake.
              </div>
            ) : (
              stats.deficiencyCategories.map((item) => {
                return (
                  <div key={item.category} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-slate-800 font-medium">{item.category}</span>
                    </div>
                    <span className="font-mono tabular-nums text-rose-600 font-semibold px-2 py-0.5 bg-rose-50 rounded">
                      {item.count} flags
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* High-Priority Review Queue */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">High-Priority Review Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Applications requiring immediate officer inspection or rectification notice issuance
            </p>
          </div>
          <button 
            onClick={() => onNavigate('applications')}
            className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Application ID</th>
                <th className="px-4 py-3">Institution Name & PID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Workflow Status</th>
                <th className="px-4 py-3">Findings</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorityQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No high-priority deficiencies currently pending.
                  </td>
                </tr>
              ) : (
                priorityQueue.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                      {app.applicationId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 line-clamp-1">{app.institutionName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">PID: {app.institutionIdentifier} · {app.state}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {app.category}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        app.status === 'Rectification Requested' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums whitespace-nowrap">
                      <span className="text-rose-600 font-semibold">{app.preliminaryScore?.deficiencies || 0} Critical</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-amber-600">{app.preliminaryScore?.warnings || 0} Warning</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="px-2.5 py-1 text-xs font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Regulatory Audit Activity */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-semibold text-slate-900 tracking-wide uppercase">
              Recent Audit Log Activity
            </h2>
          </div>
          <button 
            onClick={() => onNavigate('audit')}
            className="text-[11px] text-teal-600 hover:text-teal-700 font-medium"
          >
            Full Audit Trail
          </button>
        </div>

        <div className="space-y-2">
          {recentAudits.slice(0, 4).map((event) => (
            <div key={event.id} className="text-xs p-2.5 rounded bg-slate-50 border border-slate-100 flex items-start justify-between gap-4">
              <div>
                <div className="text-slate-800 font-medium flex items-center gap-2">
                  <span>{event.action}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 font-normal">{event.actorName} ({event.actorRole})</span>
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">{event.details}</div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 shrink-0 tabular-nums">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
