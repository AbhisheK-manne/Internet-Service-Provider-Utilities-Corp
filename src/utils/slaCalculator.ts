import { CaseRecord, CaseStage } from '../types';

export function getSlaStatus(record: CaseRecord): {
  status: 'within_goal' | 'approaching_deadline' | 'breached_deadline';
  label: string;
  badgeClass: string;
  colorClass: string;
  percentage: number;
} {
  const { elapsedMinutes, slaGoalMinutes, slaDeadlineMinutes } = record;
  const pct = Math.min(100, Math.round((elapsedMinutes / slaDeadlineMinutes) * 100));

  if (elapsedMinutes > slaDeadlineMinutes) {
    return {
      status: 'breached_deadline',
      label: 'SLA Breached',
      badgeClass: 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900',
      colorClass: 'text-red-600',
      percentage: 100
    };
  }

  if (elapsedMinutes > slaGoalMinutes) {
    return {
      status: 'approaching_deadline',
      label: 'Approaching Deadline',
      badgeClass: 'bg-amber-500/10 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900',
      colorClass: 'text-amber-600',
      percentage: pct
    };
  }

  return {
    status: 'within_goal',
    label: 'On Target (Goal)',
    badgeClass: 'bg-emerald-500/10 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900',
    colorClass: 'text-emerald-600',
    percentage: pct
  };
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function getPriorityBadge(priority: 'Low' | 'Medium' | 'High' | 'Critical'): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    case 'High':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'Medium':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'Low':
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
  }
}

export function getStageOrder(stage: CaseStage): number {
  switch (stage) {
    case 'initial_categorization':
      return 1;
    case 'priority_assessment':
      return 2;
    case 'expert_assignment':
      return 3;
    case 'resolution_delivery':
      return 4;
    case 'satisfaction_verification':
      return 5;
    case 'resolved':
      return 6;
    default:
      return 1;
  }
}

export function getNextStage(current: CaseStage): CaseStage {
  switch (current) {
    case 'initial_categorization':
      return 'priority_assessment';
    case 'priority_assessment':
      return 'expert_assignment';
    case 'expert_assignment':
      return 'resolution_delivery';
    case 'resolution_delivery':
      return 'satisfaction_verification';
    case 'satisfaction_verification':
      return 'resolved';
    case 'resolved':
      return 'resolved';
  }
}

export function getSentimentBadge(sentiment: 'Very Negative' | 'Negative' | 'Neutral' | 'Positive'): {
  label: string;
  className: string;
} {
  switch (sentiment) {
    case 'Very Negative':
      return { label: 'High Distress', className: 'text-rose-700 bg-rose-50 border-rose-200' };
    case 'Negative':
      return { label: 'Dissatisfied', className: 'text-orange-700 bg-orange-50 border-orange-200' };
    case 'Neutral':
      return { label: 'Neutral', className: 'text-slate-700 bg-slate-50 border-slate-200' };
    case 'Positive':
      return { label: 'Satisfied', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
}
