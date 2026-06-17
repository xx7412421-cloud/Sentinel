import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SecurityReportingDashboard, SecurityReport } from './SecurityReportingDashboard';

const mockReport: SecurityReport = {
  generatedAt: '2026-06-16T11:00:00.000Z',
  periodDays: 30,
  totalAlerts: 27,
  severityBreakdown: { low: 12, medium: 8, high: 5, critical: 2 },
  topChains: [
    { chain: 'Ethereum', count: 11 },
    { chain: 'Soroban', count: 9 },
    { chain: 'Polygon', count: 7 },
  ],
  resolvedAlerts: 20,
  unresolvedAlerts: 7,
  criticalUnresolved: 2,
};

describe('SecurityReportingDashboard', () => {
  it('renders without crashing', () => {
    render(<SecurityReportingDashboard report={mockReport} />);
  });

  it('shows the page heading', () => {
    render(<SecurityReportingDashboard report={mockReport} />);
    expect(screen.getByRole('heading', { name: /executive security report/i })).toBeInTheDocument();
  });

  it('displays total alerts KPI', () => {
    render(<SecurityReportingDashboard report={mockReport} />);
    expect(screen.getByText('27')).toBeInTheDocument();
    expect(screen.getByText(/total alerts/i)).toBeInTheDocument();
  });

  it('displays critical unresolved KPI', () => {
    render(<SecurityReportingDashboard report={mockReport} />);
    expect(screen.getByText(/critical unresolved/i)).toBeInTheDocument();
  });

  it('displays resolved and unresolved KPIs', () => {
    render(<SecurityReportingDashboard report={mockReport} />);
    expect(screen.getByText(/^resolved$/i)).toBeInTheDocument();
    expect(screen.getByText(/^unresolved$/i)).toBeInTheDocument();
  });

  it('renders severity breakdown labels', () => {
    render(<SecurityReportingDashboard report={mockReport} />);
    expect(screen.getByText('low')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
  });

  it('renders top chain names', () => {
    render(<SecurityReportingDashboard report={mockReport} />);
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Soroban')).toBeInTheDocument();
    expect(screen.getByText('Polygon')).toBeInTheDocument();
  });

  it('renders with default report when no prop is provided', () => {
    render(<SecurityReportingDashboard />);
    expect(screen.getByRole('heading', { name: /executive security report/i })).toBeInTheDocument();
  });

  it('shows the correct period in the subtitle', () => {
    render(<SecurityReportingDashboard report={mockReport} />);
    expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
  });
});
