/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized server-side Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check & runtime status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    capabilities: ['MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API'],
    model: 'gemini-3.8-flash'
  });
});

// 2. Server-side Gemini AI Copilot Inquiry Analysis
app.post('/api/copilot/analyze', async (req: Request, res: Response) => {
  const { inquiry } = req.body;

  if (!inquiry || typeof inquiry !== 'string') {
    return res.status(400).json({ error: 'Inquiry string is required' });
  }

  const ai = getGeminiClient();

  // If Gemini API is available on server, execute model reasoning
  if (ai) {
    try {
      const prompt = `You are an expert AI Triage & Copilot Engine for GridFlow Utilities operating on Pega Blueprint BP-2447035 architecture.
Analyze the following customer inquiry or dispatch notice and classify it strictly into one of the 5 canonical Pega Blueprint Workflows:
1. "service_outage_report" (Power outages, blackouts, grid failure, flickering voltage, medical equipment without power)
2. "billing_inquiry" (High bill dispute, rate tariff, tariff calculation, invoice audit, meter billing questions)
3. "new_service_request" (New optical fiber hookup, electric meter installation, EV charger connection, premise setup)
4. "field_technician_dispatch" (Downed wires, sparking transformers, hazardous equipment, gas leak, physical meter inspection)
5. "payment_arrangement_plan" (Payment extension, hardship relief, budget payment plans, disconnection moratorium)
Or "self_service_inquiry" if purely informational.

Customer Inquiry: "${inquiry}"

Return a JSON object strictly matching this format (no markdown fences):
{
  "detectedWorkflow": "service_outage_report" | "billing_inquiry" | "new_service_request" | "field_technician_dispatch" | "payment_arrangement_plan" | "self_service_inquiry",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "sentiment": "Very Negative" | "Negative" | "Neutral" | "Positive",
  "score": -1.0 to 1.0 (number),
  "specialNeedsDetected": true | false,
  "suggestedResponse": "Empathetic, clear, and professional customer-facing response tailored to the utility scenario",
  "reasoning": "Short 1-2 sentence explanation of why this workflow and priority were selected",
  "agentKeyTakeaways": ["Key bullet point 1", "Key bullet point 2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({
        source: 'gemini-3.8-flash',
        ...parsed
      });
    } catch (err: any) {
      console.error('Server Gemini analysis error:', err);
      // Fallback to server heuristic
    }
  }

  // Resilient server-side heuristic fallback (when no key or rate-limited)
  const lower = inquiry.toLowerCase();
  let detectedWorkflow = 'self_service_inquiry';
  let priority = 'Medium';
  let sentiment = 'Neutral';
  let score = 0.0;
  let specialNeedsDetected = false;
  let suggestedResponse = '';

  if (lower.includes('oxygen') || lower.includes('life') || lower.includes('dialysis') || lower.includes('medical') || lower.includes('concentrator')) {
    specialNeedsDetected = true;
    priority = 'Critical';
    detectedWorkflow = 'service_outage_report';
    sentiment = 'Very Negative';
    score = -0.95;
    suggestedResponse = 'EMERGENCY NOTIFICATION ACKNOWLEDGED: We have registered an active medical life-support flag for your address. Lineman crew Unit #12 has been assigned high priority for your substation feeder. An auxiliary mobile battery pack has also been alerted to emergency response teams.';
  } else if (lower.includes('outage') || lower.includes('power out') || lower.includes('blackout') || lower.includes('no power') || lower.includes('dark')) {
    priority = 'Critical';
    detectedWorkflow = 'service_outage_report';
    sentiment = 'Negative';
    score = -0.75;
    suggestedResponse = 'We have logged your power outage report. SCADA telemetry indicates a trip at your local feeder circuit. Field crews are currently assessing line repairs with estimated restoration within 60-90 minutes.';
  } else if (lower.includes('hazard') || lower.includes('downed wire') || lower.includes('spark') || lower.includes('transformer')) {
    priority = 'High';
    detectedWorkflow = 'field_technician_dispatch';
    sentiment = 'Very Negative';
    score = -0.7;
    suggestedResponse = 'High hazard event logged. Public safety crews and mobile linemen have been dispatched for immediate containment and isolation.';
  } else if (lower.includes('bill') || lower.includes('charge') || lower.includes('statement') || lower.includes('expensive') || lower.includes('spike')) {
    priority = 'Medium';
    detectedWorkflow = 'billing_inquiry';
    sentiment = 'Negative';
    score = -0.45;
    suggestedResponse = 'Thank you for contacting us regarding your monthly statement. We can run an hourly smart meter interval audit to check for appliances drawing unexpected power during peak hours, and we can also review available budget-leveling billing plans.';
  } else if (lower.includes('fiber') || lower.includes('internet') || lower.includes('install') || lower.includes('gigabit') || lower.includes('broadband')) {
    priority = 'Medium';
    detectedWorkflow = 'new_service_request';
    sentiment = 'Positive';
    score = 0.55;
    suggestedResponse = 'We are excited to connect your premise with our symmetrical 1Gbps fiber network! Premise serviceability is confirmed; would you like to schedule an optical drop technician for this Thursday morning?';
  } else if (lower.includes('payment') || lower.includes('afford') || lower.includes('extension') || lower.includes('overdue')) {
    priority = 'Medium';
    detectedWorkflow = 'payment_arrangement_plan';
    sentiment = 'Neutral';
    score = -0.15;
    suggestedResponse = 'We understand unexpected financial hardships arise. We have customized deferred payment arrangement options available that immediately place a hold on all collection and disconnection notices.';
  } else {
    detectedWorkflow = 'self_service_inquiry';
    priority = 'Low';
    sentiment = 'Neutral';
    score = 0.1;
    suggestedResponse = 'Thank you for reaching out to GridFlow Utilities customer service. A specialist has reviewed your inquiry and is ready to assist you.';
  }

  return res.json({
    source: 'server-heuristic',
    detectedWorkflow,
    priority,
    sentiment,
    score,
    specialNeedsDetected,
    suggestedResponse,
    reasoning: 'Evaluated by server-side utility dispatch rules engine.',
    agentKeyTakeaways: [
      `Triage Classification: ${detectedWorkflow}`,
      specialNeedsDetected ? 'Critical Life-Support Premise Flagged' : 'Standard Premise Priority'
    ]
  });
});

// 3. Server-side Gemini Case Resolution Drafter & Dispatch Generator
app.post('/api/copilot/draft-resolution', async (req: Request, res: Response) => {
  const { caseId, customerName, workflowType, currentStage, priority, notes } = req.body;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are a utility customer service and field dispatch director for GridFlow Utilities.
Draft a professional, authoritative, and compassionate customer communication and internal field dispatch note for the following utility case:

Case ID: ${caseId || 'CASE-REQ'}
Customer: ${customerName || 'Account Holder'}
Workflow Type: ${workflowType || 'General Utility Service'}
Current Stage: ${currentStage || 'Active Review'}
Priority: ${priority || 'Medium'}
Additional Agent Context / Telemetry: "${notes || 'Normal dispatch workflow'}"

Return a JSON object strictly matching this format (no markdown):
{
  "customerSubject": "Email/SMS subject line",
  "customerMessage": "Formal yet reassuring message sent to the customer explaining current status, expected timeline, and actions taken",
  "fieldNotes": "Concise technical instructions for lineman, metering technicians, or billing analysts",
  "nextSuggestedStageAction": "Recommended next stage action in the Pega workflow"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return res.json({
        source: 'gemini-3.8-flash',
        ...parsed
      });
    } catch (err: any) {
      console.error('Server resolution generation error:', err);
    }
  }

  // Fallback draft
  return res.json({
    source: 'server-fallback',
    customerSubject: `Update Regarding GridFlow Utility Case ${caseId || 'Service Request'}`,
    customerMessage: `Dear ${customerName || 'Valued Customer'},\n\nWe are actively processing your ${workflowType || 'utility inquiry'}. Our engineering and customer operations team has verified your premise telemetry and scheduled the required workflow stage: "${currentStage}". You will receive continuous automated updates as milestones complete.`,
    fieldNotes: `Unit dispatch ordered. Verify AMI telemetry interval data and inspect substation distribution circuit. Maintain SLA requirements.`,
    nextSuggestedStageAction: 'Advance to field validation or customer resolution sign-off.'
  });
});

// 4. Server-side Case Summary Briefing
app.post('/api/copilot/summarize', async (req: Request, res: Response) => {
  const { caseData } = req.body;
  const ai = getGeminiClient();

  if (ai && caseData) {
    try {
      const prompt = `Summarize this Pega Blueprint utility case for an oncoming Customer Service Representative (CSR) shift change in 3 concise bullet points:
${JSON.stringify(caseData, null, 2)}

Return a JSON object:
{
  "executiveSummary": "1 sentence overview",
  "bulletPoints": ["Point 1", "Point 2", "Point 3"],
  "slaRiskAssessment": "Low" | "Medium" | "High"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ source: 'gemini-3.8-flash', ...parsed });
    } catch (err) {
      console.error('Gemini summarizer error:', err);
    }
  }

  return res.json({
    source: 'server-fallback',
    executiveSummary: `Case ${caseData?.id || 'Record'} is currently in stage ${caseData?.currentStage || 'active'}.`,
    bulletPoints: [
      `Assigned to ${caseData?.assignee || 'CSR Queue'} under ${caseData?.workflowType || 'Standard'} workflow.`,
      `Current Priority: ${caseData?.priority || 'Normal'} with SLA target active.`,
      `Customer: ${caseData?.customerName || 'Account Holder'} - ${caseData?.serviceAddress || 'Premise'}.`
    ],
    slaRiskAssessment: caseData?.priority === 'Critical' ? 'High' : 'Low'
  });
});

// ==========================================
// VITE SPA MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GridFlow Full-Stack Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[GridFlow Full-Stack Server] Gemini AI Engine: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Awaiting Key in Settings > Secrets'}`);
  });
}

startServer();
