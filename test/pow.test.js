import test from 'node:test';
import assert from 'node:assert/strict';
import { mine, verifyPow, hashMeetsDifficulty } from '../src/pow.js';
import { leadingZeros, sha256Hex } from '../src/sha256.js';

test('a found nonce produces a hash meeting the difficulty target', () => {
  const { nonce, hash } = mine('block-data|', 2);
  assert.ok(hash.startsWith('00'));
  assert.ok(leadingZeros(hash) >= 2);
  assert.ok(verifyPow('block-data|', nonce, 2), 'verification accepts the found nonce');
});

test('verification rejects a wrong nonce', () => {
  const { nonce } = mine('payload|', 2);
  assert.ok(!verifyPow('payload|', nonce + 1, 2), 'a different nonce should not meet the target');
});

test('difficulty 0 is met immediately by nonce 0', () => {
  const { nonce } = mine('anything', 0);
  assert.equal(nonce, 0);
});

test('hashMeetsDifficulty matches the leading-zero rule', () => {
  assert.ok(hashMeetsDifficulty('000abc', 3));
  assert.ok(hashMeetsDifficulty('000abc', 2));
  assert.ok(!hashMeetsDifficulty('00abc', 3));
});

test('higher difficulty statistically needs more work', () => {
  // Average hashes-to-solve grows ~16x per extra leading-zero hex digit.
  // Sum across several distinct preimages to smooth out variance, then assert
  // the harder target took strictly more total work.
  let easy = 0, hard = 0;
  for (let i = 0; i < 12; i++) {
    easy += mine(`seed-${i}|`, 1).hashes;
    hard += mine(`seed-${i}|`, 2).hashes;
  }
  assert.ok(hard > easy, `expected difficulty-2 (${hard}) to exceed difficulty-1 (${easy})`);
});

test('the found hash is reproducible from the preimage and nonce', () => {
  const { nonce, hash } = mine('repro|', 1);
  assert.equal(sha256Hex(`repro|${nonce}`), hash);
});
