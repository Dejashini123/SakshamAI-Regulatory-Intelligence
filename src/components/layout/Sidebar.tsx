import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  FileCheck2, 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  Building2, 
  FileText, 
  History, 
  Users, 
  Settings2,
  ExternalLink
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  activeRole: UserRole;
  pendingAnomaliesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  activeRole,
  pendingAnomaliesCount
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: Files },
    { id: 'new-validation', label: 'New Validation', icon: FileCheck2 },
    { id: 'doc-auth', label: 'Document Authentication', icon: ShieldCheck },
    { id: 'rules', label: 'Compliance Rules', icon: Scale },
    { 
      id: 'anomalies', 
      label: 'Anomaly Review', 
      icon: AlertTriangle,
      badge: pendingAnomaliesCount > 0 ? pendingAnomaliesCount : undefined
    },
    { id: 'infrastructure', label: 'Infrastructure Evidence', icon: Building2 },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'users', label: 'User & Role Management', icon: Users },
    { id: 'settings', label: 'Settings & Scenarios', icon: Settings2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <img 
          src="/src/assets/images/aicte_emblem_logo_1792991510533.jpg" 
          alt="AICTE Logo" 
          className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
          referrerPolicy="no-referrer"
        />
        <div className="overflow-hidden">
          <div className="text-sm font-semibold text-white tracking-wide truncate">
            AICTE SAKSHAM
          </div>
          <div className="text-xs text-slate-400 truncate">
            Regulation Bureau Portal
          </div>
        </div>
      </div>

      {/* Role Pill Banner */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400">Active Role:</span>
        <span className="font-medium text-teal-400 truncate max-w-[120px]">{activeRole}</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-amber-500 text-slate-950 rounded-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Legal & Regulatory System Notice */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 leading-tight">
        <div className="text-slate-300 font-medium mb-1 flex items-center gap-1">
          <span>SIH PS ID: 26261</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </div>
        <p className="text-slate-500">
          Decision-support prototype. Non-statutory preliminary validation.
        </p>
      </div>
    </aside>
  );
};
