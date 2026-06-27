import { sha256Hex } from './hash.js';
// Chain linkage + tamper detection is the tested core in ../../src/blockchain.js.
// Mining here stays async (crypto.subtle) for a responsive UI, but the
// per-block validity rule is the same logic the tests prove.
import { blockPreimage } from '../../src/blockchain.js';

const chain = [];

function targetPrefix(diff) { return '0'.repeat(diff); }

async function mine(block, diff) {
  const target = targetPrefix(diff);
  let nonce = 0;
  while (true) {
    const h = await sha256Hex(blockPreimage({ ...block, nonce }));
    if (h.startsWith(target)) { block.nonce = nonce; block.hash = h; return; }
    nonce++;
    if (nonce > 5_000_000) throw new Error('gave up');
  }
}

async function recompute(diff) {
  for (let i = 0; i < chain.length; i++) {
    chain[i].prev = i === 0 ? '0'.repeat(64) : chain[i-1].hash;
    chain[i].hash = await sha256Hex(blockPreimage(chain[i]));
    chain[i].valid = chain[i].hash.startsWith(targetPrefix(diff))
      && (i === 0 || chain[i].prev === chain[i-1].hash);
  }
}

function render(diff) {
  const $c = document.getElementById('chain');
  $c.innerHTML = '';
  chain.forEach((b, i) => {
    const valid = b.valid;
    const el = document.createElement('div');
    el.className = 'block ' + (valid ? 'valid' : 'invalid');
    el.innerHTML = `
      <div class="hdr"><b>Block #${b.index}</b><span class="badge">${valid ? 'OK' : 'INVALID'}</span></div>
      <label>Data</label>
      <textarea data-i="${i}">${b.data}</textarea>
      <label>Prev hash</label>
      <code class="digest">${b.prev.slice(0,16)}…${b.prev.slice(-4)}</code>
      <label>Hash</label>
      <code class="digest">${b.hash.slice(0,16)}…${b.hash.slice(-4)}</code>
      <label>Nonce: <code>${b.nonce}</code></label>
      <button class="mine" data-i="${i}">Re-mine</button>
    `;
    $c.appendChild(el);
  });
  $c.querySelectorAll('textarea').forEach(t => {
    t.addEventListener('input', async (e) => {
      const i = +e.target.dataset.i;
      chain[i].data = e.target.value;
      await recompute(diff);
      render(diff);
    });
  });
  $c.querySelectorAll('button.mine').forEach(b => {
    b.addEventListener('click', async (e) => {
      const i = +e.target.dataset.i;
      const d = +document.getElementById('chain-diff').value;
      e.target.textContent = 'mining…';
      e.target.disabled = true;
      chain[i].prev = i === 0 ? '0'.repeat(64) : chain[i-1].hash;
      await mine(chain[i], d);
      await recompute(d);
      render(d);
    });
  });
}

async function reset(diff) {
  chain.length = 0;
  const g = { index: 0, data: 'Genesis block', prev: '0'.repeat(64), nonce: 0, hash: '' };
  await mine(g, diff); chain.push(g);
  await recompute(diff);
}

export async function initBlockchain() {
  const $diff = document.getElementById('chain-diff');
  await reset(+$diff.value);
  render(+$diff.value);

  document.getElementById('chain-add').onclick = async () => {
    const d = +$diff.value;
    const idx = chain.length;
    const b = { index: idx, data: `Block #${idx} · payload`, prev: chain[idx-1].hash, nonce: 0, hash: '' };
    await mine(b, d);
    chain.push(b);
    await recompute(d);
    render(d);
  };
  document.getElementById('chain-reset').onclick = async () => {
    await reset(+$diff.value);
    render(+$diff.value);
  };
  $diff.onchange = async () => {
    await recompute(+$diff.value);
    render(+$diff.value);
  };
}
