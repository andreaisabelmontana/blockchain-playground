// Spend validation (input resolution, fee, change, double-spend rejection) is
// the tested core in ../../src/utxo.js. This module is the click-to-spend UI.
import { genesis, spend, FEE } from '../../src/utxo.js';

const initial = genesis();
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
    // Selection keys are "Sender:<utxoId>"; strip the sender prefix for the core.
    const inputIds = ins.map(k => k.slice(sender.length + 1));
    const txId = 'tx' + (Math.random().toString(16).slice(2, 8));
    let res;
    try {
      res = spend(state, sender, recipient, inputIds, amt, txId);
    } catch (e) {
      return alert(e.message);
    }
    log.unshift(
      `${txId}: ${sender} → ${recipient}  ${amt} BTC  (fee ${FEE})  change ${res.change.toFixed(3)}\n` +
      `  inputs: ${ins.join(', ')}`
    );
    selected.clear();
    render();
  };

  render();
}
