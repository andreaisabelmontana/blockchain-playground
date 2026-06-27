// Proof-of-work: find a nonce so SHA-256(preimage + nonce) has N leading zero
// hex chars. Mirrors the nonce search in js/modules/mining.js and blockchain.js.

import { sha256Hex, leadingZeros } from './sha256.js';

// A hash meets `difficulty` when it starts with that many '0' hex chars.
export function hashMeetsDifficulty(hash, difficulty) {
  return leadingZeros(hash) >= difficulty;
}

// The blockchain demo hashes `${preimage}|${nonce}` (preimage already ends with
// the prev hash + a separator). We accept a base string and append the nonce.
export function powHash(base, nonce) {
  // base already ends right before the nonce in the demo's `a|b|c|nonce` format,
  // but for a standalone PoW we just join with the nonce.
  return sha256Hex(`${base}${nonce}`);
}

// Mine: search nonces 0,1,2,... until the hash meets `difficulty`.
// Returns { nonce, hash, hashes }. `base` is the full preimage minus the nonce;
// for the chain demo pass the `index|data|prev|` head (note trailing separator),
// or any string — verification just re-runs the same join.
export function mine(base, difficulty = 0, maxNonce = 5_000_000) {
  const target = '0'.repeat(difficulty);
  for (let nonce = 0; nonce <= maxNonce; nonce++) {
    const hash = sha256Hex(joinNonce(base, nonce));
    if (hash.startsWith(target)) {
      return { nonce, hash, hashes: nonce + 1 };
    }
  }
  throw new Error(`no nonce found below ${maxNonce} for difficulty ${difficulty}`);
}

// Verify a claimed nonce actually produces a hash meeting the difficulty.
export function verifyPow(base, nonce, difficulty) {
  const hash = sha256Hex(joinNonce(base, nonce));
  return hashMeetsDifficulty(hash, difficulty);
}

// The chain demo's preimage is `index|data|prev|nonce`. buildChain passes the
// full `index|data|prev|0` string as the block preimage, so `base` already has
// a placeholder nonce of 0 at the end. To stay faithful we strip a trailing
// `|<digits>` if present and re-attach the candidate nonce after `|`.
function joinNonce(base, nonce) {
  const m = /^(.*\|)\d+$/.exec(base);
  if (m) return `${m[1]}${nonce}`;
  return `${base}${nonce}`;
}
