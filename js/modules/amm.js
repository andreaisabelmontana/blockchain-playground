// Uniswap-style constant product AMM:  x * y = k
// Math is the tested core in ../../src/amm.js; this module is the DOM wrapper.
import { newPool, price as poolPrice, k as poolK, quoteEthForUsdc, quoteUsdcForEth } from '../../src/amm.js';

let pool, log;

function init() {
  // Start: 100 ETH × 200_000 USDC → price = 2000 USDC/ETH
  pool = { ...newPool(), lpSupply: 4472.13 /* sqrt(eth*usdc) */ };
  log = [`Initialize pool: 100 ETH / 200 000 USDC → price 2 000 USDC/ETH, k = ${(pool.eth*pool.usdc).toLocaleString()}`];
}

function price() { return poolPrice(pool); }
function k()     { return poolK(pool); }

function swapEthForUsdc(dx)    { return quoteEthForUsdc(pool, dx); }
function swapUsdcForEth(dy_in) { return quoteUsdcForEth(pool, dy_in); }

function render() {
  document.getElementById('amm-eth').textContent  = pool.eth.toFixed(4);
  document.getElementById('amm-usdc').textContent = pool.usdc.toFixed(2);
  document.getElementById('amm-price').textContent = price().toFixed(2);
  document.getElementById('amm-k').textContent = k().toLocaleString(undefined, {maximumFractionDigits:0});
  document.getElementById('amm-log').textContent = log.join('\n');
}

export function initAMM() {
  init();

  document.getElementById('amm-buy').onclick = () => {
    const usdcIn = +document.getElementById('amm-amt').value;
    if (usdcIn <= 0 || usdcIn >= pool.usdc) return alert('bad amount');
    const ethOut = swapUsdcForEth(usdcIn);
    const priceBefore = price();
    pool.usdc += usdcIn;
    pool.eth  -= ethOut;
    const priceAfter = price();
    const slip = ((priceAfter - priceBefore) / priceBefore * 100).toFixed(2);
    log.unshift(`BUY  ${usdcIn} USDC → ${ethOut.toFixed(6)} ETH  · effective ${(usdcIn/ethOut).toFixed(2)} USDC/ETH · price impact ${slip}%`);
    render();
  };

  document.getElementById('amm-sell').onclick = () => {
    const ethIn = +document.getElementById('amm-amt-eth').value;
    if (ethIn <= 0 || ethIn >= pool.eth) return alert('bad amount');
    const usdcOut = swapEthForUsdc(ethIn);
    const priceBefore = price();
    pool.eth  += ethIn;
    pool.usdc -= usdcOut;
    const priceAfter = price();
    const slip = ((priceAfter - priceBefore) / priceBefore * 100).toFixed(2);
    log.unshift(`SELL ${ethIn} ETH → ${usdcOut.toFixed(2)} USDC  · effective ${(usdcOut/ethIn).toFixed(2)} USDC/ETH · price impact ${slip}%`);
    render();
  };

  document.getElementById('amm-reset').onclick = () => { init(); render(); };
  render();
}
