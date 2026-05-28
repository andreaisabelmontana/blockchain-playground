export async function sha256Hex(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Bytes(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return new Uint8Array(buf);
}

function hexToBits(hex) {
  const out = [];
  for (const c of hex) {
    const n = parseInt(c, 16);
    for (let i = 3; i >= 0; i--) out.push((n >> i) & 1);
  }
  return out;
}

export function initHash() {
  const input  = document.getElementById('hash-input');
  const out    = document.getElementById('hash-output');
  const bytes  = document.getElementById('hash-bytes');
  const strip  = document.getElementById('hash-bitdiff');
  const count  = document.getElementById('hash-bitcount');
  let prevBits = null;

  async function update() {
    const v = input.value;
    bytes.textContent = `${new Blob([v]).size} bytes input · 64 hex chars / 256 bits output`;
    const hex = await sha256Hex(v);
    out.textContent = hex;
    const bits = hexToBits(hex);
    strip.innerHTML = '';
    let diffs = 0;
    bits.forEach((b, i) => {
      const d = document.createElement('div');
      d.className = 'bit';
      if (prevBits && prevBits[i] !== b) { d.classList.add('diff'); diffs++; }
      strip.appendChild(d);
    });
    count.textContent = prevBits
      ? `${diffs} of 256 bits flipped (${(100*diffs/256).toFixed(1)}%)`
      : 'change the input to see how many bits flip';
    prevBits = bits;
  }
  input.addEventListener('input', update);
  update();
}
