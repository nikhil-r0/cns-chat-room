/**
 * Base64 Encoding/Decoding Utilities
 */
export const arrayBufferToBase64 = (buffer: Uint8Array | ArrayBuffer): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Hex Encoding Utility
 */
export const bufferToHex = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
};

/**
 * Key Derivation Function (HKDF)
 * Derives a 256-bit AES key from the 32-byte shared secret.
 */
export const deriveAESKey = async (sharedSecret: Uint8Array): Promise<CryptoKey> => {
  const hkdfKey = await window.crypto.subtle.importKey(
    "raw",
    sharedSecret as any, // Cast to any to avoid strict Uint8Array vs BufferSource issues in some TS versions
    "HKDF",
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(32), // In this ephemeral 1-to-1 case, a static salt is acceptable per spec
      info: new TextEncoder().encode("qsec-chat-v1"),
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * AES-GCM Encryption with Trace Instrumentation
 */
export interface EncryptResult {
  ciphertext: string;
  iv: string;
  trace: any; // Using any here to avoid circular dependency with store if possible, or just define it
}

export const encryptMessage = async (key: CryptoKey, text: string, messageId: string): Promise<EncryptResult> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  
  const outputBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  // Split ciphertext and 16-byte auth tag
  const ciphertextBytes = outputBuffer.slice(0, -16);
  const authTagBytes = outputBuffer.slice(-16);

  const ciphertextBase64 = arrayBufferToBase64(ciphertextBytes);
  const ivBase64 = arrayBufferToBase64(iv);
  const authTagBase64 = arrayBufferToBase64(authTagBytes);
  
  // The wire payload is the combination of iv and the FULL output (ciphertext + tag)
  const fullCiphertextBase64 = arrayBufferToBase64(outputBuffer);

  const trace = {
    messageId,
    direction: 'sent',
    step: 'complete',
    plaintext: text,
    plaintextBytesHex: bufferToHex(encoded),
    ivHex: bufferToHex(iv),
    ciphertextHex: bufferToHex(ciphertextBytes),
    authTagHex: bufferToHex(authTagBytes),
    base64Payload: {
      iv: ivBase64,
      ciphertext: fullCiphertextBase64
    },
    wirePayload: JSON.stringify({
      type: 'chat_message',
      ciphertext: fullCiphertextBase64,
      iv: ivBase64
    }, null, 2)
  };

  return {
    ciphertext: fullCiphertextBase64,
    iv: ivBase64,
    trace
  };
};

/**
 * AES-GCM Decryption with Trace Instrumentation
 */
export interface DecryptResult {
  plaintext: string;
  trace: any;
}

export const decryptMessage = async (key: CryptoKey, ciphertext: string, iv: string, messageId: string): Promise<DecryptResult> => {
  const ivBytes = base64ToArrayBuffer(iv);
  const fullCiphertextBytes = base64ToArrayBuffer(ciphertext);
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes as any },
    key,
    fullCiphertextBytes as any
  );

  const plaintext = new TextDecoder().decode(decryptedBuffer);
  
  // Extract bytes for trace
  const ciphertextBytes = fullCiphertextBytes.slice(0, -16);
  const authTagBytes = fullCiphertextBytes.slice(-16);

  const trace = {
    messageId,
    direction: 'received',
    step: 'complete',
    receivedPayload: JSON.stringify({ type: 'chat_message', ciphertext, iv }, null, 2),
    ivHex: bufferToHex(ivBytes),
    ciphertextHex: bufferToHex(ciphertextBytes),
    authTagHex: bufferToHex(authTagBytes),
    decryptedBytesHex: bufferToHex(new Uint8Array(decryptedBuffer)),
    recoveredText: plaintext,
    base64Payload: { iv, ciphertext },
    wirePayload: JSON.stringify({ type: 'chat_message', ciphertext, iv }, null, 2)
  };

  return {
    plaintext,
    trace
  };
};

/**
 * Handshake Fingerprint
 * Generates a short human-readable fingerprint of the public key for verification.
 */
export const getFingerprint = async (publicKey: Uint8Array): Promise<string> => {
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', publicKey as any);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
};
