import React from 'react';

const WolfLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-wolf-secondary z-50">
      <div className="flex flex-col items-center">
        <div className="wolf-loader mb-4"></div>
        <p className="text-wolf-accent font-rajdhani">Loading...</p>
      </div>
    </div>
  );
};

export default WolfLoader;
