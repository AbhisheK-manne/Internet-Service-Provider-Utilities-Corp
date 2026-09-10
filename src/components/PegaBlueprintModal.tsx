import React from 'react';
import { 
  X, 
  Workflow, 
  Users, 
  Database, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Building,
  FileText
} from 'lucide-react';
import { BLUEPRINT_META, PERSONAS, WORKFLOWS, INITIAL_DATA_OBJECTS } from '../data/pegaBlueprintData';

interface PegaBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PegaBlueprintModal: React.FC<PegaBlueprintModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Pega Blueprint Architecture Specification
                </h3>
                <span className="font-mono text-xs text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  {BLUEPRINT_META.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Application Overview • {BLUEPRINT_META.organization} ({BLUEPRINT_META.industry})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          
          {/* Blueprint Context summary */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5 space-y-2.5">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
              Application Context
            </span>
            <p className="leading-relaxed text-slate-300">
              The Customer Service application for Utilities within the Energy &amp; Utilities industry provides a reliable platform for managing service inquiries, outage reports, billing issues, and customer feedback. Cases flow through stages like <strong>Initial Categorization, Priority Assessment, Expert Assignment, Resolution Delivery,</strong> and <strong>Satisfaction Verification</strong> with SLAs reflecting industry standards and service urgency.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <div>Organization: <strong className="text-white block">{BLUEPRINT_META.organization}</strong></div>
              <div>Industry: <strong className="text-white block">{BLUEPRINT_META.industry}</strong></div>
              <div>Industry Subsegment: <strong className="text-white block">{BLUEPRINT_META.industrySubsegment}</strong></div>
              <div>Language: <strong className="text-white block">{BLUEPRINT_META.language}</strong></div>
            </div>
          </div>

          {/* 3 Core Architecture Pillars: 6 Personas, 16 Workflows, 10 Data Objects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 6 Personas */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Users className="w-4 h-4 text-blue-400" />
                  6 Personas &amp; Channels
                </span>
                <span className="font-mono text-xs text-blue-400 font-bold">6</span>
              </div>
              <ul className="space-y-2">
                {PERSONAS.map(p => (
                  <li key={p.id} className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                    <div className="font-semibold text-slate-200">{p.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{p.channel.split('(')[0]}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 16 Workflows */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Workflow className="w-4 h-4 text-emerald-400" />
                  16 Workflows
                </span>
                <span className="font-mono text-xs text-emerald-400 font-bold">16</span>
              </div>
              <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                {WORKFLOWS.map((w, idx) => (
                  <div key={w.id} className="p-1.5 rounded bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-300 font-medium truncate max-w-[190px]">
                      {idx + 1}. {w.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {w.defaultPriority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 10 Data Objects */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Database className="w-4 h-4 text-indigo-400" />
                  10 Data Objects
                </span>
                <span className="font-mono text-xs text-indigo-400 font-bold">10</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  'Contact',
                  'Consumer Account',
                  'Business Account',
                  'Service Account',
                  'Asset',
                  'Location',
                  'Transaction',
                  'Statement',
                  'Appointment',
                  'Product'
                ].map((obj, i) => (
                  <li key={i} className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{obj}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">Pega(Local)</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Legal / Blueprint Attribution */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-500 text-center">
            Pega Blueprint™ Summary Specification • Blueprint ID: BP-2447035 • Confidential for Pegasystems utility workflows • Designed for AI Studio React runtime.
          </div>

        </div>

      </div>
    </div>
  );
};
