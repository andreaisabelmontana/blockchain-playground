// ERC-20: balances, transfer, approve, transferFrom
let token, log;

function init() {
  token = {
    name: 'CourseCoin',
    symbol: 'CRS',
    decimals: 18,
    totalSupply: 1_000_000,
    balanceOf: { Alice: 1000, Bob: 500, Carol: 0, DEX: 0 },
    allowance: {}, // "owner→spender" → amount
  };
  log = [`Deploy ERC-20 "${token.name}" (${token.symbol}). totalSupply = ${token.totalSupply}.`];
}

function render() {
  const $b = document.getElementById('erc20-balances');
  $b.innerHTML = Object.entries(token.balanceOf).map(([k, v]) =>
    `<div class="row2"><b>${k}</b><span>${v} ${token.symbol}</span></div>`).join('');
  const $a = document.getElementById('erc20-allowances');
  const allow = Object.entries(token.allowance);
  $a.innerHTML = allow.length
    ? allow.map(([k, v]) => `<div class="row2"><b>${k}</b><span>${v} ${token.symbol}</span></div>`).join('')
    : '<div class="meta">no allowances set</div>';
  document.getElementById('erc20-log').textContent = log.join('\n');
}

export function initERC20() {
  init();

  document.getElementById('erc20-transfer').onclick = () => {
    const from = document.getElementById('erc20-from').value;
    const to   = document.getElementById('erc20-to').value;
    const amt  = +document.getElementById('erc20-amt').value;
    if (from === to) return alert('from == to');
    if (token.balanceOf[from] < amt) { log.unshift(`✗ revert: insufficient balance (${from} has ${token.balanceOf[from]})`); render(); return; }
    token.balanceOf[from] -= amt;
    token.balanceOf[to]   += amt;
    log.unshift(`${from} → ${to}: transfer(${amt} ${token.symbol})  · gas ≈ 51 000`);
    render();
  };

  document.getElementById('erc20-approve').onclick = () => {
    const owner   = document.getElementById('erc20-from').value;
    const spender = document.getElementById('erc20-to').value;
    const amt     = +document.getElementById('erc20-amt').value;
    token.allowance[`${owner} → ${spender}`] = amt;
    log.unshift(`${owner}.approve(${spender}, ${amt})  · gas ≈ 46 000  — ${spender} can now pull tokens from ${owner}`);
    render();
  };

  document.getElementById('erc20-transferFrom').onclick = () => {
    const from    = document.getElementById('erc20-from').value;
    const to      = document.getElementById('erc20-to').value;
    const spender = 'DEX';
    const amt     = +document.getElementById('erc20-amt').value;
    const key     = `${from} → ${spender}`;
    if ((token.allowance[key] ?? 0) < amt) { log.unshift(`✗ revert: insufficient allowance (${spender} approved for ${token.allowance[key] ?? 0} from ${from})`); render(); return; }
    if (token.balanceOf[from] < amt)        { log.unshift(`✗ revert: insufficient balance`); render(); return; }
    token.balanceOf[from] -= amt;
    token.balanceOf[to]   += amt;
    token.allowance[key]  -= amt;
    log.unshift(`${spender}.transferFrom(${from} → ${to}, ${amt})  · allowance now ${token.allowance[key]}`);
    render();
  };

  document.getElementById('erc20-reset').onclick = () => { init(); render(); };
  render();
}
