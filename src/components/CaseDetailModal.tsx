import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  ShieldAlert, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  Sparkles, 
  Bot, 
  FileText, 
  AlertTriangle, 
  ThumbsUp, 
  Star,
  Activity,
  Calendar,
  Layers,
  Check,
  Loader2,
  Server
} from 'lucide-react';
import { CaseRecord, CaseStage, PersonaType } from '../types';
import { STAGES, WORKFLOWS, PERSONAS } from '../data/pegaBlueprintData';
import { getSlaStatus, getPriorityBadge, getSentimentBadge, formatMinutes, getStageOrder, getNextStage } from '../utils/slaCalculator';

interface CaseDetailModalProps {
  caseRecord: CaseRecord;
  onClose: () => void;
  onUpdateCase: (updated: CaseRecord) => void;
  activePersona: PersonaType;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseRecord,
  onClose,
  onUpdateCase,
  activePersona
}) => {
  const [newNote, setNewNote] = useState('');
  const [csatRating, setCsatRating] = useState<number>(caseRecord.satisfactionRating || 5);
  const [resolutionSummary, setResolutionSummary] = useState(caseRecord.resolutionNotes || '');
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [aiDraftResult, setAiDraftResult] = useState<{
    customerSubject?: string;
    customerMessage?: string;
    fieldNotes?: string;
    nextSuggestedStageAction?: string;
    source?: string;
  } | null>(null);

  const sla = getSlaStatus(caseRecord);
  const priorityStyle = getPriorityBadge(caseRecord.priority);
  const sentimentBadge = getSentimentBadge(caseRecord.sentiment);
  const currentStageOrder = getStageOrder(caseRecord.currentStage);
  const workflowMeta = WORKFLOWS.find(w => w.id === caseRecord.workflowType);
  const currentPersona = PERSONAS.find(p => p.id === activePersona);

  // Advance Stage
  const handleAdvanceStage = () => {
    const next = getNextStage(caseRecord.currentStage);
    const nextStageDef = STAGES.find(s => s.id === next);
    
    const newActivity = {
      id: `ACT-${Date.now()}`,
      stage: next,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: currentPersona?.title || 'System Specialist',
      role: currentPersona?.role || 'Service Representative',
      message: `Case advanced from ${caseRecord.currentStage.replace(/_/g, ' ')} to ${next.replace(/_/g, ' ')}. Actions initiated.`,
      type: 'transition' as const
    };

    onUpdateCase({
      ...caseRecord,
      currentStage: next,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityHistory: [...caseRecord.activityHistory, newActivity]
    });
  };

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const activity = {
      id: `ACT-${Date.now()}`,
      stage: caseRecord.currentStage,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: currentPersona?.title || 'CSR',
      role: currentPersona?.role || 'Staff',
      message: newNote.trim(),
      type: 'note' as const
    };

    onUpdateCase({
      ...caseRecord,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityHistory: [...caseRecord.activityHistory, activity]
    });
    setNewNote('');
  };

  // Apply AI Suggestion
  const handleApplyAiSuggestion = () => {
    if (!caseRecord.automatedResponseSuggestion) return;
    
    const activity = {
      id: `ACT-${Date.now()}`,
      stage: caseRecord.currentStage,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: 'Pega AI Copilot',
      role: 'Automated Response Assistant',
      message: `AI Suggestion Applied to Customer Channel: "${caseRecord.automatedResponseSuggestion}"`,
      type: 'ai_suggestion' as const
    };

    onUpdateCase({
      ...caseRecord,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityHistory: [...caseRecord.activityHistory, activity]
    });
  };

  // Generate Real-time AI Draft from Server-Side Gemini API
  const handleGenerateAiDraft = async () => {
    setIsDraftingAi(true);
    try {
      const res = await fetch('/api/copilot/draft-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseRecord.id,
          customerName: caseRecord.customerName,
          workflowType: caseRecord.workflowType,
          currentStage: caseRecord.currentStage,
          priority: caseRecord.priority,
          notes: newNote || caseRecord.description
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiDraftResult(data);
      }
    } catch (err) {
      console.error('Failed to generate draft with Gemini:', err);
    } finally {
      setIsDraftingAi(false);
    }
  };

  // Apply Generated AI Draft into Case Activity History
  const handleApplyGeneratedDraft = () => {
    if (!aiDraftResult?.customerMessage) return;

    const activity = {
      id: `ACT-${Date.now()}`,
      stage: caseRecord.currentStage,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: 'Gemini 3.8 Flash (Server)',
      role: 'AI Dispatch & Communications',
      message: `[Subject: ${aiDraftResult.customerSubject || 'Case Update'}]\n${aiDraftResult.customerMessage}${aiDraftResult.fieldNotes ? `\n\n[Field Notes]: ${aiDraftResult.fieldNotes}` : ''}`,
      type: 'ai_suggestion' as const
    };

    onUpdateCase({
      ...caseRecord,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityHistory: [...caseRecord.activityHistory, activity]
    });
    setAiDraftResult(null);
  };

  // Complete Case with Satisfaction rating
  const handleCompleteCase = () => {
    const activity = {
      id: `ACT-${Date.now()}`,
      stage: 'resolved' as CaseStage,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: currentPersona?.title || 'Customer & Verification Desk',
      role: 'Satisfaction Verification',
      message: `Case successfully closed and verified. CSAT: ${csatRating}/5 stars. Resolution: ${resolutionSummary || 'Service restored and customer confirmed operations.'}`,
      type: 'system' as const
    };

    onUpdateCase({
      ...caseRecord,
      currentStage: 'resolved',
      satisfactionRating: csatRating,
      resolutionNotes: resolutionSummary || 'Restored & Verified',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      activityHistory: [...caseRecord.activityHistory, activity]
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/90 px-2.5 py-1 rounded border border-blue-800">
              {caseRecord.id}
            </span>
            <div>
              <h3 className="text-base font-bold text-white truncate max-w-lg">
                {caseRecord.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{workflowMeta?.title}</span>
                <span>•</span>
                <span className="text-indigo-400">{caseRecord.serviceType}</span>
                <span>•</span>
                <span>Created {caseRecord.createdAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Priority Pill */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              {caseRecord.priority}
            </span>

            {/* Close Button */}
            <button
              id="btn-close-case-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pega Stage Chevron Bar */}
        <div className="px-6 py-3.5 bg-slate-950/40 border-b border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Pega Case Lifecycle (Stage {currentStageOrder} of 5)</span>
            <span className="text-blue-400">
              {caseRecord.currentStage === 'resolved' ? 'Case Completed & Verified' : 'In Progress'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {STAGES.map((s, idx) => {
              const isCompleted = idx + 1 < currentStageOrder || caseRecord.currentStage === 'resolved';
              const isCurrent = idx + 1 === currentStageOrder && caseRecord.currentStage !== 'resolved';

              return (
                <div
                  key={s.id}
                  className={`p-2.5 rounded-xl border text-xs transition-all relative overflow-hidden ${
                    isCompleted
                      ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                      : isCurrent
                      ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono opacity-80">0{idx + 1}</span>
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />}
                  </div>
                  <div className="font-semibold truncate text-[11px]">
                    {s.label.split('. ')[1]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Banner: SLA & Actions */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* SLA Status Indicator */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${sla.colorClass}`} />
                <span className="text-xs font-semibold text-slate-300">SLA Tracking:</span>
                <span className={`text-xs px-2.5 py-0.5 rounded border font-medium ${sla.badgeClass}`}>
                  {sla.label}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Elapsed: <span className="text-white font-bold">{formatMinutes(caseRecord.elapsedMinutes)}</span> | 
                Goal: <span className="text-emerald-400">{formatMinutes(caseRecord.slaGoalMinutes)}</span> | 
                Deadline: <span className="text-amber-400">{formatMinutes(caseRecord.slaDeadlineMinutes)}</span>
              </div>
            </div>

            {/* Stage Transition Actions */}
            <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
              {caseRecord.currentStage !== 'resolved' && caseRecord.currentStage !== 'satisfaction_verification' && (
                <button
                  id="btn-advance-stage"
                  onClick={handleAdvanceStage}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
                >
                  <span>Advance to Next Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {caseRecord.currentStage === 'satisfaction_verification' && (
                <button
                  id="btn-verify-resolve"
                  onClick={handleCompleteCase}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify Satisfaction &amp; Close Case</span>
                </button>
              )}

              {caseRecord.currentStage === 'resolved' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Case Resolved</span>
                </div>
              )}
            </div>

          </div>

          {/* Grid Layout: Left Case Info & Right Activity History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 5 Cols: Customer & Data Objects */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Customer Profile Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    Customer &amp; Premise
                  </span>
                  {caseRecord.isSpecialNeeds && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      Life-Support
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Customer Name</span>
                    <span className="font-semibold text-white text-sm">{caseRecord.customerName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Account ID</span>
                      <span className="font-mono text-slate-300">{caseRecord.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Phone</span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {caseRecord.customerPhone}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Service Premise Address</span>
                    <span className="text-slate-300 flex items-start gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{caseRecord.serviceAddress}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">Customer Sentiment Detected</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded border ${sentimentBadge.className}`}>
                        {sentimentBadge.label}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Score: {caseRecord.sentimentScore.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Narrative Description */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Initial Inquiry Narrative
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                  {caseRecord.description}
                </p>
              </div>

              {/* Automated AI Copilot Response Suggestion */}
              {caseRecord.automatedResponseSuggestion && (
                <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/60 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Automated Response Suggestion
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                      Pega AI
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{caseRecord.automatedResponseSuggestion}"
                  </p>
                  <button
                    id="btn-apply-ai-response"
                    onClick={handleApplyAiSuggestion}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors active:scale-95"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Send Suggested Response to Customer</span>
                  </button>
                </div>
              )}

              {/* Real-time Server Gemini Copilot Drafter */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Server-Side Gemini Drafter</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                    gemini-3.8-flash
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Generate official customer communications, field dispatch notices, and stage action recommendations processed securely through the backend.
                </p>

                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={isDraftingAi}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-700/80 hover:bg-cyan-600 text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {isDraftingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating with Backend Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft Resolution Notice &amp; Field Directives</span>
                    </>
                  )}
                </button>

                {aiDraftResult && (
                  <div className="p-3 bg-slate-900 border border-cyan-800/60 rounded-lg space-y-2 text-xs">
                    {aiDraftResult.customerSubject && (
                      <div className="font-semibold text-cyan-300">
                        Subject: {aiDraftResult.customerSubject}
                      </div>
                    )}
                    <div className="text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px]">
                      {aiDraftResult.customerMessage}
                    </div>
                    {aiDraftResult.fieldNotes && (
                      <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-900/50">
                        <span className="font-semibold block">Field Directive:</span>
                        {aiDraftResult.fieldNotes}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleApplyGeneratedDraft}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Post AI Draft to Case History</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Satisfaction Verification Form (if at stage 5 or resolved) */}
              {(caseRecord.currentStage === 'satisfaction_verification' || caseRecord.currentStage === 'resolved') && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    Satisfaction Verification (CSAT)
                  </span>

                  <div>
                    <span className="text-slate-400 text-xs block mb-1.5">Customer Rating (1-5 Stars)</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setCsatRating(star)}
                          disabled={caseRecord.currentStage === 'resolved'}
                          className={`p-1 transition-colors ${
                            star <= csatRating ? 'text-amber-400' : 'text-slate-600'
                          }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-300 ml-2">{csatRating} of 5</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs block mb-1">Resolution Summary</span>
                    <input
                      type="text"
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      disabled={caseRecord.currentStage === 'resolved'}
                      placeholder="e.g. Line re-energized, customer verified power restored."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Right 7 Cols: Activity History & Interaction Audit Trail */}
            <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col h-[520px]">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  Pega Interaction Audit Trail ({caseRecord.activityHistory.length} Events)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">SoR: Pega(Local)</span>
              </div>

              {/* Timeline list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {caseRecord.activityHistory.map((act) => {
                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{act.author}</span>
                            <span className="text-slate-500 font-normal">({act.role})</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{act.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {act.message}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            Stage: {act.stage.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Note / Message Input */}
              <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-800 mt-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Log specialist action, dispatch update, or customer note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    id="btn-submit-case-note"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
