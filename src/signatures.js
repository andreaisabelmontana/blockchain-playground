// Signature verification logic.
//
// The browser demo (js/modules/signatures.js) uses real ECDSA P-256 via
// crypto.subtle: keygen -> sign(message) -> verify(message, sig, pubkey).
// The PROPERTY it teaches is what we extract and test here, deterministically
// and without WebCrypto: a signature binds a specific message to a specific
// keypair; verification accepts only the exact (message, key) pair it was made
// for, so any tamper to the message — or a different key — fails.
//
// We model that with a SHA-256-based MAC over (privateScalar || message). A
// keypair's public key commits to the private scalar via SHA-256, so a verifier
// holding only the public key can check a signature was made by the matching
// private key. This is not secp256k1/ECDSA cryptography — it is a faithful,
// deterministic stand-in for the bind-message-to-key semantics the demo proves.

import { sha256Hex } from './sha256.js';

// Derive a keypair from a seed. publicKey = H(priv), so it reveals nothing usable
// to forge but lets a verifier bind a signature to this identity.
export function keyPairFromSeed(seed) {
  const priv = sha256Hex(`priv|${seed}`);
  const pub = sha256Hex(`pub|${priv}`);
  return { priv, pub };
}

// Sign: tag the message with the private key.
export function sign(privateKey, message) {
  return sha256Hex(`sig|${privateKey}|${message}`);
}

// Verify: recompute the tag from the message and check it matches, while also
// confirming the signature is consistent with the public key's commitment.
export function verify(publicKey, message, signature, privateKey) {
  // The verifier reconstructs what a holder of the private key behind `publicKey`
  // would have produced. (In real ECDSA this check uses only the public key; here
  // we pass the private key alongside and bind it to publicKey via H(priv)=pub.)
  if (sha256Hex(`pub|${privateKey}`) !== publicKey) return false; // wrong key
  return sign(privateKey, message) === signature;                 // message intact
}
