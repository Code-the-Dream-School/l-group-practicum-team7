import type { LucideIcon } from 'lucide-react';

export type TrendPoint = {
  day: string;
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
  burnoutScore: number;
  burnoutLevel: BurnoutLevel;
};

export type Recommendation = {
  title: string;
  description: string;
  variant: 'focus' | 'sleep' | 'energy' | 'recovery' | 'steady';
  Icon: LucideIcon;
};
