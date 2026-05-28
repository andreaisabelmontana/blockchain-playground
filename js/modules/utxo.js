const initial = {
  Alice: [{ id: 'tx0:0', amt: 1.0 }, { id: 'tx0:1', amt: 0.5 }, { id: 'tx0:2', amt: 0.2 }],
  Bob:   [{ id: 'tx1:0', amt: 0.3 }, { id: 'tx1:1', amt: 0.1 }],
};
let state, selected, log;

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

function render() {
  for (const who of ['Alice', 'Bob']) {
    const $set = document.getElementById('utxo-' + who.toLowerCase());
    $set.innerHTML = '';
    if (state[who].length === 0) {
      $set.innerHTML = '<span style="color:#9aa3c7;font-size:12px">(no UTXOs)</span>';
      continue;
    }
    for (const u of state[who]) {
      const el = document.createElement('div');
      el.className = 'utxo' + (selected.has(`${who}:${u.id}`) ? ' selected' : '');
      el.innerHTML = `<span class="amt">${u.amt} BTC</span><span class="id">${u.id}</span>`;
      el.onclick = () => {
        if (who !== document.getElementById('utxo-sender').value) {
          alert(`Pick UTXOs from the sender (${document.getElementById('utxo-sender').value}).`);
          return;
        }
        const k = `${who}:${u.id}`;
        if (selected.has(k)) selected.delete(k); else selected.add(k);
        render();
      };
      $set.appendChild(el);
    }
  }
  const sender = document.getElementById('utxo-sender').value;
  const total = [...selected]
    .filter(k => k.startsWith(sender + ':'))
    .reduce((s, k) => s + state[sender].find(u => u.id === k.split(':').slice(1).join(':')).amt, 0);
  document.getElementById('utxo-selected').textContent =
    [...selected].length ? [...selected].join(', ') : 'none';
  document.getElementById('utxo-total').textContent = total.toFixed(3);

  document.getElementById('utxo-log').textContent = log.join('\n');
}

export function initUTXO() {
  state = deepClone(initial);
  selected = new Set();
  log = ['Genesis: Alice has 1.0 + 0.5 + 0.2 = 1.7 BTC, Bob has 0.3 + 0.1 = 0.4 BTC'];

  document.getElementById('utxo-sender').onchange = (e) => {
    document.getElementById('utxo-recipient').value =
      e.target.value === 'Alice' ? 'Bob' : 'Alice';
    selected.clear();
    render();
  };
  document.getElementById('utxo-reset').onclick = () => {
    state = deepClone(initial); selected.clear();
    log = ['Reset.'];
    render();
  };
  document.getElementById('utxo-send').onclick = () => {
    const sender = document.getElementById('utxo-sender').value;
    const recipient = document.getElementById('utxo-recipient').value;
    const amt = +document.getElementById('utxo-amt').value;
    const ins = [...selected].filter(k => k.startsWith(sender + ':'));
    if (ins.length === 0) return alert('Select at least one input UTXO.');
    const total = ins.reduce((s, k) =>
      s + state[sender].find(u => u.id === k.split(':').slice(1).join(':')).amt, 0);
    if (total < amt) return alert(`Insufficient inputs (${total} < ${amt}). Select more UTXOs.`);
    const fee = 0.001;
    if (total < amt + fee) return alert(`Need at least ${(amt+fee).toFixed(3)} BTC including fee.`);
    const change = +(total - amt - fee).toFixed(8);
    const txId = 'tx' + (Math.random().toString(16).slice(2, 8));
    state[sender] = state[sender].filter(u => !ins.includes(`${sender}:${u.id}`));
    state[recipient].push({ id: `${txId}:0`, amt });
    if (change > 0) state[sender].push({ id: `${txId}:1`, amt: change });
    log.unshift(
      `${txId}: ${sender} → ${recipient}  ${amt} BTC  (fee ${fee})  change ${change.toFixed(3)}\n` +
      `  inputs: ${ins.join(', ')}`
    );
    selected.clear();
    render();
  };

  render();
}
