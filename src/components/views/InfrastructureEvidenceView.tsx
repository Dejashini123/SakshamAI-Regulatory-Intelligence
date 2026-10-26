import React, { useState } from 'react';
import { 
  Building2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Sparkles, 
  Camera, 
  Maximize2 
} from 'lucide-react';
import { InfrastructureEvidence } from '../../types/index.ts';

interface InfrastructureEvidenceViewProps {
  infrastructure: InfrastructureEvidence[];
}

export const InfrastructureEvidenceView: React.FC<InfrastructureEvidenceViewProps> = ({
  infrastructure
}) => {
  const [selectedItem, setSelectedItem] = useState<InfrastructureEvidence | null>(infrastructure[0] || null);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 leading-relaxed">
        <span className="font-semibold text-slate-900">Spatial Evidentiary Review Protocol:</span> Visual scrutiny and OCR analysis of photographs serve to flag apparent alignment with statutory norms. AI vision does not measure exact square-meter dimensions or certify structural safety. Physical verification by an on-site Expert Visiting Committee (EVC) remains mandatory for critical physical clearances.
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Infrastructure Evidentiary Scrutiny Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Photogrammetric and document review for academic buildings, barrier-free access, and fire suppression
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
            Submitted Facilities ({infrastructure.length})
          </div>

          <div className="space-y-2">
            {infrastructure.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedItem?.id === item.id 
                    ? 'border-teal-500 bg-teal-50/40 shadow-2xs' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.title}</span>
                  <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                    item.complianceState === 'Apparent Match' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.complianceState}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{item.category}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  {item.claimedSpecification}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Inspection Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {selectedItem.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedItem.title}</h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedItem.complianceState}
                </span>
              </div>

              {/* Photo Display */}
              {selectedItem.imageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-64 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    Statutory Evidence Photo
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded border border-slate-200 text-center text-xs text-slate-400">
                  No photographic asset attached for this specification.
                </div>
              )}

              {/* Specifications & OCR Observations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-700">Claimed Specification:</div>
                  <p className="text-slate-600">{selectedItem.claimedSpecification}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-700">OCR Detected Signage:</div>
                  <p className="text-slate-600 font-mono text-[11px]">
                    {selectedItem.ocrDetectedText || 'No legible textual signage identified in frame.'}
                  </p>
                </div>
              </div>

              {/* AI Visual Observations */}
              <div className="p-3 bg-teal-50/50 border border-teal-200 rounded text-xs space-y-1">
                <div className="font-semibold text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>AI Visual Observations:</span>
                </div>
                <p className="text-teal-800 leading-relaxed">
                  {selectedItem.aiVisualObservations}
                </p>
              </div>

              {/* Inspection Recommendation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                <div className="font-semibold text-slate-800">Scrutiny Committee Recommendation:</div>
                <p className="text-slate-700">{selectedItem.inspectionRecommendation}</p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Select an infrastructure evidence record from the list to view scrutiny details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
