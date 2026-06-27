import test from 'node:test';
import assert from 'node:assert/strict';
import { genesis, balance, totalSupply, spend, FEE } from '../src/utxo.js';

test('genesis balances are correct', () => {
  const s = genesis();
  assert.equal(balance(s, 'Alice'), 1.7);
  assert.equal(balance(s, 'Bob'), 0.4);
  assert.equal(totalSupply(s), 2.1);
});

test('a valid spend moves value and conserves supply (minus the fee)', () => {
  const s = genesis();
  const before = totalSupply(s);
  // Alice spends a 1.0 UTXO to send 0.5 to Bob.
  const res = spend(s, 'Alice', 'Bob', ['tx0:0'], 0.5, 'txA');
  assert.equal(res.recipientOut.amt, 0.5);
  assert.equal(res.change, +(1.0 - 0.5 - FEE).toFixed(8)); // 0.499
  assert.equal(balance(s, 'Bob'), +(0.4 + 0.5).toFixed(8));
  // Supply drops by exactly the fee (the fee is burned in this model).
  assert.equal(+(before - totalSupply(s)).toFixed(8), FEE);
});

test('the spent input UTXO is consumed (cannot be respent)', () => {
  const s = genesis();
  spend(s, 'Alice', 'Bob', ['tx0:0'], 0.5, 'txA');
  // tx0:0 is gone now — spending it again is rejected.
  assert.throws(() => spend(s, 'Alice', 'Bob', ['tx0:0'], 0.1, 'txB'),
    /already-spent|unknown/);
});

test('double-spend in one transaction is rejected', () => {
  const s = genesis();
  assert.throws(() => spend(s, 'Alice', 'Bob', ['tx0:0', 'tx0:0'], 0.5, 'txA'),
    /double-spend/);
});

test('an overspend (inputs do not cover amount + fee) is rejected', () => {
  const s = genesis();
  // The 0.2 UTXO cannot fund a 0.5 payment.
  assert.throws(() => spend(s, 'Alice', 'Bob', ['tx0:2'], 0.5, 'txA'), /insufficient/);
  // State is unchanged after a rejected spend.
  assert.equal(totalSupply(s), 2.1);
});

test('no change output when inputs exactly cover amount + fee', () => {
  const s = genesis();
  const res = spend(s, 'Alice', 'Bob', ['tx0:2'], 0.2 - FEE, 'txA'); // 0.199
  assert.equal(res.change, 0);
  // Alice's tx0:2 is consumed and no change UTXO was created from it.
  assert.ok(!s.Alice.some(u => u.id === 'txA:1'));
});
