// L2 rollups — batch N txs into 1 L1 tx
let l2pending, batches, log;

function init() {
  l2pending = [];
  batches = [];
  log = ['L2 sequencer ready. Submit txs cheaply on L2; they are batched into L1 periodically.'];
}

function render() {
  const $p = document.getElementById('rollup-pending');
  $p.innerHTML = l2pending.length === 0
    ? '<div class="meta">no pending L2 txs — submit one →</div>'
    : l2pending.map((t, i) => `<div class="pendtx">L2#${t.n} · ${t.from} → ${t.to} : ${t.amt}</div>`).join('');

  const $b = document.getElementById('rollup-batches');
  $b.innerHTML = batches.length === 0
    ? '<div class="meta">no batches posted to L1 yet</div>'
    : batches.map(b => `
      <div class="batch ${b.type}">
        <div><b>L1 tx</b> · batch #${b.id} (${b.type === 'zk' ? 'ZK proof' : 'optimistic + 7-day window'})</div>
        <div>${b.count} L2 txs compressed → 1 L1 tx · gas saved ≈ ${b.savings}%</div>
        <div class="meta">root: ${b.root}</div>
      </div>`).join('');

  document.getElementById('rollup-log').textContent = log.join('\n');
}

export function initRollups() {
  init();
  let counter = 1;

  document.getElementById('rollup-submit').onclick = () => {
    const from = ['Alice','Bob','Carol','Dave'][Math.floor(Math.random()*4)];
    let to;
    do { to = ['Alice','Bob','Carol','Dave'][Math.floor(Math.random()*4)]; } while (to === from);
    const amt = (0.01 + Math.random()*2).toFixed(3);
    l2pending.push({ n: counter++, from, to, amt });
    log.unshift(`L2 tx submitted · gas ≈ 0.001¢ (≈ 1000× cheaper than L1)`);
    render();
  };

  function flush(type) {
    if (l2pending.length === 0) return alert('No pending L2 txs');
    const id = batches.length + 1;
    const root = '0x' + Math.random().toString(16).slice(2, 18) + '…';
    const count = l2pending.length;
    const savings = Math.min(99, Math.round(100 - 100/count - 5));
    batches.unshift({ id, type, count, root, savings });
    log.unshift(`L1 tx posted: ${type === 'zk' ? 'zk-Rollup' : 'Optimistic Rollup'} batch #${id} (${count} L2 txs, state-root ${root.slice(0,10)}…)`);
    l2pending = [];
    render();
  }

  document.getElementById('rollup-flush-op').onclick = () => flush('op');
  document.getElementById('rollup-flush-zk').onclick = () => flush('zk');
  document.getElementById('rollup-reset').onclick   = () => { init(); render(); };
  render();
}
