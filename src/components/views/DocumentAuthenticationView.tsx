import React, { useState } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  Key, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  ExternalLink,
  Clock,
  History
} from 'lucide-react';
import { Application, AuthenticationAttempt } from '../../types/index.ts';
import { verifyQrCode, verifySourceApi, recordManualVerification } from '../../services/api.ts';

interface DocumentAuthenticationViewProps {
  applications: Application[];
  authentications: AuthenticationAttempt[];
  onRefresh: () => void;
}

export const DocumentAuthenticationView: React.FC<DocumentAuthenticationViewProps> = ({
  applications,
  authentications,
  onRefresh
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [authMethod, setAuthMethod] = useState<'qr' | 'source_api' | 'manual'>('qr');

  // QR state
  const [qrCodeData, setQrCodeData] = useState('AICTE-VERIFY:PID=1-10928374:APP=AICTE-2026-EOA-10928:YEAR=2026-27:HASH=a7c4e5f2');
  const [qrAuthority, setQrAuthority] = useState('AICTE Central Trust Registry (Demo Provider)');

  // API State
  const [apiGateway, setApiGateway] = useState('CIDCO / Municipal Fire Services Department');
  const [apiReference, setApiReference] = useState('CIDCO/FIRE/2025/9821');

  // Manual State
  const [manualStatus, setManualStatus] = useState('Verified by authorized source');
  const [manualComments, setManualComments] = useState('Physical original stamp paper inspected and verified with notary registry.');

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const currentApp = applications.find(a => a.id === selectedAppId);
  const targetDoc = currentApp?.documents[0];

  const handleExecuteVerification = async () => {
    if (!targetDoc) return;
    setIsProcessing(true);
    setResultMessage(null);

    try {
      if (authMethod === 'qr') {
        const res = await verifyQrCode(targetDoc.id, qrCodeData, qrAuthority);
        setResultMessage(`QR Verification Recorded: ${res.attempt.status}. ${res.attempt.responseDetails}`);
      } else if (authMethod === 'source_api') {
        const res = await verifySourceApi(targetDoc.id, apiGateway, apiReference);
        setResultMessage(`Issuing Authority Live Query: ${res.attempt.status}. ${res.attempt.responseDetails}`);
      } else {
        const res = await recordManualVerification(
          targetDoc.id, 
          'Manual Review Officer', 
          'MANUAL-PHYSICAL-VERIFY', 
          manualStatus, 
          manualComments
        );
        setResultMessage(`Manual Verification Recorded: ${res.attempt.status}.`);
      }
      onRefresh();
    } catch (err: any) {
      setResultMessage(err.message || 'Verification execution failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Document Authentication & Issuing Authority Gateway
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Authenticate technical institutions' submitted certificates against state authority APIs, QR hash registries, and digital certificates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Trigger Console */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            Execute Authentication Check
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Target Institution Application</label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-none"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.applicationId} - {app.institutionName.slice(0, 30)}...
                  </option>
                ))}
              </select>
            </div>

            {targetDoc && (
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                <div className="text-[11px] text-slate-400">Target Document for Verification:</div>
                <div className="font-semibold text-slate-900 truncate mt-0.5">{targetDoc.originalName}</div>
                <div className="text-[11px] text-slate-500 font-mono">Category: {targetDoc.docCategory}</div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Verification Method</label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
                <button
                  type="button"
                  onClick={() => setAuthMethod('qr')}
                  className={`py-1 rounded text-[11px] font-medium transition-colors ${
                    authMethod === 'qr' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('source_api')}
                  className={`py-1 rounded text-[11px] font-medium transition-colors ${
                    authMethod === 'source_api' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Source API
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('manual')}
                  className={`py-1 rounded text-[11px] font-medium transition-colors ${
                    authMethod === 'manual' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Manual Officer
                </button>
              </div>
            </div>

            {/* QR Method inputs */}
            {authMethod === 'qr' && (
              <div className="space-y-2 pt-1">
                <label className="font-medium text-slate-700">QR Code Payload String</label>
                <textarea
                  rows={3}
                  value={qrCodeData}
                  onChange={(e) => setQrCodeData(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs font-mono"
                  placeholder="Paste decoded QR payload..."
                />
                <label className="font-medium text-slate-700">Issuing Registry</label>
                <input
                  type="text"
                  value={qrAuthority}
                  onChange={(e) => setQrAuthority(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>
            )}

            {/* Source API inputs */}
            {authMethod === 'source_api' && (
              <div className="space-y-2 pt-1">
                <label className="font-medium text-slate-700">Issuing Authority Gateway</label>
                <select
                  value={apiGateway}
                  onChange={(e) => setApiGateway(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white"
                >
                  <option value="CIDCO / Municipal Fire Services Department">CIDCO / Municipal Fire Services Department</option>
                  <option value="Anna University Affiliation Verification Service">Anna University Affiliation Verification Service</option>
                  <option value="State Directorate of Technical Education">State Directorate of Technical Education</option>
                  <option value="Council of Architecture India">Council of Architecture India</option>
                </select>

                <label className="font-medium text-slate-700">Certificate Reference Number</label>
                <input
                  type="text"
                  value={apiReference}
                  onChange={(e) => setApiReference(e.target.value)}
                  placeholder="e.g. CIDCO/FIRE/2025/9821 or expired test"
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                />
                <div className="text-[11px] text-slate-400">
                  Tip: Include 'expired' or 'mismatch' in ref to test negative verification outcomes.
                </div>
              </div>
            )}

            {/* Manual Officer inputs */}
            {authMethod === 'manual' && (
              <div className="space-y-2 pt-1">
                <label className="font-medium text-slate-700">Verification Outcome</label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white"
                >
                  <option value="Verified by authorized source">Verified by authorized source</option>
                  <option value="Mismatch detected">Mismatch detected</option>
                  <option value="Expired">Expired</option>
                  <option value="Manual review required">Manual review required</option>
                </select>

                <label className="font-medium text-slate-700">Officer Verification Comments</label>
                <textarea
                  rows={3}
                  value={manualComments}
                  onChange={(e) => setManualComments(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs"
                />
              </div>
            )}

            <button
              onClick={handleExecuteVerification}
              disabled={isProcessing}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isProcessing ? 'Verifying...' : 'Execute Verification'}</span>
            </button>

            {resultMessage && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 space-y-1">
                <span className="font-semibold text-teal-800">Outcome:</span>
                <p>{resultMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Authentication Attempts Log */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                Authentication Records & Authority Query Log
              </h3>
              <p className="text-xs text-slate-500">
                Immutable record of all QR scans, API responses, and digital signature verifications
              </p>
            </div>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              {authentications.length} records
            </span>
          </div>

          <div className="space-y-3">
            {authentications.map((auth) => {
              const isSuccess = auth.status === 'Verified by authorized source';
              const isMismatch = auth.status === 'Mismatch detected';
              const isExpired = auth.status === 'Expired';

              return (
                <div 
                  key={auth.id} 
                  className={`p-4 rounded-lg border text-xs space-y-2 transition-colors ${
                    isSuccess 
                      ? 'bg-emerald-50/30 border-emerald-200' 
                      : isMismatch || isExpired 
                      ? 'bg-rose-50/30 border-rose-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isMismatch || isExpired ? (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-900">{auth.authorityName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-600 uppercase text-[11px]">{auth.type.replace('_', ' ')}</span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {new Date(auth.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Reference:</span>
                    <span className="font-mono font-medium text-slate-800">{auth.referenceNumber}</span>
                    <span className="text-slate-300">|</span>
                    <span className={`font-semibold ${
                      isSuccess ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {auth.status}
                    </span>
                  </div>

                  {auth.responseDetails && (
                    <div className="p-2 bg-white rounded border border-slate-200/80 text-[11px] text-slate-700 font-mono">
                      {auth.responseDetails}
                    </div>
                  )}

                  {auth.endpointUrl && (
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      Endpoint: {auth.endpointUrl}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
