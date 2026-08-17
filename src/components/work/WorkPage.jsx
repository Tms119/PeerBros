import React, { useState, useCallback } from 'react';
import WorkLoadingScreen from './WorkLoadingScreen';
import { CustomCursor } from '../MicroInteractions';
import Navbar from '../Navbar';
import WorkCanvasMap from './WorkCanvasMap';

const WorkPage = () => {
  const [loaded, setLoaded] = useState(false);
  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <div className="relative bg-background text-foreground overflow-hidden h-screen w-screen selection:bg-accent/30 selection:text-accent">
      <WorkLoadingScreen onComplete={handleLoadComplete} />
      <CustomCursor />
      <div className="noise-overlay pointer-events-none z-[100]" />
      
      {/* We keep Navbar on top */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      
      {/* The Infinite Canvas */}
      {loaded && <WorkCanvasMap />}
    </div>
  );
};

export default WorkPage;
