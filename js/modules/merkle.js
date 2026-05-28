import { sha256Hex } from './hash.js';

async function buildMerkle(leaves) {
  if (leaves.length === 0) return { layers: [['(empty)']], root: '(empty)' };
  let layer = await Promise.all(leaves.map(l => sha256Hex(l)));
  const layers = [layer];
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const a = layer[i];
      const b = i + 1 < layer.length ? layer[i+1] : a;
      next.push(await sha256Hex(a + b));
    }
    layers.push(next);
    layer = next;
  }
  return { layers, root: layer[0] };
}

function short(h) { return h.length > 16 ? h.slice(0, 8) + '…' + h.slice(-4) : h; }

export function initMerkle() {
  const $in = document.getElementById('merkle-input');
  const $root = document.getElementById('merkle-root');
  const $tree = document.getElementById('merkle-tree');

  document.getElementById('merkle-build').onclick = async () => {
    const leaves = $in.value.split('\n').map(s => s.trim()).filter(Boolean);
    const { layers, root } = await buildMerkle(leaves);
    $root.textContent = root;
    $tree.innerHTML = '';
    for (let li = layers.length - 1; li >= 0; li--) {
      const div = document.createElement('div');
      div.className = 'level';
      for (const h of layers[li]) {
        const n = document.createElement('div');
        n.className = 'node' + (li === layers.length - 1 ? ' root' : '') + (li === 0 ? ' leaf' : '');
        n.textContent = short(h);
        n.title = h;
        div.appendChild(n);
      }
      $tree.appendChild(div);
    }
    if (layers[0].length > 0) {
      const lbl = document.createElement('div');
      lbl.style.cssText = 'text-align:center;margin-top:6px;color:#9aa3c7;font-size:11px';
      lbl.textContent = `${leaves.length} leaves → ${layers.length - 1} hash levels → 1 root`;
      $tree.appendChild(lbl);
    }
  };
  document.getElementById('merkle-build').click();
}
