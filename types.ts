
export interface CategoryConfig {
  id: string;
  name: string;
  color: string; // Hex code
  icon?: string; // Icon name from lucide-react
  isDefault?: boolean;
  isFocus?: boolean; // General indicator for productive category
  defaultTags?: string[]; // Auto-populated tags when category is selected
  deepWorkTags?: string[]; // Specific tags that count as Deep Focus
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  impact?: number; // 1-10 score for importance/impact
  date: string; // ISO Date string YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  categoryId: string; // References CategoryConfig.id
  completed: boolean;
  tags?: string[];
}

export interface DailyLog {
  date: string; // ISO Date string YYYY-MM-DD
  score: number; // 1-5
  reflection: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
  avatar?: string;
}

export interface WeekTemplate {
  id: string;
  name: string;
  tasks: (Omit<Task, 'date' | 'id'> & { dayIndex: number })[]; // Tasks relative to start of week (index 0-6)
}

export interface DayStats {
  totalTasks: number;
  completedTasks: number;
  hoursByCategory: Record<string, number>;
}

export type TimeRange = 'Daily' | 'Weekly' | 'Monthly';