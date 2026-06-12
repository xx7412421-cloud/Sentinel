import React, { useState } from 'react';
import './AlertHistoryTable.css';

// Type definitions
export type SeverityLevel = 'high' | 'medium' | 'low';

export interface WatchdogEvent {
  id: string;
  timestamp: string;
  chain: string;
  severity: SeverityLevel;
  description: string;
}

// Mock Data for the table
const mockEvents: WatchdogEvent[] = [
  {
    id: 'evt-001',
    timestamp: '2026-06-11 14:32:01 UTC',
    chain: 'Soroban',
    severity: 'high',
    description: 'Unauthorized set_admin call detected on Vault Contract',
  },
  {
    id: 'evt-002',
    timestamp: '2026-06-11 12:15:45 UTC',
    chain: 'Ethereum',
    severity: 'medium',
    description: 'Emergency Pause triggered by multisig address',
  },
  {
    id: 'evt-003',
    timestamp: '2026-06-10 09:05:12 UTC',
    chain: 'Soroban',
    severity: 'low',
    description: 'New verified contract deployment matching signature',
  },
  {
    id: 'evt-004',
    timestamp: '2026-06-09 18:22:30 UTC',
    chain: 'Polygon',
    severity: 'high',
    description: 'Sudden large-scale transfer (25% liquidity drain)',
  },
  {
    id: 'evt-005',
    timestamp: '2026-06-09 08:11:05 UTC',
    chain: 'Ethereum',
    severity: 'medium',
    description: 'Unusual high-frequency minting behavior',
  },
];

export const AlertHistoryTable: React.FC = () => {
  const [filterChain, setFilterChain] = useState<string>('All');

  // Extract unique chains for the dropdown
  const uniqueChains = ['All', ...Array.from(new Set(mockEvents.map(event => event.chain)))];

  // Filter events based on selected chain
  const filteredEvents = filterChain === 'All' 
    ? mockEvents 
    : mockEvents.filter(event => event.chain === filterChain);

  return (
    <div className="alert-history-container">
      <div className="alert-history-card">
        <div className="card-header">
          <h2 className="card-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 12H16c-.7 2-2 3-4 3s-3.3-1-4-3H2.5"/>
              <path d="M5.5 5.5A5 5 0 0 1 9 4h6a5 5 0 0 1 3.5 1.5"/>
              <path d="M11 2v2"/>
              <path d="M13 2v2"/>
            </svg>
            Alert History
          </h2>
          
          <div className="filter-wrapper">
            <label htmlFor="chain-filter" className="filter-label">Filter by Chain</label>
            <select 
              id="chain-filter" 
              className="chain-select"
              value={filterChain}
              onChange={(e) => setFilterChain(e.target.value)}
            >
              {uniqueChains.map(chain => (
                <option key={chain} value={chain}>{chain}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Chain</th>
                <th>Severity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="timestamp-cell">{event.timestamp}</td>
                    <td>
                      <span className="chain-badge">{event.chain}</span>
                    </td>
                    <td>
                      <span className={`severity-tag ${event.severity}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="description-cell" title={event.description}>
                      {event.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No alerts found for the selected chain.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertHistoryTable;
