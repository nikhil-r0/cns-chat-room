/**
 * Base64 Encoding/Decoding Utilities
 */
export const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
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
 * AES-GCM Encryption
 */
export const encryptMessage = async (key: CryptoKey, text: string): Promise<{ ciphertext: string; iv: string }> => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  return {
    ciphertext: arrayBufferToBase64(new Uint8Array(ciphertextBuffer)),
    iv: arrayBufferToBase64(iv)
  };
};

/**
 * AES-GCM Decryption
 */
export const decryptMessage = async (key: CryptoKey, ciphertext: string, iv: string): Promise<string> => {
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToArrayBuffer(iv) as any },
    key,
    base64ToArrayBuffer(ciphertext) as any
  );

  return new TextDecoder().decode(decryptedBuffer);
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
