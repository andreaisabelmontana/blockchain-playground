// UTXO model: balances, valid/invalid spends, double-spend rejection.
// Mirrors js/modules/utxo.js: each owner holds a set of unspent outputs; a
// transfer consumes named inputs, pays a fixed fee, sends `amt` to the
// recipient, and returns the remainder as a change UTXO to the sender.

export const FEE = 0.001;

const round8 = (n) => +n.toFixed(8);

// Default genesis state from the demo.
export function genesis() {
  return {
    Alice: [{ id: 'tx0:0', amt: 1.0 }, { id: 'tx0:1', amt: 0.5 }, { id: 'tx0:2', amt: 0.2 }],
    Bob: [{ id: 'tx1:0', amt: 0.3 }, { id: 'tx1:1', amt: 0.1 }],
  };
}

export function balance(state, who) {
  return round8((state[who] || []).reduce((s, u) => s + u.amt, 0));
}

export function totalSupply(state) {
  return round8(Object.keys(state).reduce((s, who) => s + balance(state, who), 0));
}

// Spend: consume `inputIds` from `sender`, pay `amt` to `recipient`, fee FEE,
// change back to sender. Throws on an invalid spend (unknown/double-spent input,
// or inputs that don't cover amt + fee). Returns the new tx's outputs.
//
// `state` is mutated in place (like the demo). `txId` makes outputs deterministic
// for tests; the demo uses a random id.
export function spend(state, sender, recipient, inputIds, amt, txId = 'tx') {
  if (sender === recipient) throw new Error('sender == recipient');
  const pool = state[sender] || [];

  // Resolve inputs. A repeated or already-spent id (not in the pool) is rejected
  // — this is what blocks a double-spend: once consumed, the UTXO is gone.
  const seen = new Set();
  let inputSum = 0;
  for (const id of inputIds) {
    if (seen.has(id)) throw new Error(`double-spend: input ${id} used twice`);
    seen.add(id);
    const utxo = pool.find((u) => u.id === id);
    if (!utxo) throw new Error(`unknown or already-spent input ${id}`);
    inputSum += utxo.amt;
  }
  if (inputIds.length === 0) throw new Error('no inputs selected');

  inputSum = round8(inputSum);
  if (inputSum < amt) throw new Error(`insufficient inputs (${inputSum} < ${amt})`);
  if (inputSum < amt + FEE) throw new Error(`inputs must cover amt + fee (${amt + FEE})`);

  const change = round8(inputSum - amt - FEE);

  // Consume inputs.
  state[sender] = pool.filter((u) => !inputIds.includes(u.id));
  // Pay recipient.
  state[recipient] = state[recipient] || [];
  state[recipient].push({ id: `${txId}:0`, amt });
  // Return change.
  if (change > 0) state[sender].push({ id: `${txId}:1`, amt: change });

  return { recipientOut: { id: `${txId}:0`, amt }, change, fee: FEE };
}
