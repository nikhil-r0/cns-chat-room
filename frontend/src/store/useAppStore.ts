import { create } from 'zustand';

interface User {
  id: string;
  username: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

interface AppState {
  username: string;
  room_id: string;
  userId: string;
  yourRole: 'initiator' | 'responder' | null;
  users: User[];
  messages: Message[];
  
  // Crypto State
  publicKey: Uint8Array | null;
  privateKey: Uint8Array | null;
  sharedSecret: Uint8Array | null;
  aesKey: CryptoKey | null;
  
  // Handshake State
  handshakeStatus: 'idle' | 'generating' | 'waiting' | 'encapsulating' | 'decapsulating' | 'complete' | 'failed';
  
  // Actions
  setUsername: (username: string) => void;
  setRoomId: (room_id: string) => void;
  setUserId: (userId: string) => void;
  setYourRole: (role: 'initiator' | 'responder' | null) => void;
  setUsers: (users: User[]) => void;
  addMessage: (message: Message) => void;
  setHandshakeStatus: (status: AppState['handshakeStatus']) => void;
  setCrypto: (data: Partial<Pick<AppState, 'publicKey' | 'privateKey' | 'sharedSecret' | 'aesKey'>>) => void;
  resetRoom: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  username: '',
  room_id: '',
  userId: '',
  yourRole: null,
  users: [],
  messages: [],
  
  publicKey: null,
  privateKey: null,
  sharedSecret: null,
  aesKey: null,
  handshakeStatus: 'idle',
  
  setUsername: (username) => set({ username }),
  setRoomId: (room_id) => set({ room_id }),
  setUserId: (userId) => set({ userId }),
  setYourRole: (role) => set({ yourRole: role }),
  setUsers: (users) => set({ users }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setHandshakeStatus: (status) => set({ handshakeStatus: status }),
  setCrypto: (data) => set((state) => ({ ...state, ...data })),
  resetRoom: () => set({
    room_id: '',
    yourRole: null,
    users: [],
    messages: [],
    publicKey: null,
    privateKey: null,
    sharedSecret: null,
    aesKey: null,
    handshakeStatus: 'idle'
  })
}));
