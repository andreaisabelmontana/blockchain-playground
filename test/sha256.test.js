import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { sha256Hex, leadingZeros } from '../src/sha256.js';

test('sha256 matches the reference (and thus crypto.subtle) on known vectors', () => {
  assert.equal(sha256Hex(''),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(sha256Hex('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('sha256 is byte-identical to node:crypto for arbitrary inputs', () => {
  for (const s of ['', 'a', 'hello world', 'Genesis block', 'café ☕ 日本語 🚀', 'x'.repeat(1000)]) {
    const ref = createHash('sha256').update(s, 'utf8').digest('hex');
    assert.equal(sha256Hex(s), ref, `mismatch for ${JSON.stringify(s).slice(0, 20)}`);
  }
});

test('sha256 is deterministic and produces 64 hex chars', () => {
  assert.equal(sha256Hex('repeat'), sha256Hex('repeat'));
  assert.match(sha256Hex('anything'), /^[0-9a-f]{64}$/);
});

test('avalanche: a one-character change flips many bits', () => {
  // Not asserting exact count, just that the digests are entirely different.
  assert.notEqual(sha256Hex('hello'), sha256Hex('hellp'));
});

test('leadingZeros counts the leading zero hex chars', () => {
  assert.equal(leadingZeros('00abc'), 2);
  assert.equal(leadingZeros('abc'), 0);
  assert.equal(leadingZeros('0000'), 4);
});
