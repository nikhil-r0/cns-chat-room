import { create } from 'zustand';

interface User {
  id: string;
  username: string;
}

export interface MessageTrace {
  messageId: string;
  direction: 'sent' | 'received';
  step: 'encrypting' | 'decrypting' | 'complete';
  plaintext?: string;
  plaintextBytesHex?: string;
  ivHex?: string;
  ciphertextHex: string;
  authTagHex?: string;
  base64Payload: { iv: string; ciphertext: string };
  wirePayload: string;
  receivedPayload?: string;
  decryptedBytesHex?: string;
  recoveredText?: string;
}

export interface HandshakeTrace {
  initiatorPublicKeyHex?: string;
  initiatorPrivateKeyStatus?: string;
  transmittedPublicKeyBase64?: string;
  wirePayloadPK?: string;
  responderCiphertextHex?: string;
  responderSharedSecretHex?: string;
  transmittedCiphertextBase64?: string;
  wirePayloadCiphertext?: string;
  initiatorDerivedSharedSecretHex?: string;
  hkdfSalt?: string;
  hkdfInfo?: string;
  finalAESKeyHex?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  trace?: MessageTrace;
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
  handshakeTrace: HandshakeTrace;
  
  // Actions
  setUsername: (username: string) => void;
  setRoomId: (room_id: string) => void;
  setUserId: (userId: string) => void;
  setYourRole: (role: 'initiator' | 'responder' | null) => void;
  setUsers: (users: User[]) => void;
  addMessage: (message: Message) => void;
  setHandshakeStatus: (status: AppState['handshakeStatus']) => void;
  setCrypto: (data: Partial<Pick<AppState, 'publicKey' | 'privateKey' | 'sharedSecret' | 'aesKey'>>) => void;
  updateHandshakeTrace: (data: Partial<HandshakeTrace>) => void;
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
  handshakeTrace: {},
  
  setUsername: (username) => set({ username }),
  setRoomId: (room_id) => set({ room_id }),
  setUserId: (userId) => set({ userId }),
  setYourRole: (role) => set({ yourRole: role }),
  setUsers: (users) => set({ users }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setHandshakeStatus: (status) => set({ handshakeStatus: status }),
  setCrypto: (data) => set((state) => ({ ...state, ...data })),
  updateHandshakeTrace: (data) => set((state) => ({ 
    handshakeTrace: { ...state.handshakeTrace, ...data } 
  })),
  resetRoom: () => set({
    room_id: '',
    yourRole: null,
    users: [],
    messages: [],
    publicKey: null,
    privateKey: null,
    sharedSecret: null,
    aesKey: null,
    handshakeStatus: 'idle',
    handshakeTrace: {}
  })
}));
