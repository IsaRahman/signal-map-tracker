import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SignalState {
  greenTime: number;
  redTime: number;
  isGreenActive: boolean;
  currentTime: number;
}

export const TrafficSignals: React.FC = () => {
  const [signalState, setSignalState] = useState<SignalState>({
    greenTime: 70,    // 70 seconds for green
    redTime: 30,      // 30 seconds for red
    isGreenActive: true,
    currentTime: 30,  // Start with green time
  });

  // State for fetched signal data
  const [signalData, setSignalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track last timestamp to avoid duplicate logs
  const lastTimestampRef = React.useRef<string | null>(null);

  // Global variable for light_status_crossing_85 (lowercase for consistency)
  const lightStatus = signalData && signalData.light_status_crossing_85
    ? signalData.light_status_crossing_85.trim().toLowerCase()
    : '';

  // Fetch signal timing from Elasticsearch every 100ms
  useEffect(() => {
    let isMounted = true;
    const fetchSignalData = async () => {
      const fetchTime = new Date().toISOString();
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          '/api/cbs-prediction*/_search',
          {
            size: 10,
            _source: [
              'train_id',
              'light_status_crossing_85',
              'remain_time_crossing_85',
              'sentence_crossing_85',
              'prediction_timestamp',

            ],
            query: {
              range: {
                prediction_timestamp: { gte: 'now-1h' },
              },
            },
            sort: [
              { 'prediction_timestamp': { "order": 'desc' } }
            ]
          },
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (isMounted) {
          const latest = response.data?.hits?.hits?.[0]?._source;
         // console.log(`[FETCH @ ${fetchTime}]`, latest);
          if (latest && latest.prediction_timestamp !== lastTimestampRef.current) {
            setSignalData(latest);
            lastTimestampRef.current = latest.prediction_timestamp;
            // Optionally: console.log('Latest signal data:', latest);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to fetch signal data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSignalData();
    const interval = setInterval(fetchSignalData, 100); // 100ms = 0.1s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update timer every 100ms for smooth countdown, but use remain_time_crossing_85 from signalData if available
  useEffect(() => {
    if (signalData && signalData.remain_time_crossing_85 !== undefined) {
      setSignalState(prev => ({
        ...prev,
        currentTime: Number(signalData.remain_time_crossing_85),
      }));
    }
  }, [signalData?.remain_time_crossing_85]);

  // Color logic for timer based on light_status_crossing_85
  const getTimerColor = () => {
    if (!lightStatus) return 'text-gray-500';
    switch (lightStatus) {
      case 'green':
        return 'text-green-500';
      case 'red':
        return 'text-red-500';
      case 'yellow':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTime = (time: number): string => {
  const totalSeconds = Math.floor(Math.max(0, time)); // remove decimals and negative values
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};


  // Red light color logic based on light_status_crossing_85
  const isRedActive = lightStatus === 'red';

  return (
    <div className="space-y-8 max-w-md mx-auto">
      {/* Train Grade Crossing Signal */}
      {/* POSITIONING: Adjust these values to move the entire crossing structure */}
      {/* Change 'justify-center' to 'justify-start' or 'justify-end' for left/right positioning */}
      {/* Add 'ml-8' or 'mr-8' classes for fine-tuning horizontal position */}
      {/* Add 'mt-4' or 'mb-4' for vertical spacing adjustments */}
      <div className="flex justify-between mt-10 mb-8 mx-8 relative">
        {/* Rail Track */}
        <div className="absolute left-1/2 top-[65%] transform -translate-x-1/2 w-[340px] z-0">
          {/* Main rail lines */}
          <div className="relative">
            <div className="h-1 bg-white border border-gray-400"></div>
            <div className="h-1 bg-white border border-gray-400 mt-3"></div>
            {/* Railroad ties */}
            <div className="absolute top-0 left-0 right-0 flex justify-between">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-700 -mt-1.5"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Small Signal - Left */}
        <div className="relative w-32 -ml-12">
          {/* Signal Post */}
          <div className="w-2 h-32 bg-gray-700 mx-auto rounded-sm relative z-0"></div>
          {/* Crossbuck Sign (rotated 90deg) */}
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 rotate-90 z-10">
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* First bar with 'CROSSING 85' */}
              <div className="absolute left-1/2 top-1/2 w-16 h-3 bg-white border-2 border-black rounded-sm flex items-center justify-center" style={{ transform: 'translate(-50%, -50%) rotate(30deg)' }}>
                <span className="text-[0.55rem] font-bold text-black tracking-widest" style={{ letterSpacing: '0.12em' }}>CROSSING 85</span>
              </div>
              {/* Second bar with 'CROSSING 85' */}
              <div className="absolute left-1/2 top-1/2 w-16 h-3 bg-white border-2 border-black rounded-sm flex items-center justify-center" style={{ transform: 'translate(-50%, -50%) rotate(-30deg)' }}>
                <span className="text-[0.55rem] font-bold text-black tracking-widest" style={{ letterSpacing: '0.12em' }}>CROSSING 85</span>
              </div>
            </div>
          </div>
          {/* Red Lights */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div 
              className={`w-4 h-4 rounded-full border-2 border-gray-800 transition-all duration-200 ${
                lightStatus === 'red'
                  ? 'bg-red-500 shadow-red-500/50 shadow-lg animate-pulse' 
                  : 'bg-gray-300'
              }`}
            ></div>
            <div 
              className={`w-4 h-4 rounded-full border-2 border-gray-800 transition-all duration-200 ${
                lightStatus === 'red'
                  ? 'bg-red-500 shadow-red-500/50 shadow-lg animate-pulse' 
                  : 'bg-gray-300'
              }`}
              style={{
                animationDelay: lightStatus === 'red' ? '0.5s' : '0s'
              }}
            ></div>
          </div>
          {/* Crossing Gate Arm (rotates 90deg) */}
          <div 
            className={`absolute top-0 left-1/2 transform -translate-x-1/2 origin-bottom w-1.5 h-28 bg-red-600 border border-red-800 ease-linear ${
              lightStatus === 'red'
                ? 'rotate-90' 
                : 'rotate-0'
            }`}
            style={{
              transformOrigin: 'bottom center',
              transitionDuration: lightStatus === 'red' ? '5s' : '1s'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-white via-red-600 to-white bg-[length:100%_6px]"></div>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-700 rounded-full border border-red-900"></div>
          </div>
        </div>

        
        {/* Main Signal - Right */}
        <div className="relative">
          {/* Signal Post */}
          <div className="w-4 h-52 bg-gray-700 mx-auto rounded-sm relative z-0"></div>
          {/* Crossbuck Sign */}
          <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* First bar with 'CROSSING 85' */}
              <div className="absolute left-1/2 top-1/2 w-28 h-5 bg-white border-2 border-black rounded-sm flex items-center justify-center" style={{ transform: 'translate(-50%, -50%) rotate(30deg)' }}>
                <span className="text-xs font-bold text-black tracking-widest" style={{ letterSpacing: '0.15em' }}>CROSSING 85</span>
              </div>
              {/* Second bar with 'CROSSING 85' */}
              <div className="absolute left-1/2 top-1/2 w-28 h-5 bg-white border-2 border-black rounded-sm flex items-center justify-center" style={{ transform: 'translate(-50%, -50%) rotate(-30deg)' }}>
                <span className="text-xs font-bold text-black tracking-widest" style={{ letterSpacing: '0.15em' }}>CROSSING 85</span>
              </div>
            </div>
          </div>
          {/* Red Lights */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex space-x-6">
            <div 
              className={`w-8 h-8 rounded-full border-3 border-gray-800 transition-all duration-200 ${
                lightStatus === 'red'
                  ? 'bg-red-500 shadow-red-500/50 shadow-lg animate-pulse' 
                  : 'bg-gray-300'
              }`}
            ></div>
            <div 
              className={`w-8 h-8 rounded-full border-3 border-gray-800 transition-all duration-200 ${
                lightStatus === 'red'
                  ? 'bg-red-500 shadow-red-500/50 shadow-lg animate-pulse' 
                  : 'bg-gray-300'
              }`}
              style={{
                animationDelay: lightStatus === 'red' ? '0.5s' : '0s'
              }}
            ></div>
          </div>
          {/* Crossing Gate Arm */}
          <div 
            className={`absolute top-0 left-1/2 transform -translate-x-1/2 origin-bottom w-3 h-40 bg-red-600 border-2 border-red-800 ease-linear ${
              lightStatus === 'red'
                ? '-rotate-90' 
                : 'rotate-0'
            }`}
            style={{
              transformOrigin: 'bottom center',
              transitionDuration: lightStatus === 'red' ? '5s' : '1s'
            }}
          >
          
            {/* Gate stripes */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-white via-red-600 to-white bg-[length:100%_8px]"></div>
            {/* Gate end cap */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-700 rounded-full border-2 border-red-900"></div>
          </div>
        </div>
      </div>

      {/* Crossing Status Message */}
      <div className="text-center">
        <div className={`text-lg font-semibold px-4 py-2 rounded-lg ${(() => {
          const msg = signalData && signalData.sentence_crossing_85
            ? signalData.sentence_crossing_85.trim().toLowerCase()
            : '';
          if (msg === 'crossing is clear') return 'text-green-700 bg-green-100';
          if (msg === 'train is approaching') return 'text-yellow-700 bg-yellow-100';
          if (msg === 'train present at crossing') return 'text-red-700 bg-red-100';
        })()}`}>
          {signalData && signalData.sentence_crossing_85
            ? signalData.sentence_crossing_85
            : ''}
        </div>
      </div>

      {/* Signal Timer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Predicted Signal Timing</h3>
          <div 
            className={`w-10 h-10 rounded-full transition-all duration-200 ${
              lightStatus === 'green'
                ? 'bg-green-500 shadow-lg'
                : 'bg-red-500 shadow-lg'
            }`}
          />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
          <div 
            className={`text-4xl font-bold ${getTimerColor()}`}
          >
            {formatTime(signalState.currentTime)}
          </div>
          <div className="text-sm text-gray-500 mt-2">time remaining</div>
          <div className={`mt-4 text-xs`}>
            {lightStatus === 'green' ? (
              <span className="text-green-500">● GREEN ACTIVE</span>
            ) : (
              <span className="text-red-500">● RED ACTIVE</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};