import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMerkle, merkleRoot, merkleProof, verifyProof } from '../src/merkle.js';

const leaves = ['tx-a', 'tx-b', 'tx-c', 'tx-d'];

test('merkle root is deterministic', () => {
  assert.equal(merkleRoot(leaves), merkleRoot(leaves));
  assert.match(merkleRoot(leaves), /^[0-9a-f]{64}$/);
});

test('changing any leaf changes the root', () => {
  const r1 = merkleRoot(leaves);
  const r2 = merkleRoot(['tx-a', 'tx-X', 'tx-c', 'tx-d']);
  assert.notEqual(r1, r2);
});

test('a valid inclusion proof verifies for every leaf', () => {
  const root = merkleRoot(leaves);
  for (let i = 0; i < leaves.length; i++) {
    const proof = merkleProof(leaves, i);
    assert.ok(verifyProof(leaves[i], proof, root), `leaf ${i} should verify`);
  }
});

test('a tampered proof fails verification', () => {
  const root = merkleRoot(leaves);
  const proof = merkleProof(leaves, 1);
  // Flip a sibling hash.
  const bad = proof.map((s, i) => (i === 0 ? { ...s, hash: 'f'.repeat(64) } : s));
  assert.ok(!verifyProof(leaves[1], bad, root));
});

test('proving the wrong value against a real proof fails', () => {
  const root = merkleRoot(leaves);
  const proof = merkleProof(leaves, 2);
  assert.ok(!verifyProof('not-a-leaf', proof, root));
});

test('odd leaf count duplicates the last leaf and still proves', () => {
  const odd = ['a', 'b', 'c'];
  const root = merkleRoot(odd);
  const { layers } = buildMerkle(odd);
  assert.ok(layers.length >= 2);
  for (let i = 0; i < odd.length; i++) {
    assert.ok(verifyProof(odd[i], merkleProof(odd, i), root));
  }
});
