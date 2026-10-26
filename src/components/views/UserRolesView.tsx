import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  Check, 
  X, 
  UserCheck, 
  Lock, 
  Key 
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface UserRolesViewProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const UserRolesView: React.FC<UserRolesViewProps> = ({
  activeRole,
  onRoleChange
}) => {
  const roles: { role: UserRole; title: string; description: string; userCount: number }[] = [
    {
      role: 'Administrator',
      title: 'Prof. Anil Sahasrabudhe (Admin)',
      description: 'Full administrative control over regulatory compliance rules, user access, and system configurations.',
      userCount: 2
    },
    {
      role: 'Regulatory Reviewer',
      title: 'Rajesh Varma (Reviewing Officer)',
      description: 'Authority to execute preliminary validation runs, review evidence, confirm or dismiss deficiencies with reasons, and issue rectification notices.',
      userCount: 5
    },
    {
      role: 'Verification Officer',
      title: 'Dr. Sunita Deshmukh (Verification Officer)',
      description: 'Authorized to execute QR code cryptographic checks, query state issuing authority APIs, and record manual inspection results.',
      userCount: 8
    },
    {
      role: 'Read-Only Auditor',
      title: 'Shri R. K. Mittal (Senior Vigilance Auditor)',
      description: 'Read-only access to application repositories, validation outcome summaries, and the append-only audit trail.',
      userCount: 3
    }
  ];

  const permissionsMatrix = [
    { capability: 'View Applications & Extracted Fields', admin: true, reviewer: true, officer: true, auditor: true },
    { capability: 'Initiate New Intake Application & Document Upload', admin: true, reviewer: true, officer: false, auditor: false },
    { capability: 'Execute Algorithmic Rule Engine & Gemini AI', admin: true, reviewer: true, officer: false, auditor: false },
    { capability: 'Confirm or Dismiss Deficiencies (With Reason)', admin: true, reviewer: true, officer: false, auditor: false },
    { capability: 'Perform QR & Issuing Authority API Verification', admin: true, reviewer: false, officer: true, auditor: false },
    { capability: 'Transition Workflow Stage (e.g. Rectification Requested)', admin: true, reviewer: true, officer: false, auditor: false },
    { capability: 'Create, Edit, and Toggle Compliance Rules', admin: true, reviewer: false, officer: false, auditor: false },
    { capability: 'Inspect Append-Only Audit Trail & Export Logs', admin: true, reviewer: true, officer: true, auditor: true },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Role-Based Access Control (RBAC) & Authority Matrix
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Governs permissions across Regulatory Reviewers, Verification Officers, Administrators, and Vigilance Auditors
        </p>
      </div>

      {/* Role Cards & Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => {
          const isActive = activeRole === r.role;
          return (
            <div
              key={r.role}
              className={`p-5 rounded-lg border text-xs space-y-3 transition-colors ${
                isActive 
                  ? 'border-teal-500 bg-teal-50/30 shadow-2xs' 
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {r.role}
                </span>
                {isActive && (
                  <span className="text-[11px] font-medium text-teal-700 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Active Session</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-xs">{r.title}</h3>
                <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">{r.userCount} Active Officers</span>
                {!isActive && (
                  <button
                    onClick={() => onRoleChange(r.role)}
                    className="px-2.5 py-1 text-[11px] font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded border border-teal-200 transition-colors"
                  >
                    Switch to Role
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
          Functional Access Control Matrix
        </h3>

        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-4 py-3">Regulatory Capability / Operation</th>
                <th className="px-4 py-3 text-center">Administrator</th>
                <th className="px-4 py-3 text-center">Regulatory Reviewer</th>
                <th className="px-4 py-3 text-center">Verification Officer</th>
                <th className="px-4 py-3 text-center">Read-Only Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-800 font-medium">{item.capability}</td>
                  <td className="px-4 py-3 text-center">
                    {item.admin ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.reviewer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.officer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.auditor ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
