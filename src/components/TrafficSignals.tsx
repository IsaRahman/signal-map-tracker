import React, { useState, useEffect } from 'react';

interface SignalState {
  greenTime: number;
  redTime: number;
  isGreenActive: boolean;
  currentTime: number;
}

export const TrafficSignals: React.FC = () => {
  const [signalState, setSignalState] = useState<SignalState>({
    greenTime: 30, // 30 seconds for green
    redTime: 25,   // 25 seconds for red
    isGreenActive: true,
    currentTime: 30,
  });

  // Update timer every 100ms for smooth countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalState(prev => {
        const newTime = prev.currentTime - 0.1;
        
        if (newTime <= 0) {
          // Switch signals
          if (prev.isGreenActive) {
            return {
              ...prev,
              isGreenActive: false,
              currentTime: prev.redTime,
            };
          } else {
            return {
              ...prev,
              isGreenActive: true,
              currentTime: prev.greenTime,
            };
          }
        }
        
        return {
          ...prev,
          currentTime: newTime,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number): string => {
    return Math.max(0, time).toFixed(1);
  };

  return (
    <div className="space-y-8">
      {/* Green Signal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Green Signal</h3>
          <div 
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              signalState.isGreenActive 
                ? 'bg-signal-green shadow-lg animate-pulse' 
                : 'bg-muted/30'
            }`}
          />
        </div>
        <div className="dashboard-panel p-6 text-center">
          <div 
            className={`signal-display ${
              signalState.isGreenActive ? 'signal-green' : 'text-muted-foreground'
            }`}
          >
            {signalState.isGreenActive ? formatTime(signalState.currentTime) : '0.0'}
          </div>
          <div className="text-sm text-muted-foreground mt-2">seconds remaining</div>
          {signalState.isGreenActive && (
            <div className="mt-4 text-xs text-signal-green">
              ● ACTIVE
            </div>
          )}
        </div>
      </div>

      {/* Red Signal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Red Signal</h3>
          <div 
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              !signalState.isGreenActive 
                ? 'bg-signal-red shadow-lg animate-pulse' 
                : 'bg-muted/30'
            }`}
          />
        </div>
        <div className="dashboard-panel p-6 text-center">
          <div 
            className={`signal-display ${
              !signalState.isGreenActive ? 'signal-red' : 'text-muted-foreground'
            }`}
          >
            {!signalState.isGreenActive ? formatTime(signalState.currentTime) : '0.0'}
          </div>
          <div className="text-sm text-muted-foreground mt-2">seconds remaining</div>
          {!signalState.isGreenActive && (
            <div className="mt-4 text-xs text-signal-red">
              ● ACTIVE
            </div>
          )}
        </div>
      </div>

      {/* Status Information */}
      <div className="pt-4 border-t border-dashboard-border">
        <div className="text-xs text-muted-foreground space-y-2">
          <div className="flex justify-between">
            <span>Green Cycle:</span>
            <span>{signalState.greenTime}s</span>
          </div>
          <div className="flex justify-between">
            <span>Red Cycle:</span>
            <span>{signalState.redTime}s</span>
          </div>
          <div className="flex justify-between">
            <span>Total Cycle:</span>
            <span>{signalState.greenTime + signalState.redTime}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};