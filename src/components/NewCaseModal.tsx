import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Workflow, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  User, 
  AlertTriangle,
  Zap,
  Receipt,
  FileCheck
} from 'lucide-react';
import { CaseRecord, WorkflowType, PersonaType, UserProfile } from '../types';
import { WORKFLOWS, PERSONAS } from '../data/pegaBlueprintData';
import { formatMinutes } from '../utils/slaCalculator';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCase: (newCase: CaseRecord) => void;
  preselectedWorkflowId?: WorkflowType;
  userProfile?: UserProfile;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  onCreateCase,
  preselectedWorkflowId,
  userProfile
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>(
    preselectedWorkflowId || 'service_outage_report'
  );
  const [customerName, setCustomerName] = useState(userProfile ? userProfile.name : 'Elena Rostova');
  const [customerPhone, setCustomerPhone] = useState(userProfile ? userProfile.phone : '+1 (555) 234-8901');
  const [customerEmail, setCustomerEmail] = useState(userProfile ? userProfile.email : 'elena.rostova@gmail.com');
  const [accountNumber, setAccountNumber] = useState(userProfile ? userProfile.accountNumber : 'ACCT-RES-882194');
  const [serviceAddress, setServiceAddress] = useState(userProfile ? userProfile.serviceAddress : '742 Evergreen Terrace, Sector 4B');
  const [serviceType, setServiceType] = useState<'Electric Grid' | 'Fiber Internet' | 'Natural Gas' | 'Dual Fuel & Fiber'>(
    userProfile ? userProfile.serviceType : 'Electric Grid'
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSpecialNeeds, setIsSpecialNeeds] = useState(userProfile ? userProfile.isSpecialNeeds : false);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');

  const activeWorkflowMeta = WORKFLOWS.find(w => w.id === selectedWorkflow) || WORKFLOWS[0];

  useEffect(() => {
    if (userProfile) {
      setCustomerName(userProfile.name);
      setCustomerPhone(userProfile.phone);
      setCustomerEmail(userProfile.email);
      setAccountNumber(userProfile.accountNumber);
      setServiceAddress(userProfile.serviceAddress);
      setServiceType(userProfile.serviceType);
      setIsSpecialNeeds(userProfile.isSpecialNeeds);
    }
  }, [userProfile]);

  useEffect(() => {
    if (preselectedWorkflowId) {
      setSelectedWorkflow(preselectedWorkflowId);
    }
  }, [preselectedWorkflowId]);

  useEffect(() => {
    // Sync default priority from workflow
    setPriority(activeWorkflowMeta.defaultPriority);
    if (!title) {
      setTitle(`${activeWorkflowMeta.title} - Premise Inquiry`);
    }
  }, [selectedWorkflow]);

  // If special needs is toggled on, escalate to Critical
  useEffect(() => {
    if (isSpecialNeeds) {
      setPriority('Critical');
    }
  }, [isSpecialNeeds]);

  if (!isOpen) return null;

  // Sentiment detection heuristics
  const calculateSentiment = (text: string): { sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Very Negative'; score: number } => {
    const lower = text.toLowerCase();
    if (lower.includes('outage') || lower.includes('emergency') || lower.includes('spark') || lower.includes('danger') || lower.includes('oxygen') || lower.includes('life')) {
      return { sentiment: 'Very Negative', score: -0.85 };
    }
    if (lower.includes('bill') || lower.includes('spike') || lower.includes('high') || lower.includes('wrong') || lower.includes('complaint') || lower.includes('slow')) {
      return { sentiment: 'Negative', score: -0.45 };
    }
    if (lower.includes('thanks') || lower.includes('new') || lower.includes('solar') || lower.includes('upgrade') || lower.includes('great')) {
      return { sentiment: 'Positive', score: 0.6 };
    }
    return { sentiment: 'Neutral', score: 0.0 };
  };

  const currentSentiment = calculateSentiment(description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const caseId = `CAS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newRecord: CaseRecord = {
      id: caseId,
      workflowType: selectedWorkflow,
      title: title || `${activeWorkflowMeta.title} Incident`,
      description: description || 'Customer inquiry submitted via omnichannel portal.',
      customerName,
      customerPhone,
      customerEmail,
      accountNumber,
      serviceAddress,
      serviceType,
      currentStage: 'initial_categorization',
      priority,
      sentiment: currentSentiment.sentiment,
      sentimentScore: currentSentiment.score,
      assignedPersona: activeWorkflowMeta.primaryPersona,
      assignedToName: 'CSR Frontline Intake Desk',
      createdAt: now,
      updatedAt: now,
      slaGoalMinutes: activeWorkflowMeta.targetSlaGoalMinutes,
      slaDeadlineMinutes: activeWorkflowMeta.targetSlaDeadlineMinutes,
      elapsedMinutes: 2,
      isSpecialNeeds,
      automatedResponseSuggestion: `Thank you for contacting GridFlow Utilities. Your ${activeWorkflowMeta.title} request (${caseId}) is registered with our ${activeWorkflowMeta.category} team. Target SLA response is within ${formatMinutes(activeWorkflowMeta.targetSlaGoalMinutes)}.`,
      activityHistory: [
        {
          id: `ACT-${Date.now()}`,
          stage: 'initial_categorization',
          timestamp: now,
          author: 'Pega Omnichannel Ingestion',
          role: 'Application Control Agent',
          message: `Case ${caseId} created via Pega Blueprint workflow [${activeWorkflowMeta.id}]. Initial categorization initiated.`,
          type: 'system'
        }
      ]
    };

    onCreateCase(newRecord);
    onClose();
  };

  // Quick preset loader
  const loadCustomerPreset = (type: 'residential' | 'commercial' | 'medical') => {
    if (type === 'residential') {
      setCustomerName('Marcus Vance');
      setCustomerPhone('+1 (555) 789-3321');
      setCustomerEmail('marcus.vance@techhub.io');
      setAccountNumber('ACCT-RES-440182');
      setServiceAddress('1088 Willow Creek Way, Apt 3');
      setServiceType('Dual Fuel & Fiber');
      setIsSpecialNeeds(false);
    } else if (type === 'commercial') {
      setCustomerName('David Chen (Apex Data Labs)');
      setCustomerPhone('+1 (555) 900-3300');
      setCustomerEmail('ops@apexdata.io');
      setAccountNumber('ACCT-BIZ-409122');
      setServiceAddress('Feeder Junction 4B-11, West Industrial Park');
      setServiceType('Fiber Internet');
      setIsSpecialNeeds(false);
    } else if (type === 'medical') {
      setCustomerName('Elena Rostova');
      setCustomerPhone('+1 (555) 234-8901');
      setCustomerEmail('elena.rostova@gmail.com');
      setAccountNumber('ACCT-RES-882194');
      setServiceAddress('742 Evergreen Terrace, Sector 4B');
      setServiceType('Electric Grid');
      setIsSpecialNeeds(true);
      setPriority('Critical');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Pega Case</h3>
              <p className="text-xs text-slate-400">
                Pega Blueprint BP-2447035 • Instant SLA &amp; Stage-Gate Initialization
              </p>
            </div>
          </div>
          <button
            id="btn-close-new-case-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Workflow Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Pega Workflow (16 Available)
            </label>
            <select
              id="select-new-case-workflow"
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value as WorkflowType)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {WORKFLOWS.map((wf) => (
                <option key={wf.id} value={wf.id}>
                  [{wf.category}] {wf.title} (SLA Goal: {formatMinutes(wf.targetSlaGoalMinutes)})
                </option>
              ))}
            </select>
          </div>

          {/* Workflow KPI Info Bar */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-blue-400" />
              <span>Assigned: <strong className="text-white capitalize">{activeWorkflowMeta.primaryPersona.replace('_', ' ')}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Goal: {formatMinutes(activeWorkflowMeta.targetSlaGoalMinutes)}
              </span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-amber-400">
                Deadline: {formatMinutes(activeWorkflowMeta.targetSlaDeadlineMinutes)}
              </span>
            </div>
          </div>

          {/* Customer Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Customer &amp; Premise Details
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {userProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerName(userProfile.name);
                      setCustomerPhone(userProfile.phone);
                      setCustomerEmail(userProfile.email);
                      setAccountNumber(userProfile.accountNumber);
                      setServiceAddress(userProfile.serviceAddress);
                      setServiceType(userProfile.serviceType);
                      setIsSpecialNeeds(userProfile.isSpecialNeeds);
                      if (userProfile.isSpecialNeeds) setPriority('Critical');
                    }}
                    className="text-[11px] text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-700 hover:bg-cyan-900/60 font-semibold flex items-center gap-1"
                  >
                    <User className="w-3 h-3 text-cyan-400" />
                    <span>My Data ({userProfile.name.split(' ')[0]})</span>
                  </button>
                )}
                <span className="text-[11px] text-slate-500">Presets:</span>
                <button
                  type="button"
                  onClick={() => loadCustomerPreset('medical')}
                  className="text-[11px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800 hover:bg-rose-900/50"
                >
                  Elena (Medical)
                </button>
                <button
                  type="button"
                  onClick={() => loadCustomerPreset('residential')}
                  className="text-[11px] text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800 hover:bg-blue-900/50"
                >
                  Marcus
                </button>
                <button
                  type="button"
                  onClick={() => loadCustomerPreset('commercial')}
                  className="text-[11px] text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800 hover:bg-indigo-900/50"
                >
                  Commercial (Apex)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Phone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="Electric Grid">Electric Grid</option>
                  <option value="Fiber Internet">Fiber Internet</option>
                  <option value="Natural Gas">Natural Gas</option>
                  <option value="Dual Fuel & Fiber">Dual Fuel &amp; Fiber</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-[11px] text-slate-400 block mb-1">Premise Address</label>
              <input
                type="text"
                required
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Case Narrative & Sentiment AI */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Case Title &amp; Inquiry Narrative
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-400">AI Sentiment:</span>
                <span className="text-cyan-300 font-medium">{currentSentiment.sentiment}</span>
              </div>
            </div>

            <input
              type="text"
              required
              placeholder="e.g. Total Power Loss & Critical Device Warning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium mb-2"
            />

            <textarea
              rows={3}
              required
              placeholder="Describe the inquiry or incident details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Priority & Special Needs Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
            
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-300">Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Life support toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-700">
              <input
                type="checkbox"
                checked={isSpecialNeeds}
                onChange={(e) => setIsSpecialNeeds(e.target.checked)}
                className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Special Needs / Medical Life-Support Flag
              </span>
            </label>

          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-create-case"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              Initialize Pega Case
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
