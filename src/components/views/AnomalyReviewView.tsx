import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Copy, 
  Check, 
  Calendar, 
  Hash, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { AnomalyAlert, UserRole, Application } from '../../types/index.ts';
import { updateAnomalyStatus } from '../../services/api.ts';

interface AnomalyReviewViewProps {
  anomalies: AnomalyAlert[];
  applications: Application[];
  activeRole: UserRole;
  onRefresh: () => void;
  onSelectApplication: (app: Application) => void;
}

export const AnomalyReviewView: React.FC<AnomalyReviewViewProps> = ({
  anomalies,
  applications,
  activeRole,
  onRefresh,
  onSelectApplication
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAnomalies = anomalies.filter(a => 
    filterStatus === 'all' || a.status === filterStatus
  );

  const handleUpdateStatus = async (id: string, status: 'acknowledged' | 'dismissed') => {
    try {
      await updateAnomalyStatus(id, status);
      onRefresh();
    } catch (err) {
      console.error('Failed to update anomaly status', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Vigilance & Anomaly Detection Protocol:</span> These algorithmic alerts identify cryptographic collisions (exact SHA-256 matches), conflicting identifiers, or date sequencing anomalies. An alert signifies a <strong>potential anomaly requiring human verification</strong>. It does NOT automatically declare fraud or forgery without competent officer scrutiny.
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Potential Alteration & SHA-256 Duplicate Detector
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-institution cryptographic integrity and document recycling checks
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Anomalies</option>
            <option value="pending_review">Pending Review</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnomalies.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-400">
            No active anomalies matching the selected filter.
          </div>
        ) : (
          filteredAnomalies.map((alert) => {
            const targetApp = applications.find(a => a.id === alert.applicationId);

            return (
              <div 
                key={alert.id}
                className={`bg-white border rounded-lg p-5 space-y-3.5 transition-colors ${
                  alert.severity === 'critical' ? 'border-rose-300' : 'border-amber-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${
                      alert.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                    }`} />
                    <h3 className="text-xs font-bold text-slate-900">{alert.title}</h3>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] font-mono uppercase font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                      {alert.detectionMethod.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                      alert.status === 'pending_review'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : alert.status === 'acknowledged'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 line-through'
                    }`}>
                      {alert.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-800">Reason for Alert:</div>
                  <p>{alert.reason}</p>
                </div>

                {/* Evidence snippet */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800">
                  <span className="text-slate-400 font-sans text-[11px]">Evidence Reference: </span>
                  {alert.evidence}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3 rounded border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700">Detection Limitations:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{alert.limitations}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Suggested Next Action:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">{alert.suggestedNextStep}</p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
                  {targetApp && (
                    <button
                      onClick={() => onSelectApplication(targetApp)}
                      className="text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Application: {targetApp.applicationId} ({targetApp.institutionName.slice(0, 30)}...)</span>
                    </button>
                  )}

                  {activeRole !== 'Read-Only Auditor' && alert.status === 'pending_review' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                        className="px-3 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                      >
                        Acknowledge & Flag for Vigilance
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(alert.id, 'dismissed')}
                        className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                      >
                        Dismiss as False Positive
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
