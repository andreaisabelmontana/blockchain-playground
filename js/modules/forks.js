const forks = [
  { yr: '2009', name: 'Genesis',         type: 'soft', desc:
    'Satoshi mines the genesis block. Bitcoin block size is implicitly limited by code.' },
  { yr: '2010', name: '1 MB block cap',  type: 'soft', desc:
    'A 1 MB block size cap is introduced as a temporary anti-DoS measure. It becomes the central political battle of Bitcoin for the next decade.' },
  { yr: '2012', name: 'P2SH',            type: 'soft', desc:
    'Pay-to-Script-Hash (BIP-16) lets you send to a hash of a script. Enables multisig wallets without bloating the chain.' },
  { yr: '2017', name: 'Bitcoin Cash (BCH)', type: 'hard', desc:
    'Hard fork over the block-size debate. BCH raises the block cap to 8 MB (later 32 MB) to scale by larger blocks instead of layer-2.' },
  { yr: '2017', name: 'SegWit',          type: 'soft', desc:
    'Segregated Witness (BIP-141). Moves signature data outside the legacy block, fixes transaction malleability, enables the Lightning Network, effectively raises capacity to ~2 MB without a hard fork.' },
  { yr: '2018', name: 'Bitcoin SV',      type: 'hard', desc:
    'Hard fork from Bitcoin Cash, pushing for very large blocks (128 MB+, later unbounded) and restoring some original opcodes.' },
  { yr: '2021', name: 'Taproot',         type: 'soft', desc:
    'BIP-340/341/342. Adds Schnorr signatures (smaller, aggregatable) and Tapscript. Improves privacy: simple and complex transactions become indistinguishable on-chain.' },
  { yr: '2024', name: 'Ordinals / Runes', type: 'soft', desc:
    'Not a protocol fork but a usage shift — inscriptions and Runes use the witness data to embed assets directly on Bitcoin, reigniting the block-space debate.' },
];

export function initForks() {
  const $tl = document.getElementById('forks-timeline');
  const $dt = document.getElementById('forks-detail');
  $tl.innerHTML = '';
  forks.forEach((f, i) => {
    const el = document.createElement('div');
    el.className = 'fork ' + f.type;
    el.innerHTML = `<div class="dot"></div><div class="yr">${f.yr}</div><div class="name">${f.name}</div>`;
    el.onclick = () => {
      $tl.querySelectorAll('.fork').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      $dt.innerHTML = `
        <h4>${f.name} <span class="tag ${f.type}">${f.type === 'hard' ? 'HARD FORK' : 'SOFT FORK / UPGRADE'}</span></h4>
        <div class="meta">${f.yr}</div>
        <p>${f.desc}</p>
      `;
    };
    if (i === 0) setTimeout(() => el.click(), 100);
    $tl.appendChild(el);
  });
}
