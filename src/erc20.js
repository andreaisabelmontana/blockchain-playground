// ERC-20 accounting: balances, transfer, approve, transferFrom.
// Mirrors js/modules/erc20.js. Transfers conserve total supply; reverts leave
// state unchanged.

export function deploy({
  name = 'CourseCoin',
  symbol = 'CRS',
  decimals = 18,
  totalSupply = 1_000_000,
  balanceOf = { Alice: 1000, Bob: 500, Carol: 0, DEX: 0 },
} = {}) {
  return { name, symbol, decimals, totalSupply, balanceOf: { ...balanceOf }, allowance: {} };
}

export function balanceOf(token, who) {
  return token.balanceOf[who] ?? 0;
}

// Sum of all account balances — must stay constant across transfers.
export function circulating(token) {
  return Object.values(token.balanceOf).reduce((s, v) => s + v, 0);
}

// transfer(from, to, amt). Reverts (throws) on self-transfer or insufficient
// balance, leaving state untouched.
export function transfer(token, from, to, amt) {
  if (from === to) throw new Error('revert: from == to');
  if (amt < 0) throw new Error('revert: negative amount');
  if (balanceOf(token, from) < amt) throw new Error('revert: insufficient balance');
  token.balanceOf[from] -= amt;
  token.balanceOf[to] = balanceOf(token, to) + amt;
  return true;
}

// approve(owner, spender, amt): set allowance.
export function approve(token, owner, spender, amt) {
  token.allowance[`${owner} → ${spender}`] = amt;
  return true;
}

export function allowance(token, owner, spender) {
  return token.allowance[`${owner} → ${spender}`] ?? 0;
}

// transferFrom(spender, from, to, amt): pull tokens using an allowance.
export function transferFrom(token, spender, from, to, amt) {
  const key = `${from} → ${spender}`;
  if (allowance(token, from, spender) < amt) throw new Error('revert: insufficient allowance');
  if (balanceOf(token, from) < amt) throw new Error('revert: insufficient balance');
  token.balanceOf[from] -= amt;
  token.balanceOf[to] = balanceOf(token, to) + amt;
  token.allowance[key] -= amt;
  return true;
}
