import React from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Workflow, 
  Radio, 
  ChevronDown, 
  UserCheck, 
  Zap, 
  AlertTriangle,
  Database,
  Cloud,
  Loader2
} from 'lucide-react';
import { PersonaType, PersonaInfo } from '../types';
import { BLUEPRINT_META, PERSONAS } from '../data/pegaBlueprintData';

interface HeaderProps {
  activePersona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  activeTab: 'cases' | 'workflows' | 'outages' | 'data_objects' | 'ai_copilot';
  onSelectTab: (tab: 'cases' | 'workflows' | 'outages' | 'data_objects' | 'ai_copilot') => void;
  onOpenNewCase: () => void;
  onOpenWorkflowDesigner: () => void;
  onOpenMyData: () => void;
  criticalCasesCount: number;
  activeOutagesCount: number;
  isFirestoreSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activePersona,
  onSelectPersona,
  activeTab,
  onSelectTab,
  onOpenNewCase,
  onOpenWorkflowDesigner,
  onOpenMyData,
  criticalCasesCount,
  activeOutagesCount,
  isFirestoreSyncing = false
}) => {
  const currentPersonaInfo = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];
  const [showPersonaDropdown, setShowPersonaDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner with Pega Blueprint Metadata */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-200">Pega Blueprint:</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[11px] border border-blue-800">
            {BLUEPRINT_META.id}
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">{BLUEPRINT_META.organization}</span>
          <span className="hidden lg:inline text-slate-500">({BLUEPRINT_META.industrySubsegment})</span>
        </div>

        <div className="flex items-center gap-3">
          {criticalCasesCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{criticalCasesCount} Critical SLA</span>
            </div>
          )}
          {activeOutagesCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeOutagesCount} Grid Outages</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-800 text-[11px]">
            {isFirestoreSyncing ? (
              <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
            ) : (
              <Cloud className="w-3 h-3 text-emerald-400" />
            )}
            <span>Firestore: Connected</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('cases')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">GridFlow Utilities</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-200 border border-indigo-700 font-medium">
                  Pega CS
                </span>
              </div>
              <p className="text-xs text-slate-400">Customer Engagement &amp; Operations</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-tab-cases"
              onClick={() => onSelectTab('cases')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'cases'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Worklist &amp; Cases</span>
            </button>

            <button
              id="nav-tab-workflows"
              onClick={() => onSelectTab('workflows')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'workflows'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>16 Workflows</span>
            </button>

            <button
              id="nav-tab-outages"
              onClick={() => onSelectTab('outages')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'outages'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Outage Grid</span>
            </button>

            <button
              id="nav-tab-data-objects"
              onClick={() => onSelectTab('data_objects')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'data_objects'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>10 Data Objects</span>
            </button>

            <button
              id="nav-tab-ai-copilot"
              onClick={() => onSelectTab('ai_copilot')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'ai_copilot'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>AI Copilot</span>
            </button>
          </nav>

          {/* Right Action Tools: Persona Selector & New Case */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-persona-switcher"
                onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-all shadow-sm"
                title="Switch Persona / Role"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${currentPersonaInfo.avatarBg}`} />
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white leading-tight">{currentPersonaInfo.title}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Role Switcher</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPersonaDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Active Persona (6 Available)
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                    {PERSONAS.map((persona) => {
                      const isSelected = persona.id === activePersona;
                      return (
                        <button
                          key={persona.id}
                          id={`persona-option-${persona.id}`}
                          onClick={() => {
                            onSelectPersona(persona.id);
                            setShowPersonaDropdown(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left flex items-start gap-2.5 hover:bg-slate-800/80 transition-colors ${
                            isSelected ? 'bg-blue-900/30 text-blue-200' : 'text-slate-300'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${persona.avatarBg}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-100 flex items-center justify-between">
                              <span>{persona.title}</span>
                              {isSelected && <UserCheck className="w-3.5 h-3.5 text-blue-400" />}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{persona.role}</p>
                            <span className="inline-block text-[10px] text-slate-500 mt-0.5 truncate">
                              Channel: {persona.channel.split('(')[0]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Input My Data Button */}
            <button
              id="btn-input-my-data"
              onClick={onOpenMyData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
              title="Input account details, custom data objects, or import JSON"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Input My Data</span>
            </button>

            {/* Pega Blueprint Architecture Button */}
            <button
              id="btn-inspect-workflow"
              onClick={onOpenWorkflowDesigner}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Blueprint Designer</span>
            </button>

            {/* Create Case Button */}
            <button
              id="btn-new-case"
              onClick={onOpenNewCase}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">New Case</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800 overflow-x-auto gap-2">
          <button
            onClick={() => onSelectTab('cases')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'cases' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Worklist
          </button>
          <button
            onClick={() => onSelectTab('workflows')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'workflows' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            16 Workflows
          </button>
          <button
            onClick={() => onSelectTab('outages')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'outages' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Outage Grid
          </button>
          <button
            onClick={() => onSelectTab('data_objects')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'data_objects' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            10 Data Objects
          </button>
          <button
            onClick={() => onSelectTab('ai_copilot')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'ai_copilot' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Copilot
          </button>
        </div>
      </div>
    </header>
  );
};
