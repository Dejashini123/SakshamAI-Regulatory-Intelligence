import React, { useState } from 'react';
import { 
  Settings2, 
  Sparkles, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  Info,
  Server,
  Layers,
  Code2
} from 'lucide-react';
import { Application } from '../../types/index.ts';
import { resetDemoDatabase } from '../../services/api.ts';

interface SettingsViewProps {
  geminiActive: boolean;
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onResetComplete: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  geminiActive,
  applications,
  onSelectApplication,
  onResetComplete
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const testScenarios = [
    {
      id: 1,
      title: 'Scenario 1: Complete Valid Application (No Violations)',
      appId: 'AICTE-2026-EOA-10928',
      desc: 'All mandatory statutory documents uploaded, dates valid through AY 2026-27, PIDs match exactly across records.',
      status: 'Preliminary Validation Passed'
    },
    {
      id: 2,
      title: 'Scenario 2: Missing Mandatory Document (Fire NOC Omitted)',
      appId: 'AICTE-2026-EOA-49201',
      desc: 'Applicant omitted mandatory Municipal Fire Safety NOC. Rule engine triggers Critical Deficiency and status changes to Rectification Requested.',
      status: 'Rectification Requested'
    },
    {
      id: 3,
      title: 'Scenario 3: Expired Document (Tenancy Terminated 2025)',
      appId: 'AICTE-2026-EOA-77281',
      desc: 'Uploaded registered land lease deed expired on 31-Dec-2025 prior to academic session start.',
      status: 'Human Review Required'
    },
    {
      id: 4,
      title: 'Scenario 4: Conflicting Institution Identifier & Name',
      appId: 'AICTE-2026-INTAKE-38291',
      desc: 'Affidavit lists PID 1-38291044 while University affiliation letter lists PID 1-38291099. Cross-document consistency engine flags major discrepancy.',
      status: 'Pending Verification'
    },
    {
      id: 5,
      title: 'Scenario 5: Exact Cryptographic Duplicate File (SHA-256 Collision)',
      appId: 'AICTE-2026-EOA-89301',
      desc: 'Uploaded building occupancy certificate is an exact binary byte-for-byte SHA-256 match with an affidavit from another institution record.',
      status: 'Vigilance Anomaly'
    },
    {
      id: 6,
      title: 'Scenario 6: Invalid / Corrupted Document Upload Test',
      appId: 'AICTE-2026-EOA-10928',
      desc: 'MIME-type enforcement and binary header parser detect unreadable or non-conforming file payloads with clear error messaging.',
      status: 'Validated at Ingestion'
    },
    {
      id: 7,
      title: 'Scenario 7: QR Code with No Authorized Endpoint',
      appId: 'AICTE-2026-EOA-89301',
      desc: 'Decodes QR string but flags status as "Not verifiable with current integrations" due to missing trusted root certificate.',
      status: 'Authentication Sandbox'
    },
    {
      id: 8,
      title: 'Scenario 8: External Authority Verification Source Unavailable',
      appId: 'AICTE-2026-INTAKE-38291',
      desc: 'Issuing authority mock gateway handles timeout or offline endpoint gracefully with "Source unavailable" status.',
      status: 'Graceful Fallback'
    },
    {
      id: 9,
      title: 'Scenario 9: AI API Unavailable / Key Transparency',
      appId: 'AICTE-2026-EOA-10928',
      desc: 'When Gemini API is unreachable or key is absent, system reports AI availability clearly and executes deterministic checks without silent fabrication.',
      status: 'Transparent Failover'
    },
    {
      id: 10,
      title: 'Scenario 10: Potential Anomaly Requiring Human Review',
      appId: 'AICTE-2026-EOA-77281',
      desc: 'Explainable finding links evidence snippet to source document, requiring reviewer justification to dismiss or confirm.',
      status: 'Audit Logged'
    }
  ];

  const handleReset = async () => {
    setIsResetting(true);
    setResetMessage(null);
    try {
      await resetDemoDatabase();
      setResetMessage('Demonstration database reset to default state with 5 synthetic institutions.');
      onResetComplete();
    } catch (err: any) {
      setResetMessage(err.message || 'Failed to reset database.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleLaunchScenario = (appId: string) => {
    const target = applications.find(a => a.applicationId === appId);
    if (target) {
      onSelectApplication(target);
    } else {
      alert(`Application ${appId} not found in repository. Try resetting demonstration data.`);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-base font-semibold text-slate-900">
          System Configuration & SIH Demonstration Scenarios
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          AICTE Regulation Bureau Smart Automation Test Suite (SIH Problem Statement ID 26261)
        </p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Google Gemini AI Engine</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-slate-600">Model: <span className="font-mono text-slate-900">gemini-3.8-flash</span></div>
          <div className="text-slate-600">
            Status: {geminiActive ? (
              <span className="text-emerald-700 font-semibold font-mono">CONNECTED & ACTIVE</span>
            ) : (
              <span className="text-slate-500 font-mono">DETERMINISTIC FALLBACK (No API Key)</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Server-side execution with prompt-injection defense and JSON schema verification.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Cryptographic Hasher</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-slate-600">Algorithm: <span className="font-mono text-slate-900">SHA-256 (FIPS 180-4)</span></div>
          <div className="text-slate-600">Duplicate Engine: <span className="text-emerald-700 font-semibold font-mono">ACTIVE</span></div>
          <p className="text-[11px] text-slate-400">
            Every document is hashed during stream ingestion to prevent recycling across applicant trusts.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Demonstration Store</span>
            <Database className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-slate-600">Academic Year: <span className="font-mono text-slate-900">2026-2027</span></div>
          <div className="text-slate-600">Database Engine: <span className="font-mono text-slate-900">Persistent JSON/SQLite Store</span></div>
          <div className="pt-1">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo Database'}</span>
            </button>
          </div>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 text-xs rounded-md">
          {resetMessage}
        </div>
      )}

      {/* 10 Test Scenarios Suite */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            Interactive Test Scenarios Suite (10 Standard Test Cases)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any scenario to immediately load the corresponding synthetic technical institution and inspect the validation outcome.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testScenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-4 rounded-lg border border-slate-200 hover:border-teal-500 bg-slate-50/50 hover:bg-white text-xs space-y-2 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{sc.title}</span>
                  <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {sc.status}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {sc.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-mono text-[11px] text-slate-400">Target App: {sc.appId}</span>
                <button
                  onClick={() => handleLaunchScenario(sc.appId)}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-white hover:bg-teal-600 border border-teal-200 rounded transition-colors inline-flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Inspect Scenario</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
