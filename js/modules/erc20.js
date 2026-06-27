// ERC-20: balances, transfer, approve, transferFrom
// Accounting is the tested core in ../../src/erc20.js; this is the DOM wrapper.
import {
  deploy as deployToken,
  transfer as erc20Transfer,
  approve as erc20Approve,
  transferFrom as erc20TransferFrom,
} from '../../src/erc20.js';

let token, log;

function init() {
  token = deployToken();
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
    try {
      erc20Transfer(token, from, to, amt);
    } catch {
      log.unshift(`✗ revert: insufficient balance (${from} has ${token.balanceOf[from]})`); render(); return;
    }
    log.unshift(`${from} → ${to}: transfer(${amt} ${token.symbol})  · gas ≈ 51 000`);
    render();
  };

  document.getElementById('erc20-approve').onclick = () => {
    const owner   = document.getElementById('erc20-from').value;
    const spender = document.getElementById('erc20-to').value;
    const amt     = +document.getElementById('erc20-amt').value;
    erc20Approve(token, owner, spender, amt);
    log.unshift(`${owner}.approve(${spender}, ${amt})  · gas ≈ 46 000  — ${spender} can now pull tokens from ${owner}`);
    render();
  };

  document.getElementById('erc20-transferFrom').onclick = () => {
    const from    = document.getElementById('erc20-from').value;
    const to      = document.getElementById('erc20-to').value;
    const spender = 'DEX';
    const amt     = +document.getElementById('erc20-amt').value;
    const key     = `${from} → ${spender}`;
    try {
      erc20TransferFrom(token, spender, from, to, amt);
    } catch (e) {
      const msg = /allowance/.test(e.message)
        ? `✗ revert: insufficient allowance (${spender} approved for ${token.allowance[key] ?? 0} from ${from})`
        : `✗ revert: insufficient balance`;
      log.unshift(msg); render(); return;
    }
    log.unshift(`${spender}.transferFrom(${from} → ${to}, ${amt})  · allowance now ${token.allowance[key]}`);
    render();
  };

  document.getElementById('erc20-reset').onclick = () => { init(); render(); };
  render();
}
