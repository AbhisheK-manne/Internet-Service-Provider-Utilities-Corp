export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  serviceAddress: string;
  serviceType: 'Electric Grid' | 'Fiber Internet' | 'Natural Gas' | 'Dual Fuel & Fiber';
  meterId: string;
  substation: string;
  ratePlan: string;
  isSpecialNeeds: boolean;
}

export type PersonaType = 
  | 'csr' 
  | 'customer' 
  | 'field_technician' 
  | 'billing_specialist' 
  | 'service_manager' 
  | 'control_agent';

export interface PersonaInfo {
  id: PersonaType;
  title: string;
  role: string;
  channel: string;
  avatarBg: string;
  description: string;
  capabilities: string[];
}

export type CaseStage = 
  | 'initial_categorization' 
  | 'priority_assessment' 
  | 'expert_assignment' 
  | 'resolution_delivery' 
  | 'satisfaction_verification' 
  | 'resolved';

export interface StageDefinition {
  id: CaseStage;
  label: string;
  order: number;
  description: string;
  typicalSlaHours: number;
}

export type WorkflowType =
  | 'service_outage_report'
  | 'billing_inquiry'
  | 'new_service_request'
  | 'maintenance_scheduling'
  | 'customer_feedback_handling'
  | 'account_update_request'
  | 'complaint_resolution'
  | 'meter_reading_adjustment'
  | 'payment_arrangement_plan'
  | 'service_restoration_coordination'
  | 'energy_efficiency_consultation'
  | 'special_needs_notification'
  | 'field_technician_dispatch'
  | 'onsite_issue_resolution'
  | 'self_service_inquiry'
  | 'regulatory_audit_response';

export interface WorkflowMetadata {
  id: WorkflowType;
  title: string;
  category: 'Critical Operations' | 'Customer Care' | 'Billing & Finance' | 'Field & Assets' | 'Compliance';
  icon: string;
  defaultPriority: 'Low' | 'Medium' | 'High' | 'Critical';
  targetSlaGoalMinutes: number;
  targetSlaDeadlineMinutes: number;
  primaryPersona: PersonaType;
  description: string;
  requiredDataObjects: string[];
  stages: {
    stage: CaseStage;
    actions: string[];
    decisionGate?: string;
  }[];
}

export type DataObjectType =
  | 'Contact'
  | 'Consumer Account'
  | 'Business Account'
  | 'Service Account'
  | 'Asset'
  | 'Location'
  | 'Transaction'
  | 'Statement'
  | 'Appointment'
  | 'Product';

export interface DataObjectRecord {
  id: string;
  objectType: DataObjectType;
  name: string;
  systemOfRecord: 'Pega(Local)';
  details: Record<string, string | number | boolean>;
  updatedAt: string;
}

export interface CaseRecord {
  id: string; // e.g. CAS-1042
  workflowType: WorkflowType;
  title: string;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  accountNumber: string;
  serviceAddress: string;
  serviceType: 'Electric Grid' | 'Fiber Internet' | 'Natural Gas' | 'Dual Fuel & Fiber';
  currentStage: CaseStage;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: 'Very Negative' | 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number; // -1.0 to 1.0
  assignedPersona: PersonaType;
  assignedToName: string;
  createdAt: string;
  updatedAt: string;
  slaGoalMinutes: number;
  slaDeadlineMinutes: number;
  elapsedMinutes: number;
  isSpecialNeeds: boolean;
  linkedAssetId?: string;
  linkedOutageId?: string;
  automatedResponseSuggestion?: string;
  activityHistory: {
    id: string;
    stage: CaseStage;
    timestamp: string;
    author: string;
    role: string;
    message: string;
    type: 'system' | 'note' | 'transition' | 'ai_suggestion' | 'customer_input';
  }[];
  resolutionNotes?: string;
  satisfactionRating?: number; // 1-5
  satisfactionFeedback?: string;
}

export interface OutageGridZone {
  id: string;
  zoneName: string;
  gridSector: string;
  status: 'Investigating' | 'Dispatched' | 'Crews Onsite' | 'Restoration In Progress' | 'Restored';
  severity: 'Critical' | 'Major' | 'Minor';
  affectedCustomers: number;
  cause: string;
  estimatedRestorationTime: string;
  startTime: string;
  leadTechnician: string;
  substation: string;
  lat: number;
  lng: number;
}
