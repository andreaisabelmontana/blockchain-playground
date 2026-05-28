import { sha256Hex } from './hash.js';

let stop = false;

export function initMining() {
  const $diff = document.getElementById('mine-diff');
  const $diffVal = document.getElementById('mine-diff-val');
  const $start = document.getElementById('mine-start');
  const $stop = document.getElementById('mine-stop');
  const $data = document.getElementById('mine-data');
  const $tries = document.getElementById('mine-tries');
  const $rate = document.getElementById('mine-rate');
  const $elapsed = document.getElementById('mine-elapsed');
  const $hash = document.getElementById('mine-hash');
  const $nonce = document.getElementById('mine-nonce');
  const $res = document.getElementById('mine-result');

  $diff.oninput = () => $diffVal.textContent = $diff.value;

  $start.onclick = async () => {
    stop = false;
    $res.textContent = ''; $res.className = 'result';
    const target = '0'.repeat(+$diff.value);
    const t0 = performance.now();
    let nonce = 0;
    while (!stop) {
      const h = await sha256Hex(`${$data.value}|${nonce}`);
      if (nonce % 200 === 0) {
        const el = (performance.now() - t0) / 1000;
        $tries.textContent = nonce;
        $rate.textContent  = Math.round(nonce / Math.max(el, 0.001)).toLocaleString();
        $elapsed.textContent = el.toFixed(2);
        $hash.textContent  = h;
        $nonce.textContent = nonce;
        await new Promise(r => setTimeout(r, 0));
      }
      if (h.startsWith(target)) {
        $tries.textContent = nonce;
        $hash.textContent = h;
        $nonce.textContent = nonce;
        $res.textContent = `✓ Block mined after ${nonce.toLocaleString()} hashes — ${((performance.now()-t0)/1000).toFixed(2)} s`;
        $res.className = 'result ok';
        return;
      }
      nonce++;
    }
    $res.textContent = '(stopped)';
  };
  $stop.onclick = () => { stop = true; };
}
