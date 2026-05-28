// ERC-721 NFT — mint, transfer, view metadata
let nfts, nextId, log;

function init() {
  nfts = []; nextId = 1;
  log = ['Deploy ERC-721 collection "CourseArt". Supply unlimited.'];
}

function render() {
  const $g = document.getElementById('nft-gallery');
  $g.innerHTML = '';
  if (nfts.length === 0) {
    $g.innerHTML = '<div class="meta" style="padding:20px;text-align:center">No NFTs minted yet. Click "Mint" to create one.</div>';
  }
  for (const n of nfts) {
    const el = document.createElement('div');
    el.className = 'nft';
    el.innerHTML = `
      <div class="nft-art" style="background:${n.color}">
        <span>#${n.id}</span>
      </div>
      <div class="nft-meta">
        <div class="row2"><b>tokenId</b><span>#${n.id}</span></div>
        <div class="row2"><b>owner</b><code>${n.owner}</code></div>
        <div class="row2"><b>tokenURI</b><code title="${n.uri}">ipfs://Qm…/${n.id}.json</code></div>
      </div>
      <div class="btnrow">
        <select data-i="${n.id}" class="nft-recipient">
          <option>Alice</option><option>Bob</option><option>Carol</option>
        </select>
        <button data-i="${n.id}" class="nft-send">safeTransferFrom</button>
      </div>
    `;
    $g.appendChild(el);
  }
  $g.querySelectorAll('button.nft-send').forEach(b => {
    b.onclick = (e) => {
      const id = +e.target.dataset.i;
      const n = nfts.find(x => x.id === id);
      const to = e.target.parentElement.querySelector('select').value;
      if (n.owner === to) return alert('Already owned by ' + to);
      log.unshift(`safeTransferFrom(${n.owner} → ${to}, tokenId=${id})  · gas ≈ 60 000`);
      n.owner = to;
      render();
    };
  });
  document.getElementById('nft-log').textContent = log.join('\n');
}

const palette = ['#7c9cff', '#6ee7b7', '#ffb86b', '#ff7777', '#bda6ff', '#6bd1ff'];

export function initNFT() {
  init();
  document.getElementById('nft-mint').onclick = () => {
    const to = document.getElementById('nft-to').value;
    const id = nextId++;
    nfts.push({
      id, owner: to,
      color: palette[(id - 1) % palette.length],
      uri: `ipfs://Qm${Math.random().toString(16).slice(2, 12)}/${id}.json`,
    });
    log.unshift(`mint(${to}, tokenId=${id})  · gas ≈ 180 000  — metadata pinned on IPFS`);
    render();
  };
  document.getElementById('nft-reset').onclick = () => { init(); render(); };
  render();
}
