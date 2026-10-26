import React from 'react';
import { Sparkles, Shield, UserCheck, Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface HeaderProps {
  currentView: string;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNewValidation: () => void;
  onResetDemo: () => void;
  geminiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeRole,
  onRoleChange,
  onNewValidation,
  onResetDemo,
  geminiActive
}) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'overview': return 'Executive Overview & Application Monitoring';
      case 'applications': return 'Technical Institution Applications Repository';
      case 'new-validation': return 'New Application Intake & Validation Wizard';
      case 'doc-auth': return 'Document Authentication & Issuing Source Verification';
      case 'rules': return 'Regulatory Compliance Rules Engine (APH 2026-27)';
      case 'anomalies': return 'Potential Alteration & SHA-256 Duplicate Detector';
      case 'infrastructure': return 'Campus Infrastructure Evidence & Visual Review';
      case 'reports': return 'Preliminary Assessment Reports & Summary Exports';
      case 'audit': return 'Immutable Audit Trail & Regulatory Event Log';
      case 'users': return 'Role-Based Access Control & Permissions Matrix';
      case 'settings': return 'System Settings & Demonstration Scenarios';
      default: return 'AICTE SAKSHAM';
    }
  };

  const roles: UserRole[] = [
    'Administrator',
    'Regulatory Reviewer',
    'Verification Officer',
    'Read-Only Auditor'
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 shrink-0 z-10">
      {/* Zone 1: Breadcrumb & View Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap shrink-0">
          <span className="font-semibold text-slate-700">AICTE</span>
          <span>/</span>
          <span>Regulation Bureau</span>
          <span>/</span>
        </div>
        <h1 className="text-sm font-semibold text-slate-900 truncate">
          {getViewTitle()}
        </h1>
      </div>

      {/* Zone 2: Status & Demonstration Indicators */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        {/* Gemini Status */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 whitespace-nowrap"
          title={geminiActive ? 'Gemini 3.8 Flash model active on server' : 'Running deterministic checks; Gemini key pending'}
        >
          {geminiActive ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Gemini AI Connected</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rule Engine Active</span>
            </>
          )}
        </div>

        {/* Demo Watermark */}
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] whitespace-nowrap">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>Demo Data Mode</span>
        </div>
      </div>

      {/* Zone 3: Actions & Role Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          title="Reset demonstration database to default seed state"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Primary CTA */}
        <button
          onClick={onNewValidation}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Validation</span>
        </button>
      </div>
    </header>
  );
};
