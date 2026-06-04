import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import ToolsPage from '../pages/ToolsPage';

describe('ToolsPage', () => {
  it('shows empty state when no unlocked tools and updates when dialogueStateUpdate fires', async () => {
    localStorage.setItem('token', 'fake-token-123');

    render(<ToolsPage />);

    expect(screen.getByText(/No tools unlocked yet/i)).toBeTruthy();

    await waitFor(() => expect(screen.getByText(/PulseMind Tools/i)).toBeTruthy());

    act(() => {
      window.dispatchEvent(new CustomEvent('dialogueStateUpdate', { detail: { unlockedTools: ['thought_dump'] } }));
    });

    expect(await screen.findByText(/Thought Dump/i)).toBeTruthy();
  });
});
