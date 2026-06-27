// Constant-product AMM (Uniswap V2 style): x * y = k.
// Mirrors js/modules/amm.js. A swap takes a fee on the input, then solves the
// invariant for the output. Pool starts at 100 ETH / 200_000 USDC, fee 0.3%.

export function newPool({ eth = 100, usdc = 200_000, fee = 0.003 } = {}) {
  return { eth, usdc, fee };
}

export function price(pool) { return pool.usdc / pool.eth; }
export function k(pool) { return pool.eth * pool.usdc; }

// Quote ETH -> USDC: dy = (usdc * dxNet) / (eth + dxNet), dxNet = dx*(1-fee).
export function quoteEthForUsdc(pool, dx) {
  const dxNet = dx * (1 - pool.fee);
  return (pool.usdc * dxNet) / (pool.eth + dxNet);
}

// Quote USDC -> ETH: dx = (eth * dyNet) / (usdc + dyNet), dyNet = dy*(1-fee).
export function quoteUsdcForEth(pool, dy) {
  const dyNet = dy * (1 - pool.fee);
  return (pool.eth * dyNet) / (pool.usdc + dyNet);
}

// Execute an ETH->USDC swap, mutating the pool. Returns the swap result incl.
// price impact (slippage) as a fraction.
export function swapEthForUsdc(pool, dx) {
  if (dx <= 0) throw new Error('amount must be positive');
  const usdcOut = quoteEthForUsdc(pool, dx);
  const before = price(pool);
  pool.eth += dx;
  pool.usdc -= usdcOut;
  const after = price(pool);
  return { out: usdcOut, priceBefore: before, priceAfter: after, slippage: (after - before) / before };
}

// Execute a USDC->ETH swap, mutating the pool.
export function swapUsdcForEth(pool, dy) {
  if (dy <= 0) throw new Error('amount must be positive');
  if (dy >= pool.usdc) throw new Error('amount drains the pool');
  const ethOut = quoteUsdcForEth(pool, dy);
  const before = price(pool);
  pool.usdc += dy;
  pool.eth -= ethOut;
  const after = price(pool);
  // Signed price impact, same convention as the demo: buying ETH pushes the
  // ETH price up, so this is positive.
  return { out: ethOut, priceBefore: before, priceAfter: after, slippage: (after - before) / before };
}
