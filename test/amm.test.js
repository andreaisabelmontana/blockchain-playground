import test from 'node:test';
import assert from 'node:assert/strict';
import {
  newPool, price, k, quoteUsdcForEth, quoteEthForUsdc, swapUsdcForEth, swapEthForUsdc,
} from '../src/amm.js';

test('initial pool prices ETH at 2000 USDC', () => {
  const p = newPool();
  assert.equal(price(p), 2000);
  assert.equal(k(p), 100 * 200_000);
});

test('output matches the x*y=k formula (with fee)', () => {
  const p = newPool();
  const dy = 2000; // buy ETH with 2000 USDC
  const expected = (p.eth * dy * (1 - p.fee)) / (p.usdc + dy * (1 - p.fee));
  assert.equal(quoteUsdcForEth(p, dy), expected);
});

test('constant product k is preserved up to the fee across a swap', () => {
  const p = newPool();
  const kBefore = k(p);
  swapUsdcForEth(p, 5000); // execute a buy
  const kAfter = k(p);
  // With a fee, k must not shrink — the fee makes the new k slightly larger.
  assert.ok(kAfter >= kBefore, `k must not decrease (before ${kBefore}, after ${kAfter})`);
  // And it should be close to the original (fee is only 0.3%).
  assert.ok(kAfter / kBefore < 1.01);
});

test('a zero-fee pool keeps k exactly constant', () => {
  const p = newPool({ fee: 0 });
  const kBefore = k(p);
  swapEthForUsdc(p, 3);
  // Floating point: assert within a tiny relative tolerance.
  assert.ok(Math.abs(k(p) - kBefore) / kBefore < 1e-9);
});

test('larger trades get a worse effective price (slippage)', () => {
  const small = quoteUsdcForEth(newPool(), 1000);   // ETH out per 1000 USDC in
  const large = quoteUsdcForEth(newPool(), 50_000); // ETH out per 50000 USDC in
  const priceSmall = 1000 / small;     // USDC paid per ETH
  const priceLarge = 50_000 / large;
  assert.ok(priceLarge > priceSmall, 'the bigger trade pays more per ETH');
});

test('a swap moves the price against the trader and reports slippage', () => {
  const p = newPool();
  const before = price(p);
  const res = swapUsdcForEth(p, 10_000); // buying ETH should push ETH price up
  assert.ok(price(p) > before, 'buying ETH raises the ETH price');
  assert.ok(res.slippage > 0);
});

test('buying then the pool has less ETH and more USDC', () => {
  const p = newPool();
  swapUsdcForEth(p, 10_000);
  assert.ok(p.eth < 100);
  assert.ok(p.usdc > 200_000);
});
