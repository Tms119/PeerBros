import React from 'react';
import { motion } from 'framer-motion';

const SuccessTick = () => {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        className="w-16 h-16 text-green-500 drop-shadow-md"
        style={{ color: '#22c55e' }}
      >
        {/* Animated Circle */}
        <motion.circle
          cx="25"
          cy="25"
          r="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        {/* Animated Checkmark */}
        <motion.path
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 25 l7 7 l13 -13"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
        />
      </motion.svg>
    </div>
  );
};

export default SuccessTick;
