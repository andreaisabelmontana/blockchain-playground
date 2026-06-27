import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deploy, balanceOf, circulating, transfer, approve, allowance, transferFrom,
} from '../src/erc20.js';

test('a valid transfer updates balances and conserves circulating supply', () => {
  const t = deploy();
  const before = circulating(t);
  transfer(t, 'Alice', 'Bob', 200);
  assert.equal(balanceOf(t, 'Alice'), 800);
  assert.equal(balanceOf(t, 'Bob'), 700);
  assert.equal(circulating(t), before, 'transfers conserve total balance');
});

test('an overspend reverts and leaves state unchanged', () => {
  const t = deploy();
  assert.throws(() => transfer(t, 'Carol', 'Bob', 1), /insufficient balance/);
  assert.equal(balanceOf(t, 'Carol'), 0);
  assert.equal(balanceOf(t, 'Bob'), 500);
});

test('self-transfer reverts', () => {
  const t = deploy();
  assert.throws(() => transfer(t, 'Alice', 'Alice', 1), /from == to/);
});

test('approve + transferFrom pulls within the allowance and decrements it', () => {
  const t = deploy();
  approve(t, 'Alice', 'DEX', 300);
  assert.equal(allowance(t, 'Alice', 'DEX'), 300);
  const before = circulating(t);

  transferFrom(t, 'DEX', 'Alice', 'Carol', 120);
  assert.equal(balanceOf(t, 'Alice'), 880);
  assert.equal(balanceOf(t, 'Carol'), 120);
  assert.equal(allowance(t, 'Alice', 'DEX'), 180);
  assert.equal(circulating(t), before);
});

test('transferFrom beyond the allowance reverts', () => {
  const t = deploy();
  approve(t, 'Alice', 'DEX', 50);
  assert.throws(() => transferFrom(t, 'DEX', 'Alice', 'Carol', 60), /insufficient allowance/);
  assert.equal(balanceOf(t, 'Alice'), 1000); // untouched
});
