import React from 'react';
import { VehicleMap } from './VehicleMap';
import { TrafficSignals } from './TrafficSignals';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-grid">
      {/* Map Panel */}
      <div className="dashboard-panel">
        <div className="p-4 border-b border-dashboard-border">
          <h2 className="text-xl font-semibold text-foreground">Vehicle Tracking</h2>
          <p className="text-sm text-muted-foreground">Real-time fleet monitoring</p>
        </div>
        <div className="h-[calc(100%-80px)]">
          <VehicleMap />
        </div>
      </div>

      {/* Control Panel */}
      <div className="dashboard-panel">
        <div className="p-4 border-b border-dashboard-border">
          <h2 className="text-xl font-semibold text-foreground">Traffic Control</h2>
          <p className="text-sm text-muted-foreground">Signal timing system</p>
        </div>
        <div className="p-6">
          <TrafficSignals />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;