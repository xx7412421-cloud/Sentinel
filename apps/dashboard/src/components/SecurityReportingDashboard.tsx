import React from 'react';
import './SecurityReportingDashboard.css';

export interface SeverityBreakdown {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface ChainBreakdown {
  chain: string;
  count: number;
}

export interface SecurityReport {
  generatedAt: string;
  periodDays: number;
  totalAlerts: number;
  severityBreakdown: SeverityBreakdown;
  topChains: ChainBreakdown[];
  resolvedAlerts: number;
  unresolvedAlerts: number;
  criticalUnresolved: number;
}

// Default mock data — replaced by real API data in production
const defaultReport: SecurityReport = {
  generatedAt: new Date().toISOString(),
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

interface Props {
  report?: SecurityReport;
}

export const SecurityReportingDashboard: React.FC<Props> = ({ report = defaultReport }) => {
  const {
    totalAlerts,
    severityBreakdown,
    topChains,
    resolvedAlerts,
    unresolvedAlerts,
    criticalUnresolved,
    periodDays,
    generatedAt,
  } = report;

  return (
    <div className="srd-container">
      <header className="srd-header">
        <h1 className="srd-title">Executive Security Report</h1>
        <p className="srd-subtitle">
          Last {periodDays} days &mdash; generated {new Date(generatedAt).toLocaleString()}
        </p>
      </header>

      {/* KPI cards */}
      <section className="srd-kpis" aria-label="Key performance indicators">
        <div className="srd-card srd-kpi">
          <span className="srd-kpi-value">{totalAlerts}</span>
          <span className="srd-kpi-label">Total Alerts</span>
        </div>
        <div className="srd-card srd-kpi srd-kpi--danger">
          <span className="srd-kpi-value">{criticalUnresolved}</span>
          <span className="srd-kpi-label">Critical Unresolved</span>
        </div>
        <div className="srd-card srd-kpi srd-kpi--success">
          <span className="srd-kpi-value">{resolvedAlerts}</span>
          <span className="srd-kpi-label">Resolved</span>
        </div>
        <div className="srd-card srd-kpi srd-kpi--warning">
          <span className="srd-kpi-value">{unresolvedAlerts}</span>
          <span className="srd-kpi-label">Unresolved</span>
        </div>
      </section>

      <div className="srd-row">
        {/* Severity breakdown */}
        <section className="srd-card srd-section" aria-label="Severity breakdown">
          <h2 className="srd-section-title">Severity Breakdown</h2>
          <ul className="srd-severity-list">
            {(Object.entries(severityBreakdown) as [keyof SeverityBreakdown, number][]).map(
              ([level, count]) => (
                <li key={level} className="srd-severity-row">
                  <span className={`srd-badge srd-badge--${level}`}>{level}</span>
                  <div className="srd-bar-track">
                    <div
                      className={`srd-bar srd-bar--${level}`}
                      style={{ width: totalAlerts ? `${(count / totalAlerts) * 100}%` : '0%' }}
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemax={totalAlerts}
                      aria-label={`${level} severity`}
                    />
                  </div>
                  <span className="srd-severity-count">{count}</span>
                </li>
              ),
            )}
          </ul>
        </section>

        {/* Top chains */}
        <section className="srd-card srd-section" aria-label="Top chains by alert volume">
          <h2 className="srd-section-title">Top Chains by Alert Volume</h2>
          <ul className="srd-chain-list">
            {topChains.map(({ chain, count }) => (
              <li key={chain} className="srd-chain-row">
                <span className="srd-chain-name">{chain}</span>
                <div className="srd-bar-track">
                  <div
                    className="srd-bar srd-bar--chain"
                    style={{ width: totalAlerts ? `${(count / totalAlerts) * 100}%` : '0%' }}
                    role="progressbar"
                    aria-valuenow={count}
                    aria-valuemax={totalAlerts}
                    aria-label={chain}
                  />
                </div>
                <span className="srd-chain-count">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SecurityReportingDashboard;
