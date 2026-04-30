import React, { useState } from 'react';

interface RoomEntryProps {
  onJoin: (room: string, username: string) => void;
}

export const RoomEntry: React.FC<RoomEntryProps> = ({ onJoin }) => {
  const [localRoom, setLocalRoom] = useState('');
  const [localUser, setLocalUser] = useState('');
  
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (localRoom.trim() && localUser.trim()) {
      onJoin(localRoom.trim(), localUser.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto p-6 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">QSEC Chat</h1>
        <p className="text-slate-400">Quantum-Secure Ephemeral Chat</p>
      </div>

      <form onSubmit={handleJoin} className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1 ml-1">Room ID</label>
          <input
            type="text"
            value={localRoom}
            onChange={(e) => setLocalRoom(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            placeholder="Enter room name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1 ml-1">Username</label>
          <input
            type="text"
            value={localUser}
            onChange={(e) => setLocalUser(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            placeholder="Who are you?"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-500/20 transform active:scale-95 transition-all mt-4"
        >
          Enter Secure Room
        </button>
      </form>

      <div className="mt-8 text-xs text-slate-500 text-center space-y-2">
        <p>🔒 Secured by ML-KEM-768 (Kyber)</p>
        <p>💨 No database. No logs. Ephemeral only.</p>
      </div>
    </div>
  );
};
