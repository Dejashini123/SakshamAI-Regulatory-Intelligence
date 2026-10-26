import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  BookOpen, 
  History,
  Shield,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { ComplianceRule, ApplicationCategory, FindingSeverity, UserRole } from '../../types/index.ts';
import { createRule, toggleRule } from '../../services/api.ts';

interface ComplianceRulesViewProps {
  rules: ComplianceRule[];
  activeRole: UserRole;
  onRefresh: () => void;
}

export const ComplianceRulesView: React.FC<ComplianceRulesViewProps> = ({
  rules,
  activeRole,
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  // New Rule Form
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<ApplicationCategory | 'All Categories'>('All Categories');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRuleSeverity, setNewRuleSeverity] = useState<FindingSeverity>('major');
  const [newRuleSource, setNewRuleSource] = useState('AICTE Approval Process Handbook 2026-27, Clause 2.4');
  const [newConditionType, setNewConditionType] = useState<ComplianceRule['conditionType']>('document_presence');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'All',
    'Extension of Approval (EoA)',
    'New Programme or Course',
    'Intake Change',
    'Institution Information Change',
    'All Categories'
  ];

  const filteredRules = rules.filter(r => 
    selectedCategory === 'All' || r.category === selectedCategory || r.category === 'All Categories'
  );

  const handleToggle = async (ruleId: string) => {
    if (activeRole !== 'Administrator') {
      alert('Only Administrators possess privileges to enable or disable regulatory compliance rules.');
      return;
    }
    try {
      await toggleRule(ruleId);
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle rule', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;
    setIsSubmitting(true);
    try {
      await createRule({
        name: newRuleName,
        category: newRuleCategory,
        description: newRuleDescription,
        severity: newRuleSeverity,
        sourceReference: newRuleSource,
        conditionType: newConditionType
      });
      setIsCreatingRule(false);
      setNewRuleName('');
      setNewRuleDescription('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Regulatory Compliance Rules Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable regulatory criteria mapped to AICTE Approval Process Handbook (APH 2026-27)
          </p>
        </div>

        {activeRole === 'Administrator' && (
          <button
            onClick={() => setIsCreatingRule(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Regulatory Rule</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <span className="text-slate-500 text-xs shrink-0">Category Filter:</span>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium ${
              selectedCategory === c
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => (
          <div 
            key={rule.id} 
            className={`bg-white border rounded-lg p-5 space-y-3 transition-colors ${
              rule.isEnabled ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-70'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {rule.ruleId}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                    rule.severity === 'critical' 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {rule.severity}
                  </span>
                  {rule.isDemonstrationRule && (
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">
                      Demo Rule
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug">
                  {rule.name}
                </h3>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => handleToggle(rule.id)}
                title={rule.isEnabled ? 'Rule enabled - click to disable' : 'Rule disabled - click to enable'}
                className="text-slate-400 hover:text-slate-700 shrink-0"
              >
                {rule.isEnabled ? (
                  <ToggleRight className="w-6 h-6 text-teal-600" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-300" />
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {rule.description}
            </p>

            <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-[11px] space-y-1 font-mono">
              <div className="text-slate-500">Category: <span className="text-slate-800">{rule.category}</span></div>
              <div className="text-slate-500">Source: <span className="text-slate-800">{rule.sourceReference}</span></div>
              <div className="text-slate-500">Version: <span className="text-slate-800">{rule.version} · Effective: {rule.effectiveDate}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
      {isCreatingRule && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-lg border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-xl text-xs">
            <h3 className="text-sm font-semibold text-slate-900">Create New Compliance Rule</h3>
            
            <div className="space-y-1">
              <label className="font-medium text-slate-700">Rule Name *</label>
              <input
                type="text"
                required
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="e.g. Mandatory Electric Substation Installation NOC"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Applicable Category</label>
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-none"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Extension of Approval (EoA)">Extension of Approval (EoA)</option>
                  <option value="New Programme or Course">New Programme or Course</option>
                  <option value="Intake Change">Intake Change</option>
                  <option value="Institution Information Change">Institution Information Change</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Severity</label>
                <select
                  value={newRuleSeverity}
                  onChange={(e) => setNewRuleSeverity(e.target.value as FindingSeverity)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-none"
                >
                  <option value="critical">Critical (Deficiency)</option>
                  <option value="major">Major (Warning)</option>
                  <option value="minor">Minor (Notice)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Rule Requirement Description</label>
              <textarea
                rows={2}
                value={newRuleDescription}
                onChange={(e) => setNewRuleDescription(e.target.value)}
                placeholder="Describe requirement..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-medium text-slate-700">Source Handbook Reference</label>
              <input
                type="text"
                value={newRuleSource}
                onChange={(e) => setNewRuleSource(e.target.value)}
                placeholder="e.g. AICTE Approval Process Handbook 2026-27, Clause 3.1"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreatingRule(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-teal-600 text-white rounded font-medium hover:bg-teal-700"
              >
                {isSubmitting ? 'Creating...' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
