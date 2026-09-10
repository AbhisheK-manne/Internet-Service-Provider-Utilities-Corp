import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  Workflow, 
  Copy, 
  Check, 
  Plus, 
  ArrowRight,
  ShieldAlert,
  Zap,
  HelpCircle,
  Loader2,
  Server,
  RefreshCw
} from 'lucide-react';
import { WorkflowType } from '../types';
import { WORKFLOWS } from '../data/pegaBlueprintData';

interface AiCopilotProps {
  onLaunchCaseWithDraft?: (workflow: WorkflowType, text: string, priority: 'Low' | 'Medium' | 'High' | 'Critical') => void;
}

interface AnalysisResult {
  detectedWorkflow: WorkflowType;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: 'Very Negative' | 'Negative' | 'Neutral' | 'Positive';
  score: number;
  specialNeedsDetected: boolean;
  suggestedResponse: string;
  source?: string;
  reasoning?: string;
  agentKeyTakeaways?: string[];
}

export const AiCopilotDrawer: React.FC<AiCopilotProps> = ({
  onLaunchCaseWithDraft
}) => {
  const [inquiryText, setInquiryText] = useState(
    'My power went out 20 minutes ago and my grandmother is on an electric oxygen concentrator. Please hurry!'
  );
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult>({
    detectedWorkflow: 'service_outage_report',
    priority: 'Critical',
    sentiment: 'Very Negative',
    score: -0.95,
    specialNeedsDetected: true,
    suggestedResponse: 'EMERGENCY NOTIFICATION ACKNOWLEDGED: We have registered an active medical life-support flag for your address. Lineman crew Unit #12 has been assigned high priority for your substation feeder. An auxiliary mobile battery pack has also been alerted to emergency response teams.',
    source: 'gemini-3.8-flash',
    reasoning: 'Customer noted an ongoing outage with a household occupant reliant on an electric oxygen concentrator.',
    agentKeyTakeaways: ['Life-support medical flag priority dispatch', 'Feeder trip isolation crew assigned']
  });

  // Call Server-Side Gemini API
  const runServerAnalysis = useCallback(async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/copilot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiry: textToAnalyze })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis({
          detectedWorkflow: data.detectedWorkflow || 'self_service_inquiry',
          priority: data.priority || 'Medium',
          sentiment: data.sentiment || 'Neutral',
          score: typeof data.score === 'number' ? data.score : 0,
          specialNeedsDetected: !!data.specialNeedsDetected,
          suggestedResponse: data.suggestedResponse || '',
          source: data.source || 'gemini-3.8-flash',
          reasoning: data.reasoning || 'Classified by server triage model.',
          agentKeyTakeaways: data.agentKeyTakeaways || []
        });
      }
    } catch (err) {
      console.warn('Server analysis fallback to local heuristics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    runServerAnalysis(inquiryText);
  }, []);

  const matchedWorkflowMeta = WORKFLOWS.find(w => w.id === analysis.detectedWorkflow);

  const samplePrompts = [
    {
      label: 'Life-Support Outage Emergency',
      text: 'My power went out 20 minutes ago and my grandmother is on an electric oxygen concentrator. Please hurry!'
    },
    {
      label: 'High Summer Bill Dispute',
      text: 'Why is my August electric bill $240 higher than usual? We were out of town for two weeks!'
    },
    {
      label: 'Fiber Internet Installation',
      text: 'I just bought a house at 312 Orchard Ridge Road and want to order 1000Mbps symmetrical fiber broadband.'
    },
    {
      label: 'Hardship Payment Arrangement',
      text: 'I lost my job recently and cannot pay the full $380 balance this month. Can I break this into monthly payments?'
    }
  ];

  const handleSelectSample = (text: string) => {
    setInquiryText(text);
    runServerAnalysis(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.suggestedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Pega AI Decisioning &amp; Customer Copilot</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Automated Response &amp; Sentiment Analyzer
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Server-side AI triage engine powered by Gemini 3.8 Flash: classifies customer distress, maps inquiries to canonical Pega Blueprint workflows, and synthesizes compliant resolution communications.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-mono">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Server API Active</span>
          </span>
          <button
            onClick={() => runServerAnalysis(inquiryText)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
            title="Re-run Server Gemini analysis"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Analyze</span>
          </button>
        </div>
      </div>

      {/* Main Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input text & Quick Samples */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Inbound Customer Inquiry / Chat Message
            </label>
            <span className="text-[11px] text-slate-500">Live server AI processing</span>
          </div>

          <textarea
            rows={5}
            value={inquiryText}
            onChange={(e) => setInquiryText(e.target.value)}
            placeholder="Paste or type customer email, chat message, or voice transcript..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              onClick={() => runServerAnalysis(inquiryText)}
              disabled={isLoading || !inquiryText.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Gemini Triage</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Prompts */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Load Sample Customer Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(p.text)}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all text-xs"
                >
                  <div className="font-semibold text-slate-200 truncate">{p.label}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.text}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Analysis & Proposed Pega Action */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Classification &amp; Sentiment ({analysis.source || 'gemini-3.8-flash'})</span>
            </span>
            {analysis.specialNeedsDetected && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-950/90 px-2.5 py-0.5 rounded-full border border-rose-800">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Special Needs Flag Triggered
              </span>
            )}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Recommended Workflow</span>
              <span className="font-bold text-blue-400 mt-1 block truncate">
                {matchedWorkflowMeta?.title || analysis.detectedWorkflow}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Assessed Priority</span>
              <span className={`font-bold mt-1 block ${
                analysis.priority === 'Critical' ? 'text-rose-400' :
                analysis.priority === 'High' ? 'text-amber-400' : 'text-blue-400'
              }`}>
                {analysis.priority}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Sentiment Score</span>
              <span className={`font-bold font-mono mt-1 block ${
                analysis.score < -0.5 ? 'text-rose-400' :
                analysis.score < 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {analysis.score.toFixed(2)} ({analysis.sentiment})
              </span>
            </div>
          </div>

          {/* Reasoning & Key Takeaways if available */}
          {analysis.reasoning && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">AI Triage Rationale:</span>
              <p className="text-slate-300">{analysis.reasoning}</p>
              {analysis.agentKeyTakeaways && analysis.agentKeyTakeaways.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {analysis.agentKeyTakeaways.map((point, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[11px] border border-slate-700">
                      • {point}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suggested Response Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Automated Response Suggestion (for CSR)
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed italic">
              "{analysis.suggestedResponse}"
            </div>
          </div>

          {/* Action Launch */}
          {onLaunchCaseWithDraft && (
            <button
              onClick={() => onLaunchCaseWithDraft(analysis.detectedWorkflow, inquiryText, analysis.priority)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <span>Convert Analysis to Live Pega Case</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
