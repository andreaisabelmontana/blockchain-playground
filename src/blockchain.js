// Block hashing + chain linkage + tamper detection.
// Mirrors js/modules/blockchain.js: a block hashes the string
// `index|data|prev|nonce` with SHA-256, difficulty = N leading zero hex chars,
// and each block's `prev` must equal the previous block's hash.

import { sha256Hex } from './sha256.js';
import { mine, hashMeetsDifficulty } from './pow.js';

function targetPrefix(difficulty) { return '0'.repeat(difficulty); }

// Serialize a block to the exact preimage the demo hashes.
export function blockPreimage(block) {
  return `${block.index}|${block.data}|${block.prev}|${block.nonce}`;
}

export function hashBlock(block) {
  return sha256Hex(blockPreimage(block));
}

const GENESIS_PREV = '0'.repeat(64);

// Build a fresh chain of `data` payloads, mining each block to `difficulty`.
export function buildChain(dataItems, difficulty = 0) {
  const chain = [];
  for (let i = 0; i < dataItems.length; i++) {
    const block = {
      index: i,
      data: dataItems[i],
      prev: i === 0 ? GENESIS_PREV : chain[i - 1].hash,
      nonce: 0,
      hash: '',
    };
    const { nonce, hash } = mine(blockPreimage(block), difficulty);
    block.nonce = nonce;
    block.hash = hash;
    chain.push(block);
  }
  return chain;
}

// Append a block carrying `data`, mined to `difficulty`.
export function addBlock(chain, data, difficulty = 0) {
  const index = chain.length;
  const block = {
    index,
    data,
    prev: index === 0 ? GENESIS_PREV : chain[index - 1].hash,
    nonce: 0,
    hash: '',
  };
  const { nonce, hash } = mine(blockPreimage(block), difficulty);
  block.nonce = nonce;
  block.hash = hash;
  chain.push(block);
  return block;
}

// Recompute every block's prev/hash in place — what the demo does after an edit.
export function recompute(chain) {
  for (let i = 0; i < chain.length; i++) {
    chain[i].prev = i === 0 ? GENESIS_PREV : chain[i - 1].hash;
    chain[i].hash = hashBlock(chain[i]);
  }
  return chain;
}

// Validate the whole chain WITHOUT mutating it: every stored hash must match the
// recomputed hash, the linkage must hold, and (if given) each hash must meet the
// difficulty target.
export function validateChain(chain, difficulty = 0) {
  const target = targetPrefix(difficulty);
  for (let i = 0; i < chain.length; i++) {
    const b = chain[i];
    if (hashBlock(b) !== b.hash) return false;            // data/nonce tampered
    const expectedPrev = i === 0 ? GENESIS_PREV : chain[i - 1].hash;
    if (b.prev !== expectedPrev) return false;            // linkage broken
    if (difficulty > 0 && !b.hash.startsWith(target)) return false; // PoW unmet
  }
  return true;
}

export { hashMeetsDifficulty, GENESIS_PREV };
