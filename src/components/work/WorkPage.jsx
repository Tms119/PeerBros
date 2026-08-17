import React, { useState, useCallback } from 'react';
import WorkLoadingScreen from './WorkLoadingScreen';
import { CustomCursor } from '../MicroInteractions';
import PeerOS from './PeerOS';

const WorkPage = () => {
  const [loaded, setLoaded] = useState(false);
  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <div className="relative bg-background text-foreground overflow-hidden h-screen w-screen selection:bg-accent/30 selection:text-accent">
      <WorkLoadingScreen onComplete={handleLoadComplete} />
      <CustomCursor />
      <div className="noise-overlay pointer-events-none z-[100]" />
      
      {/* The PeerOS Desktop */}
      {loaded && <PeerOS />}
    </div>
  );
};

export default WorkPage;
