import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  FileCheck, 
  AlertCircle,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Application, ApplicationCategory, WorkflowStatus } from '../../types/index.ts';

interface ApplicationsViewProps {
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onNewValidation: () => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onSelectApplication,
  onNewValidation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const categories = [
    'All',
    'Extension of Approval (EoA)',
    'New Programme or Course',
    'Intake Change',
    'Institution Information Change',
    'Other Approval-Related Changes'
  ];

  const statuses = [
    'All',
    'Submitted',
    'Preliminary Validation',
    'Pending Verification',
    'Human Review',
    'Rectification Requested',
    'Review Completed'
  ];

  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institutionIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportCSV = () => {
    window.location.href = '/api/reports/export/csv';
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Technical Institutions Applications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Preliminary regulatory records repository for Academic Year 2026-2027
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onNewValidation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col md:flex-row items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Institution Name, PID, Application ID, or State..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-800"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-slate-500 whitespace-nowrap">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <span className="text-slate-500 whitespace-nowrap">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Application ID</th>
                <th className="px-4 py-3">Institution Details</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Intake</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Docs</th>
                <th className="px-4 py-3">Validation Outcome</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    No applications matched your search filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const defCount = app.preliminaryScore?.deficiencies || 0;
                  const warnCount = app.preliminaryScore?.warnings || 0;

                  return (
                    <tr 
                      key={app.id} 
                      onClick={() => onSelectApplication(app)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {app.applicationId}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {app.institutionName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>PID: {app.institutionIdentifier}</span>
                          <span>·</span>
                          <span>{app.state}</span>
                          <span>·</span>
                          <span>{app.institutionType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {app.category}
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums whitespace-nowrap text-slate-700">
                        {app.approvedIntake} <span className="text-slate-400">→</span> {app.requestedIntake}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          app.status === 'Rectification Requested'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : app.status === 'Human Review'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : app.status === 'Pending Verification'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : app.status === 'Review Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {app.documents.length} files
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {defCount > 0 ? (
                          <span className="text-rose-600 font-medium font-mono text-[11px] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{defCount} Deficiency</span>
                          </span>
                        ) : warnCount > 0 ? (
                          <span className="text-amber-600 font-medium font-mono text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{warnCount} Warning</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium font-mono text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Checks Passed</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(app);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
