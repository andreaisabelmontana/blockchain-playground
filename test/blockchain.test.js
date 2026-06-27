import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildChain, addBlock, recompute, validateChain, hashBlock, GENESIS_PREV,
} from '../src/blockchain.js';

test('a freshly built chain validates', () => {
  const chain = buildChain(['Genesis block', 'Block #1', 'Block #2'], 0);
  assert.equal(chain.length, 3);
  assert.equal(chain[0].prev, GENESIS_PREV);
  assert.ok(validateChain(chain, 0));
});

test('each block links to the previous block by hash', () => {
  const chain = buildChain(['a', 'b', 'c'], 0);
  for (let i = 1; i < chain.length; i++) {
    assert.equal(chain[i].prev, chain[i - 1].hash);
  }
});

test('tampering with a block invalidates the chain', () => {
  const chain = buildChain(['Genesis block', 'pay Alice 10', 'pay Bob 5'], 0);
  assert.ok(validateChain(chain, 0));

  // Edit a block's data without re-mining: its stored hash no longer matches.
  chain[1].data = 'pay Alice 1000000';
  assert.equal(hashBlock(chain[1]) === chain[1].hash, false);
  assert.ok(!validateChain(chain, 0), 'tampered chain must be invalid');
});

test('recompute repairs hashes after an edit and re-validates', () => {
  const chain = buildChain(['g', 'x', 'y'], 0);
  chain[1].data = 'edited';
  assert.ok(!validateChain(chain, 0));   // broken until recomputed
  recompute(chain);
  assert.ok(validateChain(chain, 0));    // hashes + linkage restored
});

test('breaking the prev linkage invalidates the chain', () => {
  const chain = buildChain(['g', 'x', 'y'], 0);
  chain[2].prev = '0'.repeat(64);        // points at the wrong block
  assert.ok(!validateChain(chain, 0));
});

test('addBlock at difficulty produces a hash meeting the target', () => {
  const chain = buildChain(['Genesis block'], 1);
  addBlock(chain, 'next', 1);
  assert.ok(chain[1].hash.startsWith('0'));
  assert.ok(validateChain(chain, 1));
});
