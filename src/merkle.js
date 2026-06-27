// Merkle tree: root + inclusion proof + verification.
// Mirrors js/modules/merkle.js: leaves are SHA-256(value); each level pairs
// (a,b) -> SHA-256(a+b); a lone trailing node is duplicated (b = a).

import { sha256Hex } from './sha256.js';

// Build all layers bottom-up. Returns { layers, root }.
export function buildMerkle(values) {
  if (values.length === 0) return { layers: [[]], root: null };
  let layer = values.map((v) => sha256Hex(v));
  const layers = [layer];
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const a = layer[i];
      const b = i + 1 < layer.length ? layer[i + 1] : a; // duplicate odd leaf
      next.push(sha256Hex(a + b));
    }
    layers.push(next);
    layer = next;
  }
  return { layers, root: layer[0] };
}

export function merkleRoot(values) {
  return buildMerkle(values).root;
}

// Inclusion proof for the leaf at `index`: the sibling hash + side at each level.
export function merkleProof(values, index) {
  const { layers } = buildMerkle(values);
  if (index < 0 || index >= values.length) throw new Error('index out of range');
  const proof = [];
  let idx = index;
  for (let level = 0; level < layers.length - 1; level++) {
    const layer = layers[level];
    const isRight = idx % 2 === 1;
    const siblingIdx = isRight ? idx - 1 : idx + 1;
    // Lone trailing node pairs with itself.
    const sibling = siblingIdx < layer.length ? layer[siblingIdx] : layer[idx];
    proof.push({ hash: sibling, position: isRight ? 'left' : 'right' });
    idx = Math.floor(idx / 2);
  }
  return proof;
}

// Verify a leaf value against a root using a proof.
export function verifyProof(value, proof, root) {
  let hash = sha256Hex(value);
  for (const step of proof) {
    hash = step.position === 'left'
      ? sha256Hex(step.hash + hash)
      : sha256Hex(hash + step.hash);
  }
  return hash === root;
}
