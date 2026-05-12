import { BatteryLow, CircleCheck, Moon, Sparkles } from 'lucide-react';
import type { BurnoutLevel, Entry, EntryInput, Recommendation } from '../types/wellness';

export function getSleepScale(sleepHours: number) {
  const cappedHours = Math.min(sleepHours, 8);

  if (cappedHours < 5) {
    return 1;
  }

  if (cappedHours < 6) {
    return 2;
  }

  if (cappedHours < 7) {
    return 3;
  }

  if (cappedHours < 8) {
    return 4;
  }

  return 5;
}

export function getBurnoutLevel(score: number): BurnoutLevel {
  if (score <= 2) {
    return 'Low';
  }

  if (score <= 3.5) {
    return 'Medium';
  }

  return 'High';
}

export function calculateBurnoutScore(entry: EntryInput) {
  const sleepScale = getSleepScale(entry.sleepHours);
  const score =
    0.4 * entry.stress +
    0.3 * entry.workload +
    0.2 * (5 - sleepScale) +
    0.1 * (5 - entry.energy);

  return Number(score.toFixed(1));
}

export function buildEntry(entry: EntryInput): Entry {
  const burnoutScore = calculateBurnoutScore(entry);

  return {
    ...entry,
    burnoutScore,
    burnoutLevel: getBurnoutLevel(burnoutScore),
  };
}

export function formatHours(hours: number) {
  const cappedHours = Math.min(hours, 8);

  return Number.isInteger(cappedHours) ? `${cappedHours}h` : `${cappedHours.toFixed(1)}h`;
}

export function getRiskMessage(entry: Entry) {
  if (entry.burnoutLevel === 'High') {
    return 'Your levels are elevated. Consider recovery time soon.';
  }

  if (entry.burnoutLevel === 'Medium') {
    return 'Some pressure is building. A small reset could help.';
  }

  return 'Your levels are balanced. Keep it up!';
}

export function getRecommendations(entry: Entry): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const sleepScale = getSleepScale(entry.sleepHours);

  if (entry.workload >= 4) {
    recommendations.push({
      title: 'Focus Block',
      description: 'Workload is high. Schedule 90 min with no pings.',
      variant: 'focus',
      Icon: CircleCheck,
    });
  }

  if (entry.stress >= 4) {
    recommendations.push({
      title: 'Recovery Window',
      description: 'Stress is elevated. Add a short walk or quiet reset this evening.',
      variant: 'recovery',
      Icon: Sparkles,
    });
  }

  if (sleepScale <= 3) {
    recommendations.push({
      title: 'Sleep Hygiene',
      description: 'Avoid screens 30 min before bed tonight.',
      variant: 'sleep',
      Icon: Moon,
    });
  }

  if (entry.energy <= 2) {
    recommendations.push({
      title: 'Recharge Break',
      description: 'Energy is low. Protect one break for water, food, and a quick reset.',
      variant: 'energy',
      Icon: BatteryLow,
    });
  }

  if (
    recommendations.length === 0 &&
    entry.burnoutLevel === 'Low' &&
    entry.energy >= 4 &&
    sleepScale >= 4
  ) {
    recommendations.push({
      title: 'Keep Momentum',
      description: 'Your baseline looks steady today. Keep your current routine going.',
      variant: 'steady',
      Icon: CircleCheck,
    });
  }

  return recommendations.slice(0, 3);
}
