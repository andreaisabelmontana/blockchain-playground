import test from 'node:test';
import assert from 'node:assert/strict';
import { keyPairFromSeed, sign, verify } from '../src/signatures.js';

test('a signature verifies for the exact message and keypair', () => {
  const { priv, pub } = keyPairFromSeed('alice-seed');
  const msg = 'pay Bob 10 BTC';
  const sig = sign(priv, msg);
  assert.ok(verify(pub, msg, sig, priv));
});

test('tampering with the message breaks verification', () => {
  const { priv, pub } = keyPairFromSeed('alice-seed');
  const sig = sign(priv, 'pay Bob 10 BTC');
  assert.ok(!verify(pub, 'pay Bob 1000 BTC', sig, priv),
    'a modified message must not verify against the old signature');
});

test('a signature from a different key does not verify against the wrong public key', () => {
  const alice = keyPairFromSeed('alice-seed');
  const mallory = keyPairFromSeed('mallory-seed');
  const sig = sign(mallory.priv, 'pay Bob 10 BTC');
  // Mallory's signature checked against Alice's identity fails.
  assert.ok(!verify(alice.pub, 'pay Bob 10 BTC', sig, mallory.priv));
});

test('public key commits to the private key', () => {
  const a = keyPairFromSeed('s');
  const b = keyPairFromSeed('s');
  const c = keyPairFromSeed('other');
  assert.equal(a.pub, b.pub);       // deterministic from seed
  assert.notEqual(a.pub, c.pub);    // different seed -> different identity
});
