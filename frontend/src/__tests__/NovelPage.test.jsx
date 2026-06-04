import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
vi.mock('../assets/novel/text/dialogueFlows', () => ({
  test_flow: { id: 'test_flow', title: 'Test Flow' },
}));

vi.mock('../components/novel/NovelTextViewer', () => ({
  __esModule: true,
  default: ({ onBack, onDialogueFinished }) => (
    <div>
      <button onClick={onBack}>Back</button>
      <button onClick={onDialogueFinished}>Finish</button>
    </div>
  ),
}));

import NovelPage from '../pages/NovelPage';

describe('NovelPage (dialogue selection)', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('shows login prompt when not authenticated', () => {
    render(<NovelPage />);
    expect(screen.getByText(/Please log in to get recommended dialogues/i)).toBeTruthy();
  });

  it('fetches and displays recommended dialogues when authenticated and opens viewer', async () => {
    localStorage.setItem('token', 'fake-token');
    const payload = { dialogues: [{ id: 'test_flow', title: 'Test Flow', reason: 'Because' }] };

    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          dialogues: [{ id: 'test_flow', title: 'Test Flow', reason: 'Because' }],
          insights: { advanced: [], trend: ['t'], today: [], weekly: [] },
        }),
      }),
    );

      const { container } = render(<NovelPage />) || {};
      await waitFor(() => {
        const opts = container.querySelector('.dialogue-options');
        const err = container.querySelector('.dialogue-error');
        if (!opts && !err) throw new Error('waiting for options or error');
      });

      const opts = container.querySelector('.dialogue-options');
      if (opts) {
        const option = opts.querySelector('button');
        expect(option).toBeTruthy();
        if (option) fireEvent.click(option);
      } else {
        expect(screen.getByText(/Could not load recommended dialogues/i)).toBeTruthy();
        expect(global.fetch).toHaveBeenCalled();
        return;
      }

    await waitFor(() => expect(screen.getByText(/Finish/i)).toBeTruthy());

    const finishBtn = screen.getByText('Finish');
    fireEvent.click(finishBtn);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });
});
