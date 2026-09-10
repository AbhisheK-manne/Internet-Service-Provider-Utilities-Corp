import React, { useState } from 'react';
import { 
  Workflow, 
  Clock, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Database, 
  Sliders, 
  Info,
  Zap,
  Receipt,
  Sparkles,
  CalendarClock,
  MessageSquareHeart,
  UserCog,
  Gauge,
  CreditCard,
  Flame,
  Leaf,
  ShieldAlert,
  Truck,
  Wrench,
  Bot,
  FileCheck
} from 'lucide-react';
import { WorkflowMetadata, WorkflowType } from '../types';
import { WORKFLOWS, STAGES, BLUEPRINT_META, PERSONAS } from '../data/pegaBlueprintData';
import { formatMinutes } from '../utils/slaCalculator';

interface PegaWorkflowDesignerProps {
  onTriggerNewCaseWithWorkflow?: (workflowId: WorkflowType) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-4 h-4 text-amber-500" />,
  Receipt: <Receipt className="w-4 h-4 text-emerald-500" />,
  Sparkles: <Sparkles className="w-4 h-4 text-indigo-500" />,
  CalendarClock: <CalendarClock className="w-4 h-4 text-blue-500" />,
  MessageSquareHeart: <MessageSquareHeart className="w-4 h-4 text-pink-500" />,
  UserCog: <UserCog className="w-4 h-4 text-cyan-500" />,
  AlertCircle: <AlertCircle className="w-4 h-4 text-rose-500" />,
  Gauge: <Gauge className="w-4 h-4 text-teal-500" />,
  CreditCard: <CreditCard className="w-4 h-4 text-violet-500" />,
  Flame: <Flame className="w-4 h-4 text-orange-500" />,
  Leaf: <Leaf className="w-4 h-4 text-emerald-600" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4 text-red-600" />,
  Truck: <Truck className="w-4 h-4 text-amber-600" />,
  Wrench: <Wrench className="w-4 h-4 text-blue-600" />,
  Bot: <Bot className="w-4 h-4 text-purple-500" />,
  FileCheck: <FileCheck className="w-4 h-4 text-indigo-600" />
};

export const PegaWorkflowDesigner: React.FC<PegaWorkflowDesignerProps> = ({
  onTriggerNewCaseWithWorkflow
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<WorkflowType>('service_outage_report');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStageTab, setSelectedStageTab] = useState<number>(0);

  const selectedWorkflow = WORKFLOWS.find(w => w.id === selectedWorkflowId) || WORKFLOWS[0];

  const categories = ['All', 'Critical Operations', 'Customer Care', 'Billing & Finance', 'Field & Assets', 'Compliance'];

  const filteredWorkflows = selectedCategory === 'All' 
    ? WORKFLOWS 
    : WORKFLOWS.filter(w => w.category === selectedCategory);

  const primaryPersona = PERSONAS.find(p => p.id === selectedWorkflow.primaryPersona);

  return (
    <div className="space-y-6">
      
      {/* Blueprint Header Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <Workflow className="w-4 h-4 text-blue-400" />
              <span>Pega Infinity™ Blueprint Engine • BP-2447035</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Customer Service Workflow Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              16 end-to-end case workflows designed for Energy &amp; Utilities. Each case progresses through 5 standardized Pega stages with automated SLA monitoring, decision gates, and Pega Local SoR data bindings.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Total Workflows</div>
              <div className="text-lg font-bold text-white">16 Workflows</div>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Data Objects</div>
              <div className="text-lg font-bold text-indigo-400">10 Pega Local</div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-4">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap mr-1">Categories:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Workflow Selector & Right Interactive Stage Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 16 Workflows List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
            <span className="font-semibold uppercase tracking-wider">Select Workflow ({filteredWorkflows.length})</span>
            <span>Target SLA Goal</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredWorkflows.map((wf) => {
              const isSelected = wf.id === selectedWorkflowId;
              return (
                <div
                  key={wf.id}
                  id={`workflow-item-${wf.id}`}
                  onClick={() => setSelectedWorkflowId(wf.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500/40 text-white'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 shrink-0">
                        {ICON_MAP[wf.icon] || <Workflow className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">{wf.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="text-blue-400">{wf.category}</span>
                          <span>•</span>
                          <span className="capitalize">{wf.primaryPersona.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
                        <Clock className="w-3 h-3" />
                        {formatMinutes(wf.targetSlaGoalMinutes)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {wf.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Stage-Gate Inspector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          {/* Selected Workflow Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
                <span>{selectedWorkflow.category}</span>
                <span>•</span>
                <span>Pega Workflow Design</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                {ICON_MAP[selectedWorkflow.icon]}
                <span>{selectedWorkflow.title}</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {selectedWorkflow.description}
              </p>
            </div>

            {/* Launch Case Action Button */}
            {onTriggerNewCaseWithWorkflow && (
              <button
                id="btn-launch-case-workflow"
                onClick={() => onTriggerNewCaseWithWorkflow(selectedWorkflow.id)}
                className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Trigger New Case</span>
              </button>
            )}
          </div>

          {/* Workflow Specification KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Primary Persona</span>
              <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                {primaryPersona?.title || selectedWorkflow.primaryPersona}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Default Priority</span>
              <span className={`font-semibold mt-0.5 block ${
                selectedWorkflow.defaultPriority === 'Critical' ? 'text-rose-400' :
                selectedWorkflow.defaultPriority === 'High' ? 'text-amber-400' : 'text-blue-400'
              }`}>
                {selectedWorkflow.defaultPriority}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">SLA Goal</span>
              <span className="font-semibold text-emerald-400 font-mono mt-0.5 block">
                {formatMinutes(selectedWorkflow.targetSlaGoalMinutes)}
              </span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">SLA Deadline</span>
              <span className="font-semibold text-amber-400 font-mono mt-0.5 block">
                {formatMinutes(selectedWorkflow.targetSlaDeadlineMinutes)}
              </span>
            </div>
          </div>

          {/* Visual Pega Chevron Stage Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-slate-300">
                Pega Case Lifecycle Stages (5 Stages)
              </span>
              <span className="text-[11px] text-blue-400">Click any stage to inspect actions</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {STAGES.map((stage, idx) => {
                const isSelected = selectedStageTab === idx;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStageTab(idx)}
                    className={`p-2 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500">Stage {idx + 1}</div>
                    <div className="text-xs font-semibold truncate mt-0.5">
                      {stage.label.split('. ')[1]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Stage Detail Box */}
          {STAGES[selectedStageTab] && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {selectedStageTab + 1}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {STAGES[selectedStageTab].label}
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Typical Duration: ~{STAGES[selectedStageTab].typicalSlaHours}h
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {STAGES[selectedStageTab].description}
              </p>

              {/* Stage Actions Defined in this Workflow */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Step Actions &amp; Automations Configured:
                </span>
                
                {selectedWorkflow.stages[selectedStageTab]?.actions ? (
                  <ul className="space-y-1.5">
                    {selectedWorkflow.stages[selectedStageTab].actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Standard Pega stage verification and automated audit log update.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Required Pega Local Data Objects */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Data Objects Touched (Pega Local System of Record)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedWorkflow.requiredDataObjects.map((doName) => (
                <span
                  key={doName}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/40 text-indigo-300 border border-indigo-800/60 text-xs font-medium flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  {doName}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
