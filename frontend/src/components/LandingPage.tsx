import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Zap, Cpu, Network, Binary, Search, ChevronRight, Play, ExternalLink, ArrowLeft } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // LWE Toy State
  const [gridDim, setGridDim] = useState(6);
  const [secret, setSecret] = useState({ x: 2, y: 2 });
  const [noise, setNoise] = useState(0);
  const [noiseOffset, setNoiseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (noise === 0) {
      setNoiseOffset({ x: 0, y: 0 });
    } else {
      // Re-calculate noise offset based on noise level and grid spacing
      const spacing = 100 / (gridDim - 1);
      const angle = Math.random() * Math.PI * 2;
      const magnitude = (noise / 100) * spacing * 1.5; // Max 1.5 grid units drift
      setNoiseOffset({
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude
      });
    }
  }, [noise, secret, gridDim]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const spacing = 100 / (gridDim - 1);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-end bg-slate-900/50 backdrop-blur-md border-b border-white/5">
        <div className="text-xs text-slate-500 font-mono tracking-widest hidden md:block">
          FIPS 203 / ML-KEM-768
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-24 md:pt-32">
        {/* Animated Lattice Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" className="animate-[pulse_4s_ease-in-out_infinite]">
            <pattern id="lattice" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#334155" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#lattice)" />
          </svg>
        </div>

        <motion.div 
          initial="hidden" animate="visible" variants={variants}
          className="relative z-10 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            QSEC — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Quantum-Secure</span> Ephemeral Chat
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 leading-relaxed font-light">
            End-to-end encrypted with ML-KEM-768 (FIPS 203) — the world's first post-quantum cryptography standard.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
            <button 
              onClick={onEnterApp}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-cyan-500/20 flex items-center transition-all transform hover:scale-105 active:scale-95"
            >
              Enter a Room <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Section 1: The Threat */}
      <section className="py-24 px-6 max-w-6xl mx-auto border-t border-white/5">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          <div>
            <h2 className="text-4xl font-black text-white mb-8">The Internet Is Already Compromised</h2>
            <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
              <p>
                In 1994, mathematician Peter Shor published an algorithm proving that a sufficiently powerful quantum computer could factor large integers and solve discrete logarithms exponentially faster than any classical computer. This directly and completely breaks RSA, Diffie-Hellman, and Elliptic Curve Cryptography (ECC).
              </p>
              <p className="text-white font-medium italic border-l-4 border-cyan-500 pl-4 bg-cyan-500/5 py-2">
                "Harvest Now, Decrypt Later" (HNDL): Adversaries are collecting and archiving encrypted traffic TODAY. Sensitive communications captured in 2026 could be decrypted in 2032.
              </p>
              <p>
                While symmetric algorithms like AES-256 remain secure, public-key cryptography—the backbone of internet trust—is facing an existential threat. The transition to post-quantum cryptography needs to start now.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 space-y-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">PQC Development Timeline</h3>
            <div className="space-y-4">
              {[
                { year: '1994', event: "Shor's Algorithm published" },
                { year: '1996', event: "Ajtai introduces lattice hardness proofs" },
                { year: '2005', event: "Oded Regev defines LWE problem" },
                { year: '2016', event: "NIST launches global PQC competition" },
                { year: '2017', event: "CRYSTALS-Kyber submitted to NIST" },
                { year: '2022', event: "Kyber selected as finalist" },
                { year: '2024', event: "Standardized as ML-KEM / FIPS 203" },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <span className="text-cyan-400 font-mono font-bold w-12">{item.year}</span>
                  <div className="h-2 w-2 rounded-full bg-slate-700" />
                  <span className="text-slate-300 text-sm">{item.event}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 2: The Math - LWE */}
      <section className="py-24 bg-slate-900/30">
        <div className="px-6 max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-white mb-4">The Problem No Quantum Computer Can Solve (Yet)</h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto">
              Lattice-based cryptography relies on the hardness of Finding the Nearest Vector in a high-dimensional space.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
              <p>
                Oded Regev introduced the Learning With Errors (LWE) problem in 2005 and proved its quantum hardness. The problem is deceptively simple:
              </p>
              <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 font-mono text-sm">
                <p className="text-cyan-400 mb-2">Given a matrix A, a secret vector s, and small noise e:</p>
                <p className="text-white text-xl">b = A·s + e (mod q)</p>
                <p className="mt-4 text-slate-500">Now, given only A and b, find s.</p>
              </div>
              <p>
                Without the noise, this is trivially solvable via Gaussian elimination. With even a tiny amount of noise, it becomes computationally intractable—for both classical AND quantum computers.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <h4 className="text-white font-bold text-sm mb-1">Shortest Vector (SVP)</h4>
                  <p className="text-xs text-slate-500">Find the shortest non-zero vector in a lattice.</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                  <h4 className="text-white font-bold text-sm mb-1">Closest Vector (CVP)</h4>
                  <p className="text-xs text-slate-500">Find the nearest lattice point to a target point.</p>
                </div>
              </div>
            </div>

            {/* Interactive LWE Toy */}
            <div className="bg-slate-950 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-[10px] font-mono text-slate-600 uppercase tracking-tighter">
                Visualizing the Trapdoor
              </div>
              <h3 className="text-white font-bold mb-2 flex items-center">
                <Binary className="w-5 h-4 mr-2 text-cyan-500" /> LWE Interactive Lab
              </h3>
              <p className="text-[11px] text-slate-500 mb-6 leading-tight">
                Click the grid to set a <b>Secret (s)</b>. Use the sliders to adjust the lattice and add <b>Noise (e)</b>.
              </p>
              
              <div className="aspect-square bg-slate-900 rounded-2xl relative mb-6 overflow-hidden border border-white/5 cursor-crosshair group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const size = rect.width;
                  const innerSize = size * 0.8;
                  const offsetX = size * 0.12;
                  const offsetY = size * 0.08;
                  
                  const x = Math.round((e.clientX - rect.left - offsetX) / (innerSize / (gridDim - 1)));
                  const y = (gridDim - 1) - Math.round((e.clientY - rect.top - offsetY) / (innerSize / (gridDim - 1)));
                  
                  setSecret({ 
                    x: Math.max(0, Math.min(gridDim - 1, x)), 
                    y: Math.max(0, Math.min(gridDim - 1, y)) 
                  });
                }}
              >
                {/* Grid with Axes */}
                <svg width="100%" height="100%" viewBox="-15 -10 125 125" className="overflow-visible">
                  {/* Y-Axis */}
                  <line x1="0" y1="0" x2="0" y2="100" stroke="#334155" strokeWidth="0.5" />
                  {/* X-Axis */}
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#334155" strokeWidth="0.5" />
                  
                  {/* Axis Labels & Grid Lines */}
                  {[...Array(gridDim)].map((_, i) => {
                    const pos = i * spacing;
                    return (
                      <React.Fragment key={i}>
                        <text x="-8" y={100 - pos + 2} fill="#475569" fontSize="5" textAnchor="end">{i}</text>
                        <text x={pos} y="108" fill="#475569" fontSize="5" textAnchor="middle">{i}</text>
                        <line x1="0" y1={100 - pos} x2="100" y2={100 - pos} stroke="#334155" strokeWidth="0.1" strokeDasharray="1 1" />
                        <line x1={pos} y1="0" x2={pos} y2="100" stroke="#334155" strokeWidth="0.1" strokeDasharray="1 1" />
                      </React.Fragment>
                    );
                  })}

                  <text x="110" y="102" fill="#475569" fontSize="4" fontWeight="bold">X</text>
                  <text x="-2" y="-4" fill="#475569" fontSize="4" fontWeight="bold">Y</text>

                  {/* Lattice Points */}
                  {[...Array(gridDim)].map((_, i) => (
                    [...Array(gridDim)].map((_, j) => (
                      <circle key={`${i}-${j}`} cx={i * spacing} cy={100 - j * spacing} r="1" fill="#334155" />
                    ))
                  ))}
                  
                  {/* Secret Intersection */}
                  <circle cx={secret.x * spacing} cy={100 - secret.y * spacing} r="2.5" className="fill-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                  
                  {/* Noisy Point */}
                  <motion.circle 
                    cx={secret.x * spacing + noiseOffset.x} 
                    cy={100 - (secret.y * spacing + noiseOffset.y)} 
                    r="3" className="fill-red-500"
                    animate={{ x: noiseOffset.x, y: -noiseOffset.y }}
                    transition={{ type: 'spring', damping: 12 }}
                  />
                  {noise > 0 && (
                    <line 
                      x1={secret.x * spacing} y1={100 - secret.y * spacing} 
                      x2={secret.x * spacing + noiseOffset.x} y2={100 - (secret.y * spacing + noiseOffset.y)} 
                      stroke="#ef4444" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4"
                    />
                  )}
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-3 left-3 flex flex-col space-y-1 bg-slate-950/80 backdrop-blur-sm p-2 rounded-lg border border-white/5 pointer-events-none">
                  <div className="flex items-center space-x-2 text-[9px] font-bold uppercase">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-blue-400">Secret (s)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[9px] font-bold uppercase">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-400">Public Point (b)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
                      <span className="text-slate-500 font-bold">Grid Dimensions</span>
                      <span className="text-cyan-400 font-black">{gridDim}x{gridDim}</span>
                    </div>
                    <input 
                      type="range" min="4" max="12" value={gridDim} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setGridDim(val);
                        setSecret({ x: Math.floor(val/2), y: Math.floor(val/2) });
                      }}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
                      <span className="text-slate-500 font-bold">Noise (e)</span>
                      <span className="text-red-400 font-black">{noise}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={noise} 
                      onChange={(e) => setNoise(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                  </div>
                </div>

                {/* Live Equation Panel */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Secret Vector (s)</span>
                    <span className="text-blue-400 font-bold">[{secret.x}, {secret.y}]</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500">Noise Vector (e)</span>
                    <span className="text-red-400 font-bold">
                      [{(noiseOffset.x/spacing).toFixed(2)}, {(noiseOffset.y/spacing).toFixed(2)}]
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 font-bold uppercase tracking-tighter">Public Key (b = s + e)</span>
                    <span className="text-white font-black">
                      [{(secret.x + noiseOffset.x/spacing).toFixed(2)}, {(secret.y + noiseOffset.y/spacing).toFixed(2)}]
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10">
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    The <b>Closest Vector Problem</b>: An attacker sees only <b>b</b>. Without the secret trapdoor, finding the original <b>s</b> in 256 dimensions is mathematically impossible for current quantum computers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The Algorithm */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
          className="space-y-16"
        >
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-4">ML-KEM-768: The World's First Post-Quantum Standard</h2>
            <p className="text-cyan-400 font-bold uppercase tracking-widest text-sm">
              Standardized as FIPS 203 by NIST in August 2024
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold">NIST Finalist</h4>
              <p className="text-sm text-slate-400">ML-KEM (formerly CRYSTALS-Kyber) was selected as the primary standard from 69 global submissions.</p>
            </div>
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold">Unrivaled Performance</h4>
              <p className="text-sm text-slate-400">Completes encapsulation in ~23 microseconds—orders of magnitude faster than classical RSA operations.</p>
            </div>
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold">CCA2 Secure</h4>
              <p className="text-sm text-slate-400">Uses Fujisaki-Okamoto transform to provide security against adaptive chosen-ciphertext attacks.</p>
            </div>
          </div>

          {/* Byte Size Table */}
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-slate-900/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">Algorithm</th>
                  <th className="px-6 py-4">Public Key Size</th>
                  <th className="px-6 py-4">Security Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5 text-slate-400">
                  <td className="px-6 py-4">RSA-2048</td>
                  <td className="px-6 py-4">256 bytes</td>
                  <td className="px-6 py-4 text-red-500">Quantum-Broken</td>
                </tr>
                <tr className="border-b border-white/5 text-slate-400">
                  <td className="px-6 py-4">ECDH (P-256)</td>
                  <td className="px-6 py-4">32 bytes</td>
                  <td className="px-6 py-4 text-red-500">Quantum-Broken</td>
                </tr>
                <tr className="bg-cyan-500/10 border-l-4 border-cyan-500 text-white font-bold">
                  <td className="px-6 py-4">ML-KEM-768</td>
                  <td className="px-6 py-4">1,184 bytes</td>
                  <td className="px-6 py-4 text-cyan-400">Quantum-Safe</td>
                </tr>
                <tr className="text-slate-400">
                  <td className="px-6 py-4">Classic McEliece</td>
                  <td className="px-6 py-4">~1,044,992 bytes</td>
                  <td className="px-6 py-4 text-emerald-500">Safe but Impractical</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* Section 4: How This App Uses It */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img 
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200" 
                alt="Cybersecurity" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Zero Knowledge Architecture</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Authenticated Enclave</h3>
                <p className="text-sm text-slate-300">Encryption keys are ephemeral and never persist beyond the active session.</p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-black text-white">Zero Knowledge. Zero Storage. Zero Trust Required.</h2>
              <ul className="space-y-4">
                {[
                  "All cryptographic operations happen exclusively in your browser.",
                  "No database. No accounts. No logs. history is wiped instantly.",
                  "Messages are encrypted with AES-256-GCM + 12-byte fresh IVs.",
                  "ML-KEM key exchange is performed fresh on every room join.",
                  "Inspect every byte journey with the Encryption Trace feature."
                ].map((text, i) => (
                  <li key={i} className="flex items-start space-x-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] flex-shrink-0" />
                    <span className="text-slate-400 text-lg leading-snug">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: Video Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
          className="space-y-12"
        >
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-4">Go Deeper</h2>
            <p className="text-slate-400">Visual essays and lectures on Lattice-Based Cryptography.</p>
          </div>

          <div className="max-w-4xl mx-auto aspect-video rounded-3xl overflow-hidden border border-white/10 bg-slate-900 relative shadow-2xl">
            {!isVideoPlaying ? (
              <div 
                className="absolute inset-0 cursor-pointer group"
                onClick={() => setIsVideoPlaying(true)}
              >
                <img 
                  src="https://img.youtube.com/vi/M1cq7cuonbI/maxresdefault.jpg" 
                  alt="Video Thumbnail" 
                  className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Lecture: Learning With Errors (LWE) Problem</h3>
                  <p className="text-slate-400 text-sm">Professor Alfred Menezes, University of Waterloo</p>
                </div>
              </div>
            ) : (
              <iframe 
                width="100%" height="100%" 
                src="https://www.youtube.com/embed/M1cq7cuonbI?autoplay=1" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "NIST Round 3 Presentation", url: "https://www.youtube.com/watch?v=YsnmYl7BsgY", label: "Official CRYSTALS-Kyber" },
              { title: "Post-Quantum Cryptography Explained", url: "https://www.youtube.com/watch?v=evAx8_q5wMw", label: "Kyber Technical Overview" },
              { title: "Attacking Lattice Cryptography", url: "https://www.youtube.com/watch?v=9-ypSYpIAUA", label: "Cryptanalysis Research" }
            ].map((v, i) => (
              <a 
                key={i} href={v.url} target="_blank" rel="noopener noreferrer"
                className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all group"
              >
                <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mb-2">{v.label}</div>
                <div className="text-white font-bold group-hover:text-cyan-400 flex items-center justify-between">
                  {v.title} <ExternalLink className="w-4 h-4 opacity-50" />
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 6: Papers */}
      <section className="py-24 px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}
            className="space-y-12"
          >
            <h2 className="text-4xl font-black text-white">Primary Sources</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { 
                  title: "FIPS 203: Module-Lattice-Based KEM Standard", 
                  authors: "NIST, 2024", 
                  url: "https://csrc.nist.gov/pubs/fips/203/final", 
                  note: "The official standard. This is what QSEC implements."
                },
                { 
                  title: "CRYSTALS-Kyber: A CCA-Secure ML-KEM", 
                  authors: "Avanzi et al., 2017", 
                  url: "https://eprint.iacr.org/2017/634.pdf", 
                  note: "The original academic paper describing the algorithm."
                },
                { 
                  title: "On Lattices, Learning with Errors, and Cryptography", 
                  authors: "Oded Regev, 2005", 
                  url: "https://dl.acm.org/doi/10.1145/1568318.1568324", 
                  note: "Foundational paper. Regev won the 2018 Gödel Prize for this work."
                },
                { 
                  title: "Ideal Lattices and LWE Over Rings", 
                  authors: "Lyubashevsky, Peikert, Regev, 2010", 
                  url: "https://eprint.iacr.org/2012/230.pdf", 
                  note: "Introduces Ring-LWE, the precursor to Module-LWE."
                },
                { 
                  title: "Harvest-Now, Decrypt-Later Risk Analysis", 
                  authors: "MDPI Applied Sciences, 2025", 
                  url: "https://www.mdpi.com/2673-4001/6/4/100", 
                  note: "Formal treatment of the HNDL threat model."
                },
                { 
                  title: "Performance and Storage Analysis of ML-KEM", 
                  authors: "arXiv, 2025", 
                  url: "https://arxiv.org/html/2508.01694v3", 
                  note: "Benchmarking and migration analysis."
                }
              ].map((paper, i) => (
                <div key={i} className="p-6 bg-slate-900/30 rounded-2xl border border-white/5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-white font-bold leading-tight">{paper.title}</h4>
                    <p className="text-xs text-slate-500 italic">{paper.authors}</p>
                  </div>
                  <p className="text-sm text-slate-400">{paper.note}</p>
                  <a 
                    href={paper.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center text-cyan-400 text-xs font-bold uppercase tracking-widest hover:text-cyan-300 transition-colors"
                  >
                    Read Paper <ChevronRight className="ml-1 w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>© 2026 QSEC Project — Built for high-assurance ephemeral communication.</p>
      </footer>

      {/* Sticky CTA */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <button 
              onClick={onEnterApp}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-2xl shadow-cyan-500/40 flex items-center transition-all"
            >
              Enter a Room <ChevronRight className="ml-2 w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
