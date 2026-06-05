import type { LucideIcon } from 'lucide-react';

export type TrendPoint = {
  day: string;
  date: Date;
  stress: number;
  workload: number;
};

export type BurnoutLevel = 'Low' | 'Medium' | 'High';

export type EntryInput = {
  date: Date;
  stress: number;
  workload: number;
  sleepHours: number;
  energy: number;
  createdAt: Date;
};

export type Entry = EntryInput & {
  _id?: string;
  burnoutScore: number;
  burnoutLevel: BurnoutLevel;
};

export type InsightGroups = {
  today: string[];
  trend: string[];
  weekly: string[];
  advanced: string[];
};

export type InsightsResponse = {
  message?: string;
  today: {
    stress: number | null;
    sleep: number | null;
    energy: number | null;
    burnoutScore: number | null;
    burnoutLevel: BurnoutLevel | null;
  };
  averages: {
    last2DaysStress: number;
    last7DaysStress: number;
    last7DaysEnergy: number;
    last7DaysBurnout: number;
  };
  insights: InsightGroups;
};

export type Recommendation = {
  title: string;
  description: string;
  variant: 'focus' | 'sleep' | 'energy' | 'recovery' | 'steady';
  Icon: LucideIcon;
};
