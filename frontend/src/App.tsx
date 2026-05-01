import { useEffect, useRef, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAppStore } from './store/useAppStore';
import type { MessageTrace, HandshakeTrace } from './store/useAppStore';
import { RoomEntry } from './components/RoomEntry';
import { ChatInterface } from './components/ChatInterface';
import { TraceViewer } from './components/TraceViewer';
import { ShieldAlert, RefreshCw, Fingerprint, Search } from 'lucide-react';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { 
  arrayBufferToBase64, base64ToArrayBuffer, 
  deriveAESKey, encryptMessage, decryptMessage, getFingerprint, bufferToHex 
} from './lib/crypto';

const WS_URL = 'ws://localhost:8000/ws';

function App() {
  const { 
    room_id, username, setRoomId, setUsername, 
    userId, setUserId, yourRole, setYourRole, users, setUsers, 
    addMessage, resetRoom, 
    publicKey, privateKey, aesKey, setCrypto,
    handshakeStatus, setHandshakeStatus,
    handshakeTrace, updateHandshakeTrace
  } = useAppStore();

  const socketUrl = room_id ? `${WS_URL}/${room_id}` : null;
  const timeoutRef = useRef<any>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  
  // Trace Viewer State
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<{ type: 'handshake'; data: HandshakeTrace } | { type: 'message'; data: MessageTrace } | null>(null);


  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      sendJsonMessage({ type: 'join_room', username: username });
    },
    shouldReconnect: () => true,
  });

  // Handshake Logic: Initiator (Alice) starts when Bob joins
  useEffect(() => {
    if (yourRole === 'initiator' && users.length === 2 && handshakeStatus === 'idle') {
      console.log('Initiating PQC handshake...');
      setHandshakeStatus('generating');
      
      const aliceKeys = ml_kem768.keygen();
      setCrypto({ 
        publicKey: aliceKeys.publicKey, 
        privateKey: aliceKeys.secretKey 
      });

      const pkBase64 = arrayBufferToBase64(aliceKeys.publicKey);
      const wirePayload = JSON.stringify({ type: 'public_key', publicKeyBase64: pkBase64 }, null, 2);

      updateHandshakeTrace({
        initiatorPublicKeyHex: bufferToHex(aliceKeys.publicKey),
        initiatorPrivateKeyStatus: "[HIDDEN - never leaves device]",
        transmittedPublicKeyBase64: pkBase64,
        wirePayloadPK: wirePayload
      });

      sendJsonMessage({
        type: 'public_key',
        publicKeyBase64: pkBase64
      });

      setHandshakeStatus('waiting');
      
      // Set 10s timeout for Bob's response
      timeoutRef.current = setTimeout(() => {
        if (useAppStore.getState().handshakeStatus !== 'complete') {
          console.error('Handshake timeout reached');
          setHandshakeStatus('failed');
          alert('Secure handshake timed out. Please refresh or try again.');
        }
      }, 10000);
    }
  }, [yourRole, users.length, handshakeStatus, setHandshakeStatus, setCrypto, sendJsonMessage, updateHandshakeTrace]);

  // Handle incoming messages
  useEffect(() => {
    if (lastJsonMessage) {
      const message = lastJsonMessage as any;
      
      const handleHandshakeMessage = async () => {
        switch (message.type) {
          case 'room_state':
            setUsers(message.users);
            setYourRole(message.yourRole);
            const me = message.users.find((u: any) => u.username === username);
            if (me) setUserId(me.id);
            break;

          case 'public_key':
            if (yourRole === 'responder' && handshakeStatus === 'idle') {
              console.log('Received public key, encapsulating...');
              setHandshakeStatus('encapsulating');
              
              const peerPubKey = base64ToArrayBuffer(message.publicKeyBase64);
              const bobEnc = ml_kem768.encapsulate(peerPubKey);
              
              const bobAESKey = await deriveAESKey(bobEnc.sharedSecret);
              const fp = await getFingerprint(peerPubKey);
              setFingerprint(fp);

              const ciphertextBase64 = arrayBufferToBase64(bobEnc.cipherText);
              const wirePayload = JSON.stringify({ type: 'encapsulated_key', ciphertextBase64 }, null, 2);

              updateHandshakeTrace({
                initiatorPublicKeyHex: bufferToHex(peerPubKey),
                transmittedPublicKeyBase64: message.publicKeyBase64,
                responderSharedSecretHex: bufferToHex(bobEnc.sharedSecret),
                responderCiphertextHex: bufferToHex(bobEnc.cipherText),
                transmittedCiphertextBase64: ciphertextBase64,
                wirePayloadCiphertext: wirePayload,
                hkdfSalt: bufferToHex(new Uint8Array(32)),
                hkdfInfo: "qsec-chat-v1",
                finalAESKeyHex: "[Derived from shared secret]" // Subtle Crypto keys aren't directly exportable as hex easily without exportKey
              });

              setCrypto({
                sharedSecret: bobEnc.sharedSecret,
                aesKey: bobAESKey,
                publicKey: peerPubKey
              });

              sendJsonMessage({
                type: 'encapsulated_key',
                ciphertextBase64: ciphertextBase64
              });

              setHandshakeStatus('complete');
            }
            break;

          case 'encapsulated_key':
            if (yourRole === 'initiator' && handshakeStatus === 'waiting' && privateKey) {
              console.log('Received ciphertext, decapsulating...');
              setHandshakeStatus('decapsulating');
              
              if (timeoutRef.current) clearTimeout(timeoutRef.current);

              const ciphertext = base64ToArrayBuffer(message.ciphertextBase64);
              const aliceSharedSecret = ml_kem768.decapsulate(ciphertext, privateKey);
              
              const aliceAESKey = await deriveAESKey(aliceSharedSecret);
              const fp = await getFingerprint(publicKey!);
              setFingerprint(fp);

              updateHandshakeTrace({
                responderCiphertextHex: bufferToHex(ciphertext),
                transmittedCiphertextBase64: message.ciphertextBase64,
                initiatorDerivedSharedSecretHex: bufferToHex(aliceSharedSecret),
                hkdfSalt: bufferToHex(new Uint8Array(32)),
                hkdfInfo: "qsec-chat-v1",
                finalAESKeyHex: "[Derived from shared secret]"
              });

              setCrypto({
                sharedSecret: aliceSharedSecret,
                aesKey: aliceAESKey
              });

              setHandshakeStatus('complete');
            }
            break;

          case 'chat_message':
            if (aesKey && message.ciphertext && message.iv) {
              try {
                const messageId = Math.random().toString(36).substr(2, 9);
                const { plaintext, trace } = await decryptMessage(aesKey, message.ciphertext, message.iv, messageId);
                addMessage({
                  id: messageId,
                  senderId: message.senderId,
                  text: plaintext,
                  timestamp: Date.now(),
                  trace
                });
              } catch (e) {
                console.error('Decryption failed', e);
              }
            }
            break;

          case 'error':
            alert(message.message);
            resetRoom();
            break;
        }
      };

      handleHandshakeMessage();
    }
  }, [lastJsonMessage, yourRole, handshakeStatus, privateKey, publicKey, aesKey, setUsers, setYourRole, setUserId, username, resetRoom, addMessage, setHandshakeStatus, setCrypto, sendJsonMessage, updateHandshakeTrace]);

  const handleJoin = (room: string, user: string) => {
    setRoomId(room);
    setUsername(user);
  };

  const handleSendMessage = async (text: string) => {
    if (aesKey) {
      const messageId = Math.random().toString(36).substr(2, 9);
      const { ciphertext, iv, trace } = await encryptMessage(aesKey, text, messageId);
      sendJsonMessage({
        type: 'chat_message',
        ciphertext,
        iv
      });
      
      addMessage({
        id: messageId,
        senderId: userId,
        text: text,
        timestamp: Date.now(),
        trace
      });
    }
  };

  const openHandshakeTrace = () => {
    setSelectedTrace({ type: 'handshake', data: handshakeTrace });
    setIsTraceOpen(true);
  };

  const openMessageTrace = (trace: MessageTrace) => {
    setSelectedTrace({ type: 'message', data: trace });
    setIsTraceOpen(true);
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-cyan-500/30 font-sans p-4 md:p-8">
      {!room_id ? (
        <RoomEntry onJoin={handleJoin} />
      ) : (
        <div className="space-y-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-2">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white flex items-center">
                Room: <span className="text-cyan-400 ml-2">{room_id}</span>
                {handshakeStatus === 'complete' && (
                  <button 
                    onClick={openHandshakeTrace}
                    className="ml-3 flex items-center px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 uppercase tracking-tighter hover:bg-emerald-500/20 transition-colors"
                  >
                    <Fingerprint className="w-3 h-3 mr-1" /> Verified: {fingerprint}
                  </button>
                )}
              </h2>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <span className={`w-2 h-2 rounded-full mr-2 ${readyState === ReadyState.OPEN ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                {connectionStatus} • {username} ({yourRole})
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={openHandshakeTrace}
                disabled={handshakeStatus !== 'complete'}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>View Key Exchange</span>
              </button>
              <button 
                onClick={resetRoom}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                title="Leave Room"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ChatInterface onSendMessage={handleSendMessage} onInspectMessage={openMessageTrace} />
          
          <TraceViewer 
            isOpen={isTraceOpen} 
            onClose={() => setIsTraceOpen(false)} 
            trace={selectedTrace} 
          />
          
          {readyState !== ReadyState.OPEN && room_id && (
            <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center text-red-400 text-sm">
              <ShieldAlert className="w-5 h-5 mr-3" />
              Connection lost. Attempting to reconnect...
            </div>
          )}
          
          {handshakeStatus === 'failed' && (
            <div className="max-w-4xl mx-auto bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center text-amber-400 text-sm">
              <ShieldAlert className="w-5 h-5 mr-3" />
              Secure handshake failed. Please refresh both clients to try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
