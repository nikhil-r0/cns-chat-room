import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Zap, Activity } from 'lucide-react';

export const LatticeVisualizer: React.FC = () => {
  const { handshakeStatus } = useAppStore();
  const [noiseSeed, setNoiseSeed] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  // Animation loop for noise
  useEffect(() => {
    if (handshakeStatus === 'complete' || handshakeStatus === 'idle') return;
    const interval = setInterval(() => {
      setNoiseSeed(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [handshakeStatus]);

  // Constants for the visualization grid
  const gridSize = 300;
  const center = gridSize / 2;
  
  // A and S are "fixed" conceptual points for the visualizer
  const A = { x: center - 60, y: center + 40 };
  const S = { x: center + 40, y: center - 60 };
  
  // Compute Secret Point (A * S) - simplified for 2D visualization
  const secretPoint = { x: center + 20, y: center + 20 };

  // Determine noise level based on handshake status
  const noiseLevel = useMemo(() => {
    switch (handshakeStatus) {
      case 'generating': return 5;
      case 'waiting': return 15;
      case 'encapsulating': return 25;
      case 'decapsulating': return 10;
      case 'complete': return 2;
      default: return 0;
    }
  }, [handshakeStatus]);

  // Compute Public Point (B = A*S + E)
  const publicPoint = useMemo(() => {
    if (noiseLevel === 0) return secretPoint;
    // Use noiseSeed to ensure re-calculation without Math.random in useMemo
    const noiseX = (Math.sin(noiseSeed) * 0.5) * noiseLevel;
    const noiseY = (Math.cos(noiseSeed) * 0.5) * noiseLevel;
    return { x: secretPoint.x + noiseX, y: secretPoint.y + noiseY };
  }, [secretPoint, noiseLevel, noiseSeed]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 bg-slate-800 p-3 rounded-full border border-slate-700 text-cyan-400 shadow-xl z-50"
      >
        <Activity className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
        <h3 className="text-sm font-bold text-slate-200 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-yellow-400" /> LWE Visualizer
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">×</button>
      </div>

      <div className="p-6">
        <div className="relative w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          {/* Grid Lines */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <svg width="100%" height="100%" viewBox={`0 0 ${gridSize} ${gridSize}`}>
            {/* Origin */}
            <circle cx={center} cy={center} r="2" fill="#475569" />
            
            {/* Connection Alice -> Bob (Conceptual) */}
            <motion.line 
              x1={A.x} y1={A.y} x2={publicPoint.x} y2={publicPoint.y}
              stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: handshakeStatus !== 'idle' ? 0.3 : 0 }}
            />

            {/* Point A (Public Matrix) */}
            <circle cx={A.x} cy={A.y} r="4" fill="#3b82f6" />
            <text x={A.x - 15} y={A.y - 10} fill="#3b82f6" fontSize="10" fontWeight="bold">A</text>

            {/* Point S (Secret) */}
            <motion.circle 
              cx={S.x} cy={S.y} r="4" fill="#ef4444" 
              animate={{ opacity: handshakeStatus === 'generating' || handshakeStatus === 'complete' ? 1 : 0.2 }}
            />
            <text x={S.x + 10} y={S.y - 10} fill="#ef4444" fontSize="10" fontWeight="bold">s</text>

            {/* Error Cloud (Conceptual Noise) */}
            <motion.circle 
              cx={publicPoint.x} cy={publicPoint.y} 
              r={noiseLevel + 5} 
              fill="rgba(168, 85, 247, 0.1)"
              animate={{ r: noiseLevel + 5 }}
            />

            {/* Point B (Public Key with Noise) */}
            <motion.circle 
              cx={publicPoint.x} cy={publicPoint.y} r="6" fill="#a855f7"
              initial={{ scale: 0 }}
              animate={{ scale: 1, x: publicPoint.x - publicPoint.x, y: publicPoint.y - publicPoint.y }}
              transition={{ type: 'spring' }}
            />
            <text x={publicPoint.x + 10} y={publicPoint.y + 20} fill="#a855f7" fontSize="10" fontWeight="bold">B = As + e</text>
          </svg>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold">
            <span className="text-slate-500">Status</span>
            <span className="text-cyan-400">{handshakeStatus}</span>
          </div>
          
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-cyan-500"
              initial={{ width: 0 }}
              animate={{ 
                width: handshakeStatus === 'idle' ? '0%' : 
                       handshakeStatus === 'complete' ? '100%' : '50%' 
              }}
            />
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            {handshakeStatus === 'waiting' && "Injecting Gaussian noise (e) to mask the secret vector (s) within the lattice grid."}
            {handshakeStatus === 'complete' && "Secure key derived. Noise discarded. Shared secret established."}
            {handshakeStatus === 'idle' && "Waiting for peers to begin LWE generation..."}
          </p>
        </div>
      </div>
    </div>
  );
};
