import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AuthModal from '../components/Auth/AuthModal';

describe('AuthModal', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('login mode renders login fields and submits', async () => {
    const onAuthed = vi.fn();
    const onClose = vi.fn();

    global.fetch.mockImplementation((url, opts) => {
      if (url.endsWith('/api/auth/logon')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'token123', user: { email: 'test@example.com', id: '1', name: 'Test' } }) });
      }

      if (url.endsWith('/api/auth/me')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ email: 'test@example.com', id: '1', name: 'Test' }) });
      }

      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    render(<AuthModal onAuthed={onAuthed} onClose={onClose} initialMode="login" />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });

    const form = document.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => expect(onAuthed).toHaveBeenCalled());
  });

  it('register mode renders signup fields', () => {
    const onAuthed = vi.fn();
    const onClose = vi.fn();

    render(<AuthModal onAuthed={onAuthed} onClose={onClose} initialMode="signup" />);

    expect(screen.getByLabelText(/Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeTruthy();
  });
});
