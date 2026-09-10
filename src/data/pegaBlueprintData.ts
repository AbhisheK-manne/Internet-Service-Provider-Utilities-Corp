import { 
  PersonaInfo, 
  WorkflowMetadata, 
  StageDefinition, 
  CaseRecord, 
  DataObjectRecord,
  OutageGridZone
} from '../types';

export const BLUEPRINT_META = {
  id: 'BP-2447035',
  organization: 'Internet Service Provider & Utilities Corp',
  industry: 'Energy & Utilities',
  industrySubsegment: 'Utilities & Telecom',
  language: 'English',
  platformVersion: 'Pega Infinity Customer Service 24.1',
  timestamp: '2026-09-10 10:49 AM'
};

export const STAGES: StageDefinition[] = [
  {
    id: 'initial_categorization',
    label: '1. Initial Categorization',
    order: 1,
    description: 'Channel ingestion, customer identification, natural language topic mapping & sentiment tag.',
    typicalSlaHours: 0.5
  },
  {
    id: 'priority_assessment',
    label: '2. Priority Assessment',
    order: 2,
    description: 'Urgency calculation based on safety, outages, VIP accounts, and life-support special needs.',
    typicalSlaHours: 1.0
  },
  {
    id: 'expert_assignment',
    label: '3. Expert Assignment',
    order: 3,
    description: 'Skills-based routing to Tier-2 CSR, Billing Specialist, Dispatch Desk, or Field Operations.',
    typicalSlaHours: 2.0
  },
  {
    id: 'resolution_delivery',
    label: '4. Resolution Delivery',
    order: 4,
    description: 'Execution of corrective actions, field dispatch, billing credit adjustments, or line repairs.',
    typicalSlaHours: 4.0
  },
  {
    id: 'satisfaction_verification',
    label: '5. Satisfaction Verification',
    order: 5,
    description: 'Multi-channel customer closure verification, NPS/CSAT capture, and regulatory SLA sign-off.',
    typicalSlaHours: 12.0
  }
];

export const PERSONAS: PersonaInfo[] = [
  {
    id: 'csr',
    title: 'Customer Service Representative',
    role: 'Frontline Customer Engagement',
    channel: 'Omnichannel Agent Desktop (Voice / Chat / Email / Web)',
    avatarBg: 'bg-blue-600',
    description: 'Handles high-volume customer inquiries, intake routing, immediate troubleshooting, and case creation.',
    capabilities: ['Omnichannel Intake', 'Create Cases', 'Trigger AI Response', 'Account Lookup', 'Transition to Specialist']
  },
  {
    id: 'customer',
    title: 'Utility Customer',
    role: 'Self-Service Consumer / Business',
    channel: 'Web Self-Service Portal & Mobile App',
    avatarBg: 'bg-emerald-600',
    description: 'Reports outages, views billing statements, checks restoration ETA, and books technician slots.',
    capabilities: ['Submit Outage', 'Track Case Status', 'Request Payment Plan', 'Book Service Appointment', 'Rate Service']
  },
  {
    id: 'field_technician',
    title: 'Field Technician',
    role: 'Grid & Network Field Crew',
    channel: 'Pega Mobile Field Client / Rugged Tablet',
    avatarBg: 'bg-amber-600',
    description: 'Dispatched to substations, feeder lines, transformers, fiber splice points, and customer premises.',
    capabilities: ['Accept Work Orders', 'Update Restoration ETA', 'Asset Diagnostic Log', 'Mark Onsite Resolution']
  },
  {
    id: 'billing_specialist',
    title: 'Billing Specialist',
    role: 'Revenue & Tariff Operations',
    channel: 'Back-Office Financial Console',
    avatarBg: 'bg-indigo-600',
    description: 'Manages complex tariff discrepancies, meter reading adjustments, disputes, and payment arrangements.',
    capabilities: ['Audit Meter Dials', 'Authorize Billing Credit', 'Structure 12-Mo Payment Plan', 'Waive Late Penalties']
  },
  {
    id: 'service_manager',
    title: 'Service Manager',
    role: 'Operations & SLA Supervisor',
    channel: 'Executive Command & Operations Cockpit',
    avatarBg: 'bg-rose-600',
    description: 'Monitors real-time queue health, SLA breach risks, crew utilization, and regulatory compliance.',
    capabilities: ['Reassign Stalled Cases', 'Escalate Priority', 'Grid Outage Override', 'View SLA & NPS Analytics']
  },
  {
    id: 'control_agent',
    title: 'Application Control Agent',
    role: 'System Automation & Compliance Auditor',
    channel: 'Automated Bot & Compliance Pipeline',
    avatarBg: 'bg-purple-600',
    description: 'Oversees automated decision engines, regulatory audit responses, automated notification triggers, and data integrity.',
    capabilities: ['Execute Auto-Rules', 'Export Regulatory Filing', 'Audit Trail Inspector', 'System Health Check']
  }
];

export const WORKFLOWS: WorkflowMetadata[] = [
  {
    id: 'service_outage_report',
    title: 'Service Outage Report',
    category: 'Critical Operations',
    icon: 'Zap',
    defaultPriority: 'Critical',
    targetSlaGoalMinutes: 30,
    targetSlaDeadlineMinutes: 120,
    primaryPersona: 'customer',
    description: 'Rapid intake of power grid failure or optical broadband network blackouts with automated cluster matching.',
    requiredDataObjects: ['Location', 'Asset', 'Service Account', 'Contact'],
    stages: [
      { stage: 'initial_categorization', actions: ['Check grid sector telemetry', 'Cluster with adjacent reports', 'Verify meter ping'] },
      { stage: 'priority_assessment', actions: ['Assess medical life-support flag', 'Determine affected customer count', 'Set priority to Critical'] },
      { stage: 'expert_assignment', actions: ['Route to Grid Dispatcher Desk', 'Auto-assign nearest field crew'] },
      { stage: 'resolution_delivery', actions: ['Substation switch reset or cable repair', 'Confirm downstream voltage/light level', 'Broadcast customer SMS'] },
      { stage: 'satisfaction_verification', actions: ['Automated IVR/SMS power restored confirmation', 'Log outage incident archive'] }
    ]
  },
  {
    id: 'billing_inquiry',
    title: 'Billing Inquiry',
    category: 'Billing & Finance',
    icon: 'Receipt',
    defaultPriority: 'Medium',
    targetSlaGoalMinutes: 120,
    targetSlaDeadlineMinutes: 480,
    primaryPersona: 'billing_specialist',
    description: 'Investigation of unexplained spike in monthly kilowatt-hour or gigabyte bandwidth overage charges.',
    requiredDataObjects: ['Statement', 'Transaction', 'Consumer Account', 'Product'],
    stages: [
      { stage: 'initial_categorization', actions: ['Fetch recent statements', 'Compare historical 12-month baseline', 'Tag query category'] },
      { stage: 'priority_assessment', actions: ['Check disconnection notice status', 'Evaluate customer tier'] },
      { stage: 'expert_assignment', actions: ['Route to Tier-2 Billing Specialist if delta > $100'] },
      { stage: 'resolution_delivery', actions: ['Explain seasonal heating/cooling factor', 'Issue courtesy tariff adjustment if warranted'] },
      { stage: 'satisfaction_verification', actions: ['Issue revised statement copy', 'Capture customer understanding'] }
    ]
  },
  {
    id: 'new_service_request',
    title: 'New Service Request',
    category: 'Customer Care',
    icon: 'Sparkles',
    defaultPriority: 'Medium',
    targetSlaGoalMinutes: 240,
    targetSlaDeadlineMinutes: 1440,
    primaryPersona: 'csr',
    description: 'Provisioning new residential or commercial utility hookup, smart meter install, or gigabit fiber line turn-up.',
    requiredDataObjects: ['Consumer Account', 'Location', 'Product', 'Appointment'],
    stages: [
      { stage: 'initial_categorization', actions: ['Validate premises serviceability', 'Check existing drop line availability'] },
      { stage: 'priority_assessment', actions: ['Check requested move-in date', 'Schedule permit lead time'] },
      { stage: 'expert_assignment', actions: ['Assign to Field Installation Crew'] },
      { stage: 'resolution_delivery', actions: ['Physical meter/ONT connection', 'Signal verification test', 'Activate service account'] },
      { stage: 'satisfaction_verification', actions: ['Welcome pack dispatch', 'Welcome call verification'] }
    ]
  },
  {
    id: 'maintenance_scheduling',
    title: 'Maintenance Scheduling',
    category: 'Field & Assets',
    icon: 'CalendarClock',
    defaultPriority: 'Low',
    targetSlaGoalMinutes: 360,
    targetSlaDeadlineMinutes: 2880,
    primaryPersona: 'field_technician',
    description: 'Scheduled preventive maintenance on neighborhood transformers, fiber nodes, and smart meter firmware.',
    requiredDataObjects: ['Asset', 'Location', 'Appointment'],
    stages: [
      { stage: 'initial_categorization', actions: ['Check asset lifecycle schedule', 'Identify affected feeder circuit'] },
      { stage: 'priority_assessment', actions: ['Assess commercial customer impact', 'Verify weather conditions'] },
      { stage: 'expert_assignment', actions: ['Assign certified High Voltage / Splicer crew'] },
      { stage: 'resolution_delivery', actions: ['Execute safe maintenance tag-out', 'Replace components', 'Test grid stability'] },
      { stage: 'satisfaction_verification', actions: ['Log asset health in Pega Local Asset registry', 'Close work order'] }
    ]
  },
  {
    id: 'customer_feedback_handling',
    title: 'Customer Feedback Handling',
    category: 'Customer Care',
    icon: 'MessageSquareHeart',
    defaultPriority: 'Low',
    targetSlaGoalMinutes: 180,
    targetSlaDeadlineMinutes: 720,
    primaryPersona: 'csr',
    description: 'Review of customer compliments, process suggestions, or post-restoration experience ratings.',
    requiredDataObjects: ['Contact', 'Consumer Account'],
    stages: [
      { stage: 'initial_categorization', actions: ['Sentiment parsing via NLP', 'Tag operational team touched'] },
      { stage: 'priority_assessment', actions: ['Check for latent escalation triggers'] },
      { stage: 'expert_assignment', actions: ['Route to Customer Experience Team'] },
      { stage: 'resolution_delivery', actions: ['Send personalized acknowledgment', 'Feed insight to Service Manager'] },
      { stage: 'satisfaction_verification', actions: ['Archive feedback record'] }
    ]
  },
  {
    id: 'account_update_request',
    title: 'Account Update Request',
    category: 'Customer Care',
    icon: 'UserCog',
    defaultPriority: 'Low',
    targetSlaGoalMinutes: 60,
    targetSlaDeadlineMinutes: 240,
    primaryPersona: 'csr',
    description: 'Updating primary billing address, authorized account contacts, bank auto-debit, or contact preferences.',
    requiredDataObjects: ['Contact', 'Consumer Account', 'Business Account'],
    stages: [
      { stage: 'initial_categorization', actions: ['2FA identity verification', 'Audit requested profile field change'] },
      { stage: 'priority_assessment', actions: ['Confirm no fraudulent flag is pending'] },
      { stage: 'expert_assignment', actions: ['Automated system processing'] },
      { stage: 'resolution_delivery', actions: ['Commit change to Pega Local SoR', 'Send security alert email'] },
      { stage: 'satisfaction_verification', actions: ['Customer acknowledgment receipt'] }
    ]
  },
  {
    id: 'complaint_resolution',
    title: 'Complaint Resolution',
    category: 'Customer Care',
    icon: 'AlertCircle',
    defaultPriority: 'High',
    targetSlaGoalMinutes: 90,
    targetSlaDeadlineMinutes: 360,
    primaryPersona: 'service_manager',
    description: 'Escalated dispute concerning repeated outages, customer service grievance, or property damage during line works.',
    requiredDataObjects: ['Consumer Account', 'Contact', 'Statement', 'Appointment'],
    stages: [
      { stage: 'initial_categorization', actions: ['Log formal complaint narrative', 'Link historical case occurrences'] },
      { stage: 'priority_assessment', actions: ['Assess ombudsman or legal escalation risk', 'Assign High priority'] },
      { stage: 'expert_assignment', actions: ['Assign to Senior Escalations Manager'] },
      { stage: 'resolution_delivery', actions: ['Direct manager contact with customer', 'Remediation plan and compensation offer'] },
      { stage: 'satisfaction_verification', actions: ['Obtain written customer settlement agreement', 'Execute root cause analysis'] }
    ]
  },
  {
    id: 'meter_reading_adjustment',
    title: 'Meter Reading Adjustment',
    category: 'Billing & Finance',
    icon: 'Gauge',
    defaultPriority: 'Medium',
    targetSlaGoalMinutes: 120,
    targetSlaDeadlineMinutes: 480,
    primaryPersona: 'billing_specialist',
    description: 'Adjustment for estimated meter readings versus actual smart meter telemetric or customer-submitted photo readings.',
    requiredDataObjects: ['Asset', 'Statement', 'Service Account'],
    stages: [
      { stage: 'initial_categorization', actions: ['Inspect meter serial number', 'Compare telemetry delta'] },
      { stage: 'priority_assessment', actions: ['Check if estimated bill triggered payment bounce'] },
      { stage: 'expert_assignment', actions: ['Route to Billing Quality Analyst'] },
      { stage: 'resolution_delivery', actions: ['Recalculate kilowatt/cubic-meter usage', 'Issue corrected billing statement'] },
      { stage: 'satisfaction_verification', actions: ['Confirm ledger sync with customer'] }
    ]
  },
  {
    id: 'payment_arrangement_plan',
    title: 'Payment Arrangement Plan',
    category: 'Billing & Finance',
    icon: 'CreditCard',
    defaultPriority: 'Medium',
    targetSlaGoalMinutes: 60,
    targetSlaDeadlineMinutes: 240,
    primaryPersona: 'billing_specialist',
    description: 'Structuring customized payment schedule or deferred installments for overdue balance to prevent shutoff.',
    requiredDataObjects: ['Consumer Account', 'Transaction', 'Statement'],
    stages: [
      { stage: 'initial_categorization', actions: ['Fetch total overdue balance and past arrangement adherence'] },
      { stage: 'priority_assessment', actions: ['Pause pending disconnect work orders immediately'] },
      { stage: 'expert_assignment', actions: ['Assess income eligibility criteria or automated formula'] },
      { stage: 'resolution_delivery', actions: ['Create 3-6-12 month installment schedule', 'Customer e-signature agreement'] },
      { stage: 'satisfaction_verification', actions: ['First installment confirmation notice'] }
    ]
  },
  {
    id: 'service_restoration_coordination',
    title: 'Service Restoration Coordination',
    category: 'Critical Operations',
    icon: 'Flame',
    defaultPriority: 'Critical',
    targetSlaGoalMinutes: 45,
    targetSlaDeadlineMinutes: 180,
    primaryPersona: 'service_manager',
    description: 'Inter-departmental command orchestrating emergency field crews, public safety teams, and tree-trimming units.',
    requiredDataObjects: ['Location', 'Asset', 'Appointment'],
    stages: [
      { stage: 'initial_categorization', actions: ['Tag circuit hazard level', 'Identify downstream substations'] },
      { stage: 'priority_assessment', actions: ['Check critical infrastructure (Hospitals, water pumps)'] },
      { stage: 'expert_assignment', actions: ['Assign Incident Commander and Lead Linemen'] },
      { stage: 'resolution_delivery', actions: ['Safety isolation, line clearance, re-energization phase 1 & 2'] },
      { stage: 'satisfaction_verification', actions: ['Verify 100% smart meter heartbeat pings', 'Archive event log'] }
    ]
  },
  {
    id: 'energy_efficiency_consultation',
    title: 'Energy Efficiency Consultation',
    category: 'Customer Care',
    icon: 'Leaf',
    defaultPriority: 'Low',
    targetSlaGoalMinutes: 480,
    targetSlaDeadlineMinutes: 2880,
    primaryPersona: 'csr',
    description: 'Advising customers on heat pump rebates, solar net-metering tariffs, smart thermostats, and off-peak charging.',
    requiredDataObjects: ['Product', 'Consumer Account', 'Statement'],
    stages: [
      { stage: 'initial_categorization', actions: ['Analyze 12-month load curve and hourly usage spikes'] },
      { stage: 'priority_assessment', actions: ['Evaluate government rebate qualification'] },
      { stage: 'expert_assignment', actions: ['Route to Clean Energy Advisor'] },
      { stage: 'resolution_delivery', actions: ['Deliver tailored Energy Optimization Report with $ savings'] },
      { stage: 'satisfaction_verification', actions: ['Follow-up consultation rating'] }
    ]
  },
  {
    id: 'special_needs_notification',
    title: 'Special Needs Notification',
    category: 'Compliance',
    icon: 'ShieldAlert',
    defaultPriority: 'Critical',
    targetSlaGoalMinutes: 30,
    targetSlaDeadlineMinutes: 60,
    primaryPersona: 'csr',
    description: 'Registration of medical life-support equipment (oxygen concentrators, dialysis) requiring zero disconnection.',
    requiredDataObjects: ['Contact', 'Consumer Account', 'Service Account'],
    stages: [
      { stage: 'initial_categorization', actions: ['Collect medical certificate & attending physician verification'] },
      { stage: 'priority_assessment', actions: ['Flag account as Protected Life Support - No Disconnect Allowed'] },
      { stage: 'expert_assignment', actions: ['Review by Compliance Officer'] },
      { stage: 'resolution_delivery', actions: ['Apply permanent priority grid restoration flag', 'Provide emergency backup kit guidance'] },
      { stage: 'satisfaction_verification', actions: ['Send official certification letter to customer'] }
    ]
  },
  {
    id: 'field_technician_dispatch',
    title: 'Field Technician Dispatch',
    category: 'Field & Assets',
    icon: 'Truck',
    defaultPriority: 'High',
    targetSlaGoalMinutes: 60,
    targetSlaDeadlineMinutes: 240,
    primaryPersona: 'field_technician',
    description: 'Real-time assignment and vehicle tracking for physical onsite inspection, cable repair, or meter replacement.',
    requiredDataObjects: ['Appointment', 'Asset', 'Location', 'Service Account'],
    stages: [
      { stage: 'initial_categorization', actions: ['Determine required technical skill & vehicle inventory'] },
      { stage: 'priority_assessment', actions: ['Calculate proximity and estimated time of arrival'] },
      { stage: 'expert_assignment', actions: ['Dispatch nearest certified technician via GPS'] },
      { stage: 'resolution_delivery', actions: ['Onsite arrival, diagnostic probe, physical fix'] },
      { stage: 'satisfaction_verification', actions: ['Customer physical signoff on technician tablet'] }
    ]
  },
  {
    id: 'onsite_issue_resolution',
    title: 'Onsite Issue Resolution',
    category: 'Field & Assets',
    icon: 'Wrench',
    defaultPriority: 'High',
    targetSlaGoalMinutes: 90,
    targetSlaDeadlineMinutes: 300,
    primaryPersona: 'field_technician',
    description: 'Field diagnostic protocol, hardware replacement, fiber OTDR testing, and premise safety clearance.',
    requiredDataObjects: ['Asset', 'Location', 'Appointment'],
    stages: [
      { stage: 'initial_categorization', actions: ['Perform initial hazard inspection'] },
      { stage: 'priority_assessment', actions: ['Check if upstream feed needs isolation'] },
      { stage: 'expert_assignment', actions: ['Confirm work assignment authorization'] },
      { stage: 'resolution_delivery', actions: ['Replace faulty circuit breaker / fiber terminal', 'Verify signal parameters'] },
      { stage: 'satisfaction_verification', actions: ['Customer demonstration of working power/internet'] }
    ]
  },
  {
    id: 'self_service_inquiry',
    title: 'Self-Service Inquiry',
    category: 'Customer Care',
    icon: 'Bot',
    defaultPriority: 'Low',
    targetSlaGoalMinutes: 15,
    targetSlaDeadlineMinutes: 60,
    primaryPersona: 'customer',
    description: 'Automated self-service inquiries routed from web/mobile with instant AI knowledge lookup and seamless CSR escalation.',
    requiredDataObjects: ['Contact', 'Consumer Account', 'Product'],
    stages: [
      { stage: 'initial_categorization', actions: ['Natural language inquiry classification via AI'] },
      { stage: 'priority_assessment', actions: ['Check if customer is satisfied with automated response'] },
      { stage: 'expert_assignment', actions: ['If unsolved, seamlessly bridge chat context to human CSR'] },
      { stage: 'resolution_delivery', actions: ['CSR provides personalized resolution without asking to repeat context'] },
      { stage: 'satisfaction_verification', actions: ['One-click resolution survey'] }
    ]
  },
  {
    id: 'regulatory_audit_response',
    title: 'Regulatory Audit Response',
    category: 'Compliance',
    icon: 'FileCheck',
    defaultPriority: 'Medium',
    targetSlaGoalMinutes: 480,
    targetSlaDeadlineMinutes: 1440,
    primaryPersona: 'control_agent',
    description: 'Compiling state public utilities commission (PUC) compliance reporting, outage logs, and SLA response data.',
    requiredDataObjects: ['Consumer Account', 'Statement', 'Asset', 'Transaction'],
    stages: [
      { stage: 'initial_categorization', actions: ['Ingest regulatory request docket number'] },
      { stage: 'priority_assessment', actions: ['Identify reporting statutory deadline'] },
      { stage: 'expert_assignment', actions: ['Assign to Legal & Regulatory Affairs Officer'] },
      { stage: 'resolution_delivery', actions: ['Auto-generate verified audit report packet with cryptographic audit hashes'] },
      { stage: 'satisfaction_verification', actions: ['Formal filing confirmation from regulator'] }
    ]
  }
];

export const INITIAL_DATA_OBJECTS: DataObjectRecord[] = [
  {
    id: 'DO-CONT-01',
    objectType: 'Contact',
    name: 'Elena Rostova',
    systemOfRecord: 'Pega(Local)',
    details: {
      phone: '+1 (555) 234-8901',
      email: 'elena.rostova@gmail.com',
      preferredChannel: 'SMS & Email',
      language: 'English',
      isPrimaryAccountHolder: true,
      hasLifeSupportRegistry: true
    },
    updatedAt: '2026-09-09 14:20'
  },
  {
    id: 'DO-CONT-02',
    objectType: 'Contact',
    name: 'Marcus Vance',
    systemOfRecord: 'Pega(Local)',
    details: {
      phone: '+1 (555) 789-3321',
      email: 'marcus.vance@techhub.io',
      preferredChannel: 'Mobile App Push',
      language: 'English',
      isPrimaryAccountHolder: true,
      hasLifeSupportRegistry: false
    },
    updatedAt: '2026-09-08 11:15'
  },
  {
    id: 'DO-CONS-01',
    objectType: 'Consumer Account',
    name: 'ACCT-RES-882194',
    systemOfRecord: 'Pega(Local)',
    details: {
      customerName: 'Elena Rostova',
      serviceType: 'Dual Fuel & Fiber',
      creditRating: 'Tier A (Excellent)',
      balance: '$148.50',
      status: 'Active',
      specialNeedsProtected: true
    },
    updatedAt: '2026-09-09 16:30'
  },
  {
    id: 'DO-BIZ-01',
    objectType: 'Business Account',
    name: 'ACCT-BIZ-409122',
    systemOfRecord: 'Pega(Local)',
    details: {
      businessName: 'Apex Data Labs LLC',
      contactPerson: 'David Chen',
      serviceTier: 'Dedicated 10Gbps Fiber & 3-Phase Commercial Electric',
      monthlyCommitment: '$2,450.00',
      status: 'Active',
      slaGuarantee: '99.99% Uptime with 1-Hour Restoration'
    },
    updatedAt: '2026-09-07 09:40'
  },
  {
    id: 'DO-SERV-01',
    objectType: 'Service Account',
    name: 'SRV-GRID-77102',
    systemOfRecord: 'Pega(Local)',
    details: {
      gridSector: 'Metro North - Sector 4B',
      feederLine: 'FDR-North-12B',
      substation: 'Pine Valley Primary Substation #3',
      transformerId: 'XFMR-892',
      meterConnectionType: 'Smart AMI Bidirectional'
    },
    updatedAt: '2026-09-09 18:00'
  },
  {
    id: 'DO-ASSET-01',
    objectType: 'Asset',
    name: 'Smart Meter AMI-9941-X',
    systemOfRecord: 'Pega(Local)',
    details: {
      serialNumber: 'SN-AMI-9941829',
      firmwareVersion: 'v4.18.2-secure',
      lastTelemetryPing: '2 mins ago (Heartbeat OK)',
      voltageReading: '121.4 V',
      assetStatus: 'Operational',
      installDate: '2024-03-15'
    },
    updatedAt: '2026-09-09 22:30'
  },
  {
    id: 'DO-ASSET-02',
    objectType: 'Asset',
    name: 'Optical Network Terminal ONT-500G',
    systemOfRecord: 'Pega(Local)',
    details: {
      serialNumber: 'SN-ONT-882190',
      opticalRxPower: '-18.4 dBm (Healthy)',
      downstreamRate: '1000 Mbps',
      upstreamRate: '1000 Mbps',
      assetStatus: 'Signal Degraded / Fiber Splice Warning',
      installDate: '2025-01-10'
    },
    updatedAt: '2026-09-09 21:10'
  },
  {
    id: 'DO-LOC-01',
    objectType: 'Location',
    name: '742 Evergreen Terrace, Sector 4B',
    systemOfRecord: 'Pega(Local)',
    details: {
      addressLine1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zipCode: '97477',
      gisCoordinates: '44.0462° N, 123.0220° W',
      premiseType: 'Single Family Residential'
    },
    updatedAt: '2026-09-09 10:00'
  },
  {
    id: 'DO-TXN-01',
    objectType: 'Transaction',
    name: 'TXN-PAY-551920',
    systemOfRecord: 'Pega(Local)',
    details: {
      accountNumber: 'ACCT-RES-882194',
      type: 'Electronic Auto-Debit',
      amount: '$148.50',
      paymentStatus: 'Processed & Cleared',
      date: '2026-08-28 04:00'
    },
    updatedAt: '2026-08-28 04:05'
  },
  {
    id: 'DO-STMT-01',
    objectType: 'Statement',
    name: 'STMT-AUG-2026',
    systemOfRecord: 'Pega(Local)',
    details: {
      accountNumber: 'ACCT-RES-882194',
      billingPeriod: 'Aug 01, 2026 - Aug 31, 2026',
      totalEnergyKWh: '842 kWh',
      fiberBroadbandData: '1.2 TB',
      netBilled: '$148.50',
      dueDate: '2026-09-18'
    },
    updatedAt: '2026-09-01 00:00'
  },
  {
    id: 'DO-APPT-01',
    objectType: 'Appointment',
    name: 'APPT-TECH-0418',
    systemOfRecord: 'Pega(Local)',
    details: {
      technicianName: 'Dave Miller (Crew Lead 04)',
      date: '2026-09-10',
      timeWindow: '08:00 AM - 12:00 PM',
      purpose: 'Fiber Splice Optimization & Smart Inverter Inspection',
      status: 'Confirmed & En Route'
    },
    updatedAt: '2026-09-09 17:45'
  },
  {
    id: 'DO-PROD-01',
    objectType: 'Product',
    name: 'CleanGrid 100% Solar + GigSpeed Fiber',
    systemOfRecord: 'Pega(Local)',
    details: {
      planCode: 'DUAL-GREEN-GIG',
      energyRate: '$0.142 / kWh (Fixed Peak Cap)',
      broadbandSpeed: '1000 Mbps Symmetrical Fiber',
      ecoBonusEligible: true,
      serviceTier: 'Premium Residential'
    },
    updatedAt: '2026-08-15 08:00'
  }
];

export const INITIAL_OUTAGES: OutageGridZone[] = [
  {
    id: 'OUT-9921',
    zoneName: 'Metro North Substation 4B',
    gridSector: 'Sector 4B & West Hills',
    status: 'Crews Onsite',
    severity: 'Major',
    affectedCustomers: 1420,
    cause: 'Downed tree limb on 24kV feeder line during wind gusts',
    estimatedRestorationTime: 'Today at 01:30 AM',
    startTime: '2026-09-09 20:45',
    leadTechnician: 'Dave Miller (Unit 12)',
    substation: 'North Metro Substation #4',
    lat: 44.058,
    lng: -123.035
  },
  {
    id: 'OUT-9922',
    zoneName: 'Industrial Corridor Hub 8',
    gridSector: 'East River Industrial Zone',
    status: 'Restoration In Progress',
    severity: 'Critical',
    affectedCustomers: 380,
    cause: 'Fiber conduit severed by third-party municipal excavation',
    estimatedRestorationTime: 'Today at 03:00 AM',
    startTime: '2026-09-09 21:10',
    leadTechnician: 'Sarah Jenkins (Optics Crew 7)',
    substation: 'Riverfront Distribution Hub',
    lat: 44.041,
    lng: -123.009
  },
  {
    id: 'OUT-9923',
    zoneName: 'South Oak Residential Cluster',
    gridSector: 'South Substation Feeder 2',
    status: 'Investigating',
    severity: 'Minor',
    affectedCustomers: 45,
    cause: 'Blown step-down pole transformer XFMR-411',
    estimatedRestorationTime: 'Today at 02:15 AM',
    startTime: '2026-09-09 22:05',
    leadTechnician: 'En Route (Truck #19)',
    substation: 'South Oak Substation #1',
    lat: 44.025,
    lng: -123.048
  }
];

export const INITIAL_CASES: CaseRecord[] = [
  {
    id: 'CAS-1042',
    workflowType: 'service_outage_report',
    title: 'Total Power Outage & Life-Support Equipment on Site',
    description: 'Customer reports complete power failure at residence. Medical oxygen concentrator is running on limited 2-hour backup battery.',
    customerName: 'Elena Rostova',
    customerPhone: '+1 (555) 234-8901',
    customerEmail: 'elena.rostova@gmail.com',
    accountNumber: 'ACCT-RES-882194',
    serviceAddress: '742 Evergreen Terrace, Sector 4B',
    serviceType: 'Electric Grid',
    currentStage: 'expert_assignment',
    priority: 'Critical',
    sentiment: 'Very Negative',
    sentimentScore: -0.92,
    assignedPersona: 'service_manager',
    assignedToName: 'Chief Dispatcher Vance',
    createdAt: '2026-09-09 21:15',
    updatedAt: '2026-09-09 22:20',
    slaGoalMinutes: 30,
    slaDeadlineMinutes: 120,
    elapsedMinutes: 65,
    isSpecialNeeds: true,
    linkedAssetId: 'DO-ASSET-01',
    linkedOutageId: 'OUT-9921',
    automatedResponseSuggestion: 'Priority medical advisory sent to field crew. Emergency battery reserve deployed; estimated feeder re-energization is within 45 minutes.',
    activityHistory: [
      {
        id: 'ACT-101',
        stage: 'initial_categorization',
        timestamp: '2026-09-09 21:15',
        author: 'Pega Intake Bot',
        role: 'Application Control Agent',
        message: 'Inbound emergency outage report ingested via Mobile Self-Service. Medical Life-Support tag detected on ACCT-RES-882194.',
        type: 'system'
      },
      {
        id: 'ACT-102',
        stage: 'priority_assessment',
        timestamp: '2026-09-09 21:20',
        author: 'Auto-Triage Engine',
        role: 'Pega Decision Rule',
        message: 'Priority escalated to CRITICAL due to medical equipment dependency. SLA timer initialized: Goal 30m, Deadline 120m.',
        type: 'system'
      },
      {
        id: 'ACT-103',
        stage: 'expert_assignment',
        timestamp: '2026-09-09 21:35',
        author: 'CSR Samantha Reed',
        role: 'Customer Service Representative',
        message: 'Directly patched to Grid Incident Commander and mobile field supervisor Dave Miller.',
        type: 'transition'
      }
    ]
  },
  {
    id: 'CAS-1043',
    workflowType: 'billing_inquiry',
    title: 'Unexplained $120 Spike on August Electric Statement',
    description: 'Customer claims normal summer air conditioning usage was maintained, but statement jumped from typical $85 to $205.',
    customerName: 'Marcus Vance',
    customerPhone: '+1 (555) 789-3321',
    customerEmail: 'marcus.vance@techhub.io',
    accountNumber: 'ACCT-RES-440182',
    serviceAddress: '1088 Willow Creek Way, Apt 3',
    serviceType: 'Dual Fuel & Fiber',
    currentStage: 'resolution_delivery',
    priority: 'Medium',
    sentiment: 'Negative',
    sentimentScore: -0.45,
    assignedPersona: 'billing_specialist',
    assignedToName: 'Helena Price (Billing Spec)',
    createdAt: '2026-09-09 18:30',
    updatedAt: '2026-09-09 21:50',
    slaGoalMinutes: 120,
    slaDeadlineMinutes: 480,
    elapsedMinutes: 230,
    isSpecialNeeds: false,
    linkedAssetId: 'DO-ASSET-01',
    automatedResponseSuggestion: 'Smart AMI telemetry confirms a continuous 1.8kW draw during Aug 12-15 heatwave. Courtesy $35 one-time off-peak adjustment and free home energy audit offered.',
    activityHistory: [
      {
        id: 'ACT-201',
        stage: 'initial_categorization',
        timestamp: '2026-09-09 18:30',
        author: 'Web Chatbot',
        role: 'Self-Service Channel',
        message: 'Customer initiated inquiry regarding billing dispute.',
        type: 'customer_input'
      },
      {
        id: 'ACT-202',
        stage: 'expert_assignment',
        timestamp: '2026-09-09 19:10',
        author: 'Router',
        role: 'System',
        message: 'Assigned to Helena Price (Senior Tariff Analyst).',
        type: 'transition'
      },
      {
        id: 'ACT-203',
        stage: 'resolution_delivery',
        timestamp: '2026-09-09 21:50',
        author: 'Helena Price',
        role: 'Billing Specialist',
        message: 'Audited hourly interval telemetry. Proposed structured $35 courtesy credit and enrollment in Time-of-Use tariff.',
        type: 'note'
      }
    ]
  },
  {
    id: 'CAS-1044',
    workflowType: 'new_service_request',
    title: 'Gigabit Fiber Line Installation for New Residence',
    description: 'Homeowner moving in on Sept 14 requests 1000Mbps symmetrical fiber drop and optical terminal installation.',
    customerName: 'Aria Montgomery',
    customerPhone: '+1 (555) 604-1289',
    customerEmail: 'aria.m@designstudio.net',
    accountNumber: 'ACCT-RES-910283',
    serviceAddress: '312 Orchard Ridge Road',
    serviceType: 'Fiber Internet',
    currentStage: 'expert_assignment',
    priority: 'Medium',
    sentiment: 'Positive',
    sentimentScore: 0.65,
    assignedPersona: 'csr',
    assignedToName: 'CSR Samantha Reed',
    createdAt: '2026-09-09 16:00',
    updatedAt: '2026-09-09 18:15',
    slaGoalMinutes: 240,
    slaDeadlineMinutes: 1440,
    elapsedMinutes: 380,
    isSpecialNeeds: false,
    automatedResponseSuggestion: 'Premise is pre-wired for optical drop. Appointment window booked for Sept 11, 09:00 AM - 11:00 AM with Tech Unit 4.',
    activityHistory: [
      {
        id: 'ACT-301',
        stage: 'initial_categorization',
        timestamp: '2026-09-09 16:00',
        author: 'Web Portal',
        role: 'Utility Customer',
        message: 'Application submitted for GigSpeed fiber with preferred install date.',
        type: 'customer_input'
      },
      {
        id: 'ACT-302',
        stage: 'priority_assessment',
        timestamp: '2026-09-09 16:45',
        author: 'System',
        role: 'Pega Rules Engine',
        message: 'Serviceability confirmed via GIS map check. Line pole drop span is under 80 meters.',
        type: 'system'
      }
    ]
  },
  {
    id: 'CAS-1045',
    workflowType: 'field_technician_dispatch',
    title: 'Substation Feeder Voltage Fluctuation & Sag',
    description: 'Telemetry alerts indicate voltage drop to 108V on Substation feeder 4B line during peak evening load.',
    customerName: 'Commercial Grid Ops Desk',
    customerPhone: '+1 (555) 900-3300',
    customerEmail: 'gridops@utilitycorp.internal',
    accountNumber: 'ACCT-BIZ-409122',
    serviceAddress: 'Feeder Junction 4B-11, West Industrial Park',
    serviceType: 'Electric Grid',
    currentStage: 'resolution_delivery',
    priority: 'High',
    sentiment: 'Neutral',
    sentimentScore: 0.05,
    assignedPersona: 'field_technician',
    assignedToName: 'Dave Miller (Crew Lead 04)',
    createdAt: '2026-09-09 20:00',
    updatedAt: '2026-09-09 22:15',
    slaGoalMinutes: 60,
    slaDeadlineMinutes: 240,
    elapsedMinutes: 140,
    isSpecialNeeds: false,
    linkedAssetId: 'DO-ASSET-01',
    automatedResponseSuggestion: 'Capacitor bank tap changer inspection required. Tap switch adjusted +2.5% to stabilize 120V nominal voltage.',
    activityHistory: [
      {
        id: 'ACT-401',
        stage: 'initial_categorization',
        timestamp: '2026-09-09 20:00',
        author: 'SCADA Telemetry Agent',
        role: 'Application Control Agent',
        message: 'Automated threshold violation: Voltage sag < 110V for 15 consecutive minutes.',
        type: 'system'
      },
      {
        id: 'ACT-402',
        stage: 'expert_assignment',
        timestamp: '2026-09-09 20:30',
        author: 'Dispatcher',
        role: 'Service Manager',
        message: 'Dispatched Heavy Grid Unit #4 Dave Miller.',
        type: 'transition'
      }
    ]
  },
  {
    id: 'CAS-1046',
    workflowType: 'payment_arrangement_plan',
    title: 'Deferred 6-Month Hardship Payment Arrangement',
    description: 'Customer requests spreading $420 overdue utility balance over next 6 billing cycles to avoid disconnection notice.',
    customerName: 'Julian Santos',
    customerPhone: '+1 (555) 441-9982',
    customerEmail: 'j.santos@freemail.org',
    accountNumber: 'ACCT-RES-772910',
    serviceAddress: '554 Maple Shade Ave',
    serviceType: 'Dual Fuel & Fiber',
    currentStage: 'satisfaction_verification',
    priority: 'Medium',
    sentiment: 'Neutral',
    sentimentScore: 0.2,
    assignedPersona: 'billing_specialist',
    assignedToName: 'Helena Price (Billing Spec)',
    createdAt: '2026-09-08 14:00',
    updatedAt: '2026-09-09 17:00',
    slaGoalMinutes: 60,
    slaDeadlineMinutes: 240,
    elapsedMinutes: 80,
    isSpecialNeeds: false,
    automatedResponseSuggestion: '6-month installment schedule of $70/mo active alongside regular bill. Disconnect hold placed through March 2027.',
    activityHistory: [
      {
        id: 'ACT-501',
        stage: 'initial_categorization',
        timestamp: '2026-09-08 14:00',
        author: 'Customer Self-Service',
        role: 'Utility Customer',
        message: 'Payment arrangement request submitted.',
        type: 'customer_input'
      },
      {
        id: 'ACT-502',
        stage: 'resolution_delivery',
        timestamp: '2026-09-08 15:10',
        author: 'Helena Price',
        role: 'Billing Specialist',
        message: 'Payment plan generated and agreed via digital signature.',
        type: 'note'
      },
      {
        id: 'ACT-503',
        stage: 'satisfaction_verification',
        timestamp: '2026-09-09 17:00',
        author: 'System',
        role: 'Application Control Agent',
        message: 'Customer verification SMS sent. Pending confirmation score.',
        type: 'system'
      }
    ]
  },
  {
    id: 'CAS-1047',
    workflowType: 'regulatory_audit_response',
    title: 'State Public Utilities Commission Q3 Outage Docket Response',
    description: 'Mandatory filing of major event storm outage statistics, restoration durations, and medical registry protections.',
    customerName: 'State PUC Regulatory Board',
    customerPhone: '+1 (555) 019-2844',
    customerEmail: 'dockets@puc.state.gov',
    accountNumber: 'REG-DOCK-2026-Q3',
    serviceAddress: 'Commission Headquarters, Capitol Mall',
    serviceType: 'Electric Grid',
    currentStage: 'resolution_delivery',
    priority: 'High',
    sentiment: 'Neutral',
    sentimentScore: 0.1,
    assignedPersona: 'control_agent',
    assignedToName: 'Compliance Bot & Legal Counsel',
    createdAt: '2026-09-07 09:00',
    updatedAt: '2026-09-09 14:00',
    slaGoalMinutes: 480,
    slaDeadlineMinutes: 1440,
    elapsedMinutes: 410,
    isSpecialNeeds: false,
    automatedResponseSuggestion: 'Compliance bundle generated with SHA-256 data integrity certification. 99.98% reliability rate reported.',
    activityHistory: [
      {
        id: 'ACT-601',
        stage: 'initial_categorization',
        timestamp: '2026-09-07 09:00',
        author: 'Compliance Agent',
        role: 'Application Control Agent',
        message: 'Quarterly PUC regulatory inquiry docket registered.',
        type: 'system'
      },
      {
        id: 'ACT-602',
        stage: 'resolution_delivery',
        timestamp: '2026-09-09 14:00',
        author: 'Control Agent',
        role: 'Application Control Agent',
        message: 'Compiled all 16 Pega workflow metrics and SLA performance logs.',
        type: 'note'
      }
    ]
  }
];

export const AI_SUGGESTION_TEMPLATES: Record<string, { sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Very Negative'; score: number; draft: string }> = {
  power_down_medical: {
    sentiment: 'Very Negative',
    score: -0.92,
    draft: 'PRIORITY MEDICAL ADVISORY: We have identified an active medical device registry on your premise. Field Unit #12 has been prioritized for your feeder line. Emergency battery pack dispatched if needed.'
  },
  billing_dispute: {
    sentiment: 'Negative',
    score: -0.45,
    draft: 'Thank you for reaching out regarding your recent bill. Our smart meter hourly analytics indicate unusually high consumption during the peak heatwave. We have prepared a $35 courtesy adjustment and can enroll you in our budget-leveling billing plan.'
  },
  new_fiber_line: {
    sentiment: 'Positive',
    score: 0.65,
    draft: 'Great news! Your service address has verified gigabit fiber line capability. We can dispatch a technician for standard turn-up as early as tomorrow morning between 9 AM and 11 AM.'
  },
  technician_onsite: {
    sentiment: 'Neutral',
    score: 0.05,
    draft: 'Field Technician Dave Miller is on-site at your local transformer junction. Signal diagnostic checks are currently in progress, and full restoration is estimated within 45 minutes.'
  }
};
