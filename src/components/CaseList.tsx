import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  ShieldAlert, 
  SlidersHorizontal,
  Flame,
  Receipt,
  Sparkles,
  Truck,
  FileCheck,
  User,
  ArrowUpRight
} from 'lucide-react';
import { CaseRecord, CaseStage, PersonaType } from '../types';
import { WORKFLOWS, STAGES } from '../data/pegaBlueprintData';
import { getSlaStatus, getPriorityBadge, getSentimentBadge, formatMinutes, getStageOrder } from '../utils/slaCalculator';

interface CaseListProps {
  cases: CaseRecord[];
  onSelectCase: (caseRecord: CaseRecord) => void;
  onOpenNewCase: () => void;
  activePersona: PersonaType;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  onSelectCase,
  onOpenNewCase,
  activePersona
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [slaFilter, setSlaFilter] = useState<string>('all');
  const [specialNeedsOnly, setSpecialNeedsOnly] = useState<boolean>(false);

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.id.toLowerCase().includes(searchLower) ||
      c.customerName.toLowerCase().includes(searchLower) ||
      c.title.toLowerCase().includes(searchLower) ||
      c.accountNumber.toLowerCase().includes(searchLower) ||
      c.serviceAddress.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // Stage
    if (stageFilter !== 'all' && c.currentStage !== stageFilter) return false;

    // Priority
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;

    // SLA
    if (slaFilter !== 'all') {
      const sla = getSlaStatus(c);
      if (sla.status !== slaFilter) return false;
    }

    // Special Needs
    if (specialNeedsOnly && !c.isSpecialNeeds) return false;

    return true;
  });

  // Summary Metrics
  const totalCases = cases.length;
  const criticalCount = cases.filter(c => c.priority === 'Critical').length;
  const slaBreachedCount = cases.filter(c => c.elapsedMinutes > c.slaDeadlineMinutes).length;
  const specialNeedsCount = cases.filter(c => c.isSpecialNeeds).length;

  return (
    <div className="space-y-6">
      
      {/* Top Operations KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In-Flight Cases</span>
            <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalCases}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active Pega customer journeys</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Priority</span>
            <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">{criticalCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Outages &amp; medical alerts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA Risk / Breached</span>
            <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{slaBreachedCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Exceeded target deadline</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Life-Support Flag</span>
            <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-800/60 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-400 mt-2">{specialNeedsCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Protected customer premises</p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-case-search"
              type="text"
              placeholder="Search by Case ID (e.g. CAS-1042), Customer Name, Account, Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* New Case Button */}
          <button
            id="btn-create-case-worklist"
            onClick={onOpenNewCase}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
          >
            <span>+ Create New Case</span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
          
          {/* Stage Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Stage:</span>
            <select
              id="filter-stage"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Stages (1 - 5)</option>
              {STAGES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Priority:</span>
            <select
              id="filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* SLA Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">SLA Status:</span>
            <select
              id="filter-sla"
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All SLA States</option>
              <option value="within_goal">On Target (Goal)</option>
              <option value="approaching_deadline">Approaching Deadline</option>
              <option value="breached_deadline">SLA Breached</option>
            </select>
          </div>

          {/* Special Needs Toggle */}
          <button
            id="toggle-special-needs-filter"
            onClick={() => setSpecialNeedsOnly(!specialNeedsOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              specialNeedsOnly
                ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Special Needs Protected Only</span>
          </button>

          {(stageFilter !== 'all' || priorityFilter !== 'all' || slaFilter !== 'all' || specialNeedsOnly || searchTerm) && (
            <button
              onClick={() => {
                setStageFilter('all');
                setPriorityFilter('all');
                setSlaFilter('all');
                setSpecialNeedsOnly(false);
                setSearchTerm('');
              }}
              className="text-xs text-blue-400 hover:underline ml-auto"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* Case Queue Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider">
            Worklist Queue ({filteredCases.length} Cases)
          </span>
          <span>Click any case to inspect &amp; execute Pega lifecycle stages</span>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No cases match your filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing some filter criteria or search queries.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredCases.map((record) => {
              const sla = getSlaStatus(record);
              const priorityStyle = getPriorityBadge(record.priority);
              const sentimentBadge = getSentimentBadge(record.sentiment);
              const stageOrder = getStageOrder(record.currentStage);
              const workflowMeta = WORKFLOWS.find(w => w.id === record.workflowType);

              return (
                <div
                  key={record.id}
                  id={`case-card-${record.id}`}
                  onClick={() => onSelectCase(record)}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500/80 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-900/10 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left details */}
                    <div className="space-y-2 flex-1 min-w-0">
                      
                      {/* Top badges line */}
                      <div className="flex flex-wrap items-center gap-2">
                        
                        {/* Case ID */}
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/80">
                          {record.id}
                        </span>

                        {/* Priority Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                          {record.priority}
                        </span>

                        {/* Workflow Type */}
                        <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          {workflowMeta?.title || record.workflowType.replace(/_/g, ' ')}
                        </span>

                        {/* Special Needs Life-Support Alert */}
                        {record.isSpecialNeeds && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-950/90 border border-rose-800 px-2 py-0.5 rounded-full">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            Life-Support Protected
                          </span>
                        )}

                        {/* Sentiment */}
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${sentimentBadge.className}`}>
                          {sentimentBadge.label}
                        </span>
                      </div>

                      {/* Title & Customer */}
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                          {record.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="font-medium text-slate-200 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {record.customerName}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-400">{record.accountNumber}</span>
                          <span>•</span>
                          <span className="text-slate-400 truncate max-w-xs">{record.serviceAddress}</span>
                          <span>•</span>
                          <span className="text-indigo-300 font-medium">{record.serviceType}</span>
                        </div>
                      </div>

                    </div>

                    {/* Right side: Pega Stages Mini-Meter & SLA Countdown */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      
                      {/* Pega 5-Stage Stepper Mini */}
                      <div className="w-44">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-slate-300">
                            Stage {stageOrder} of 5
                          </span>
                          <span className="text-blue-400 capitalize truncate max-w-[100px]">
                            {record.currentStage.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 h-2">
                          {[1, 2, 3, 4, 5].map((step) => {
                            const isCompleted = step < stageOrder;
                            const isCurrent = step === stageOrder;
                            return (
                              <div
                                key={step}
                                className={`rounded-sm transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-500'
                                    : isCurrent
                                    ? 'bg-blue-500 animate-pulse'
                                    : 'bg-slate-800'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* SLA Clock & Status */}
                      <div className="text-right min-w-[120px]">
                        <div className="flex items-center justify-end gap-1 text-xs">
                          <Clock className={`w-3.5 h-3.5 ${sla.colorClass}`} />
                          <span className="font-mono font-bold text-white">
                            {formatMinutes(record.elapsedMinutes)}
                          </span>
                          <span className="text-slate-500">/ {formatMinutes(record.slaDeadlineMinutes)}</span>
                        </div>
                        <span className={`inline-block text-[11px] px-2 py-0.5 rounded border mt-1 font-medium ${sla.badgeClass}`}>
                          {sla.label}
                        </span>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all hidden sm:block" />

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
