import React, { useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Temporary token notice - user needs to provide this
const MAPBOX_ACCESS_TOKEN = 'TEMP_TOKEN';

interface VehicleData {
  id: string;
  coordinates: [number, number];
  timestamp: number;
}

export const VehicleMap: React.FC = () => {
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    id: 'vehicle-1',
    coordinates: [-122.4194, 37.7749], // Start in San Francisco
    timestamp: Date.now(),
  });

  // Simulate real-time vehicle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleData(prev => {
        // Create realistic movement pattern (small movements)
        const deltaLat = (Math.random() - 0.5) * 0.005;
        const deltaLng = (Math.random() - 0.5) * 0.005;
        
        return {
          ...prev,
          coordinates: [
            prev.coordinates[0] + deltaLng,
            prev.coordinates[1] + deltaLat,
          ],
          timestamp: Date.now(),
        };
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  if (MAPBOX_ACCESS_TOKEN === 'TEMP_TOKEN') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 rounded-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold mb-3">Mapbox Token Required</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            To display the interactive map with Deck.gl, please get your Mapbox access token from{' '}
            <a
              href="https://mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              mapbox.com
            </a>{' '}
            and add it to the VehicleMap component.
          </p>
          
          {/* Live Vehicle Data Display */}
          <div className="dashboard-panel p-4 max-w-sm">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-signal-green rounded-full animate-pulse"></div>
                <span className="font-medium">Vehicle #1 Active</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Latitude: {vehicleData.coordinates[1].toFixed(6)}</div>
                <div>Longitude: {vehicleData.coordinates[0].toFixed(6)}</div>
                <div>Last Update: {new Date(vehicleData.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
          
          {/* Simulated Movement Visualization */}
          <div className="mt-6 p-4 dashboard-panel max-w-sm">
            <div className="text-sm font-medium mb-2">Live Position Updates</div>
            <div className="relative w-32 h-32 bg-muted/30 rounded-lg mx-auto">
              <div 
                className="absolute w-3 h-3 bg-signal-green rounded-full transition-all duration-1000 ease-in-out"
                style={{
                  left: `${((vehicleData.coordinates[0] + 122.4194) * 1000) % 100}%`,
                  top: `${((vehicleData.coordinates[1] - 37.7749) * 1000) % 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="absolute inset-0 bg-signal-green rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Simulated movement pattern
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This would be the actual map implementation with Mapbox token
  return (
    <div className="relative w-full h-full bg-muted/20 rounded-lg">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🚗</div>
          <p className="text-muted-foreground">Map would render here with Mapbox token</p>
        </div>
      </div>
    </div>
  );
};