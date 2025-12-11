import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw, Square, X } from 'lucide-react';

const AnimationModal = ({
  isOpen,
  onClose,
  algorithmName,
  children,
  t,
  animationContainerRef,
  sortSpeed,
  setSortSpeed,
  isPlaying,
  onStart,
  onPause,
  onResume,
  onReset,
  onStop
}) => {
  const modalRef = useRef(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleClickOutside}>
      <div ref={modalRef} className="relative p1 w-full h-full bg-white flex flex-col">
        {/* Title Bar */}
        <div className="flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">&nbsp;{algorithmName}</h2>
          <button
            onClick={() => {
              onClose();
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animation Area */}
        <div ref={animationContainerRef} className="flex-grow overflow-auto p-4 flex flex-col items-center justify-center">
          {children}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center p-1 border-t border-gray-200 space-x-4">
          <button
            onClick={onStart}
            className={
              `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition
              bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`
            }
            title="Refresh"
          >

              <RotateCw className="w-5 h-5" />
            
            <span className="sr-only">
              Refresh
            </span>
          </button>

          <button
            onClick={isPlaying ? onPause : onResume}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold shadow transition"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold shadow transition"
            title="Stop"
          >
            <Square className="w-5 h-5" />
            <span className="sr-only">Stop</span>
          </button>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.sortSpeed}: {sortSpeed}</label>
            <input type="range" min="1" max="200" value={sortSpeed} onChange={(e) => setSortSpeed(Number(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationModal;