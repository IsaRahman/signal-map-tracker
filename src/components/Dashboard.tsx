import React from 'react';
import { TransportationNetwork } from './TransportationNetwork';
import { TrafficSignals } from './TrafficSignals';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-grid">
      {/* Map Panel */}
      <div className="dashboard-panel">
        <div className="p-4 border-b border-dashboard-border">
          <h2 className="text-xl font-semibold text-foreground">Train Tracking</h2>
          <p className="text-sm text-muted-foreground">Real-time Train monitoring</p>
        </div>
        <div className="h-100%">
          <TransportationNetwork />
        </div>
      </div>

      {/* Control Panel */}
      <div className="dashboard-panel">
        <div className="p-4 border-b border-dashboard-border">
          <h2 className="text-xl font-semibold text-foreground">Grade Crossing Signal Control</h2>
          <p className="text-sm text-muted-foreground">Signal timing remaining</p>
        </div>
        <div className="p-6">
          <TrafficSignals />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Temporal Solution for Code Run

// Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
