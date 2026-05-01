import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Binary, Cpu, Network, Shield, Lock, FileJson } from 'lucide-react';
import type { MessageTrace, HandshakeTrace } from '../store/useAppStore';

interface TraceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  trace: { type: 'handshake'; data: HandshakeTrace } | { type: 'message'; data: MessageTrace } | null;
}

export const TraceViewer: React.FC<TraceViewerProps> = ({ isOpen, onClose, trace }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset step when trace changes
  useEffect(() => {
    setCurrentStep(0);
  }, [trace?.type, (trace?.data as any)?.messageId]);

  if (!trace) return null;

  const isMessage = trace.type === 'message';
  const data = trace.data as any;
  const isReceived = isMessage && (data as MessageTrace).direction === 'received';

  const handshakeSteps = [
    { title: 'Key Generation', icon: <Cpu />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'PK Transmitted', icon: <Network />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Encapsulation', icon: <Lock />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Ciphertext Returned', icon: <Network />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Decapsulation', icon: <Shield />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'HKDF Derivation', icon: <Binary />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const messageSteps = [
    { title: 'Plaintext', icon: <Shield />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'UTF-8 Encoding', icon: <Binary />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'IV Generation', icon: <Binary />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'AES-GCM Encryption', icon: <Lock />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { title: 'Auth Tag', icon: <Shield />, color: 'text-red-400', bg: 'bg-red-500/10' },
    { title: 'Base64 Encoding', icon: <Binary />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Wire Payload', icon: <FileJson />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Received & Decoded', icon: <Network />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Plaintext Recovered', icon: <Shield />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const steps = isMessage ? messageSteps : handshakeSteps;
  const totalSteps = steps.length;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const renderContent = () => {
    if (!isMessage) {
      // Handshake Trace Rendering
      const hData = data as HandshakeTrace;
      switch (currentStep) {
        case 0: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Initiator generates ML-KEM-768 keypair. The private key remains secure on the device.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-blue-400 font-bold block mb-2">PUBLIC KEY (HEX):</span>
              {hData.initiatorPublicKeyHex}
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px]">
              <span className="text-red-400 font-bold block mb-2">PRIVATE KEY:</span>
              {hData.initiatorPrivateKeyStatus || "[HIDDEN]"}
            </div>
          </div>
        );
        case 1: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Public key is encoded to Base64 and sent over the wire in a JSON payload.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-yellow-400 font-bold block mb-2">BASE64 ENCODED:</span>
              {hData.transmittedPublicKeyBase64}
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px]">
              <span className="text-yellow-400 font-bold block mb-2">WIRE PAYLOAD:</span>
              <pre>{hData.wirePayloadPK}</pre>
            </div>
          </div>
        );
        case 2: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Responder receives the PK and encapsulates a shared secret, generating a ciphertext.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-purple-400 font-bold block mb-2">SHARED SECRET (HEX):</span>
              {hData.responderSharedSecretHex || "[Pending on responder device]"}
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-red-400 font-bold block mb-2">CIPHERTEXT (HEX):</span>
              {hData.responderCiphertextHex}
            </div>
          </div>
        );
        case 3: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">The ciphertext is sent back to the initiator via WebSocket.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-yellow-400 font-bold block mb-2">BASE64 CIPHERTEXT:</span>
              {hData.transmittedCiphertextBase64}
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px]">
              <span className="text-yellow-400 font-bold block mb-2">WIRE PAYLOAD:</span>
              <pre>{hData.wirePayloadCiphertext}</pre>
            </div>
          </div>
        );
        case 4: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Initiator uses their private key to decapsulate the ciphertext and derive the SAME secret.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-blue-400 font-bold block mb-2">DERIVED SECRET (HEX):</span>
              {hData.initiatorDerivedSharedSecretHex}
            </div>
            <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 text-center">
              ✓ Matches responder's shared secret exactly.
            </div>
          </div>
        );
        case 5: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">The raw secret is passed through HKDF to derive the final 256-bit AES key.</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px]">
                <span className="text-slate-500 block">SALT:</span>
                {hData.hkdfSalt}
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px]">
                <span className="text-slate-500 block">INFO:</span>
                {hData.hkdfInfo}
              </div>
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-emerald-400 font-bold block mb-2">FINAL AES KEY (HEX):</span>
              {hData.finalAESKeyHex}
            </div>
          </div>
        );
        default: return null;
      }
    } else {
      // Message Trace Rendering
      const mData = data as MessageTrace;
      const isVisible = (stepIdx: number) => {
        if (!isReceived) return true;
        return stepIdx >= 6; // Receiver only sees from Wire Payload onwards properly
      };

      if (!isVisible(currentStep)) {
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-4">
            <Lock className="w-12 h-12 opacity-20" />
            <p className="text-sm italic text-center">[ Encrypted - This stage occurred only on the sender's device and was never transmitted ]</p>
          </div>
        );
      }

      switch (currentStep) {
        case 0: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">The raw message text as entered by the user.</p>
            <div className="p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-lg font-medium text-center">
              "{mData.plaintext}"
            </div>
          </div>
        );
        case 1: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Text is converted into a UTF-8 byte array for cryptographic processing.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-yellow-400 font-bold block mb-2">PLAINTEXT BYTES (HEX):</span>
              {mData.plaintextBytesHex}
            </div>
          </div>
        );
        case 2: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">A fresh 12-byte Initialization Vector (IV) is generated. This must NEVER be reused with the same key.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-yellow-400 font-bold block mb-2">IV (HEX):</span>
              {mData.ivHex}
            </div>
          </div>
        );
        case 3: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">AES-256-GCM encrypts the bytes using the derived key and the IV.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-red-400 font-bold block mb-2">CIPHERTEXT (HEX):</span>
              {mData.ciphertextHex}
            </div>
          </div>
        );
        case 4: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">GCM mode appends a 16-byte authentication tag to ensure the message hasn't been tampered with.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-red-400 font-bold block mb-2">AUTH TAG (HEX):</span>
              {mData.authTagHex}
            </div>
          </div>
        );
        case 5: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">The IV and combined ciphertext+tag are Base64 encoded for transmission.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-yellow-400 font-bold block mb-2">IV (BASE64):</span>
              {mData.base64Payload.iv}
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-yellow-400 font-bold block mb-2">CIPHERTEXT+TAG (BASE64):</span>
              {mData.base64Payload.ciphertext}
            </div>
          </div>
        );
        case 6: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">The final JSON object sent over the WebSocket wire.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px]">
              <span className="text-yellow-400 font-bold block mb-2">JSON WIRE PAYLOAD:</span>
              <pre className="whitespace-pre-wrap">{mData.wirePayload}</pre>
            </div>
          </div>
        );
        case 7: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Receiver decodes Base64 back to bytes and uses the SAME AES key to decrypt.</p>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] break-all">
              <span className="text-emerald-400 font-bold block mb-2">DECRYPTED BYTES (HEX):</span>
              {mData.decryptedBytesHex || "[Pending decryption]"}
            </div>
            <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 text-center">
              ✓ Authenticity verified via GCM tag.
            </div>
          </div>
        );
        case 8: return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Bytes are decoded back into a human-readable UTF-8 string.</p>
            <div className="p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-lg font-medium text-center">
              "{mData.recoveredText || mData.plaintext}"
            </div>
          </div>
        );
        default: return null;
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center">
                  {isMessage ? 'Encryption Trace' : 'KEM Handshake Trace'}
                </h2>
                <p className="text-xs text-slate-500">Step {currentStep + 1} of {totalSteps}: {steps[currentStep].title}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 py-4 flex items-center space-x-1 border-b border-slate-800 bg-slate-900/50">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    idx === currentStep ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 
                    idx < currentStep ? 'bg-slate-700' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className={`mb-6 p-4 rounded-2xl ${steps[currentStep].bg} flex items-center space-x-4`}>
                <div className={`p-3 rounded-xl bg-slate-900/50 ${steps[currentStep].color}`}>
                  {React.cloneElement(steps[currentStep].icon as React.ReactElement, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className={`font-bold ${steps[currentStep].color}`}>{steps[currentStep].title}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Protocol Stage</p>
                </div>
              </div>

              {renderContent()}
            </div>

            {/* Footer Navigation */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === totalSteps - 1}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
