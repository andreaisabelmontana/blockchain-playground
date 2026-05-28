export function initGas() {
  const $op   = document.getElementById('gas-op');
  const $base = document.getElementById('gas-base');
  const $tip  = document.getElementById('gas-tip');
  const $eth  = document.getElementById('gas-eth');

  const $used  = document.getElementById('gas-used');
  const $price = document.getElementById('gas-price');
  const $ec    = document.getElementById('gas-eth-cost');
  const $uc    = document.getElementById('gas-usd-cost');
  const $burn  = document.getElementById('gas-burn');
  const $val   = document.getElementById('gas-val');

  function update() {
    const used = +$op.value;
    const base = +$base.value;
    const tip  = +$tip.value;
    const eth  = +$eth.value;
    const total = base + tip;
    const ethCost = used * total * 1e-9;
    const usd = ethCost * eth;
    const burned = used * base * 1e-9 * eth;
    const validator = used * tip * 1e-9 * eth;
    $used.textContent  = used.toLocaleString();
    $price.textContent = `${total} gwei`;
    $ec.textContent    = ethCost.toFixed(6);
    $uc.textContent    = usd.toFixed(2);
    $burn.textContent  = burned.toFixed(2);
    $val.textContent   = validator.toFixed(2);
  }
  [$op, $base, $tip, $eth].forEach(e => e.addEventListener('input', update));
  update();
}
