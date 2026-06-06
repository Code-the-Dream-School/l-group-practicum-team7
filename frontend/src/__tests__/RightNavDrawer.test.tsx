import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RightNavDrawer from '../components/Layout/RightNavDrawer';

describe('RightNavDrawer', () => {
  it('renders main nav and calls onNavigate when items clicked', () => {
    const onNavigate = vi.fn();
    const onLogout = vi.fn();

    render(<RightNavDrawer user={{ name: 'Sam', email: 's@example.com' }} activeRoute="backend" onNavigate={onNavigate} onLogout={onLogout} />);

    expect(screen.getByText(/Dashboard/i)).toBeTruthy();
    expect(screen.getByText(/History/i)).toBeTruthy();
    expect(screen.getByText(/Dialogues/i)).toBeTruthy();
    expect(screen.getByText(/Tools/i)).toBeTruthy();

    fireEvent.click(screen.getByText(/Tools/i));
    expect(onNavigate).toHaveBeenCalledWith('tools');

    const dashboardBtn = screen.getByText(/Dashboard/i).closest('button');
    expect(dashboardBtn && dashboardBtn.getAttribute('aria-current')).toEqual('page');

    fireEvent.click(screen.getByText(/Logout/i));
    expect(onLogout).toHaveBeenCalled();
  });
});
