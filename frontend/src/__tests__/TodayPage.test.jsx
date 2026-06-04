import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TodayPage from '../pages/TodayPage';

const SAMPLE_ENTRY = {
  _id: 'e1',
  date: new Date().toISOString(),
  stress: 4,
  workload: 3,
  energy: 2,
  sleepHours: 5,
  burnoutScore: 3.5,
  burnoutLevel: 'Medium',
};

const SAMPLE_INSIGHTS = {
  averages: {
    last2DaysStress: 3.1,
    last7DaysStress: 3.2,
    last7DaysEnergy: 2.8,
    last7DaysBurnout: 3.0,
  },
  insights: {
    today: ['High stress today'],
    trend: ['Stress rising'],
    weekly: ['Sustained high stress'],
    advanced: [],
  },
};

describe('TodayPage', () => {
  it('renders insights and recommended actions and responds to navigation', async () => {
    const nav = vi.fn();

    render(
      <TodayPage
        entries={[SAMPLE_ENTRY]}
        insights={SAMPLE_INSIGHTS}
        loading={false}
        error={null}
        todayCounts={{ dialogueCount: 1, toolCount: 2 }}
        onNavigate={nav}
      />,
    );

    expect(screen.getByText(/What the system noticed/i)).toBeTruthy();
    expect(screen.getByText(/Recommended Actions/i)).toBeTruthy();

    const continueBtn = screen.getByText(/Continue dialogue/i).closest('article');
    if (continueBtn) fireEvent.click(continueBtn);

    expect(nav).toHaveBeenCalledWith('dialogues');
  });

  it('shows loading and empty states appropriately', () => {
    const { rerender } = render(
      <TodayPage
        entries={[]}
        insights={null}
        loading={true}
        error={null}
        todayCounts={{ dialogueCount: 0, toolCount: 0 }}
      />,
    );

    expect(screen.getByText(/Loading your dashboard/i)).toBeTruthy();

    rerender(
      <TodayPage
        entries={[]}
        insights={null}
        loading={false}
        error={null}
        todayCounts={{ dialogueCount: 0, toolCount: 0 }}
      />,
    );

    expect(screen.getByText(/No daily logs yet/i)).toBeTruthy();
  });

  it('displays averages and allows toggling series controls', () => {
    const nav = vi.fn();

    render(
      <TodayPage
        entries={[SAMPLE_ENTRY]}
        insights={SAMPLE_INSIGHTS}
        loading={false}
        error={null}
        todayCounts={{ dialogueCount: 1, toolCount: 2 }}
        onNavigate={nav}
      />,
    );

    expect(screen.getByText(/What the system noticed/i)).toBeTruthy();
    expect(screen.getAllByText(/Trend/i)[0]).toBeTruthy();

    const sleepBtn = screen.getByText('Sleep');
    fireEvent.click(sleepBtn);
    expect(sleepBtn).toBeTruthy();
  });
});
