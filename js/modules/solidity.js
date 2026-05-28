let deployed = null;
let log;

function render() {
  if (deployed) {
    document.getElementById('sol-addr').textContent  = deployed.addr;
    document.getElementById('sol-count').textContent = deployed.count;
    document.getElementById('sol-owner').textContent = deployed.owner;
  } else {
    document.getElementById('sol-addr').textContent  = '— not deployed —';
    document.getElementById('sol-count').textContent = '—';
    document.getElementById('sol-owner').textContent = '—';
  }
  document.getElementById('sol-log').textContent = log.join('\n');
}

function tx(msg) { log.unshift(msg); render(); }

export function initSolidity() {
  log = ['Compile + deploy in Remix would emit ~700 lines of bytecode. This is a simulation.'];
  render();

  document.getElementById('sol-deploy').onclick = () => {
    const caller = document.getElementById('sol-caller').value;
    deployed = {
      addr: '0xC' + Math.random().toString(16).slice(2, 41).padEnd(39, '0'),
      count: 0,
      owner: caller,
    };
    tx(`deploy Counter from ${caller}  gas≈ 200 000 → addr ${deployed.addr.slice(0, 10)}…`);
  };
  document.getElementById('sol-inc').onclick = () => {
    if (!deployed) return alert('Deploy first');
    deployed.count += 1;
    tx(`${document.getElementById('sol-caller').value} → Counter.increment()  gas≈ 43 000 · count=${deployed.count}`);
  };
  document.getElementById('sol-dec').onclick = () => {
    if (!deployed) return alert('Deploy first');
    if (deployed.count === 0) {
      tx(`✗ revert: underflow (require(count > 0))  gas spent ≈ 23 000`);
      return;
    }
    deployed.count -= 1;
    tx(`${document.getElementById('sol-caller').value} → Counter.decrement()  gas≈ 28 000 · count=${deployed.count}`);
  };
  document.getElementById('sol-reset').onclick = () => {
    if (!deployed) return alert('Deploy first');
    const caller = document.getElementById('sol-caller').value;
    if (caller !== deployed.owner) {
      tx(`✗ revert: not owner (require(msg.sender == owner)) — caller ${caller.slice(0,10)}…`);
      return;
    }
    deployed.count = 0;
    tx(`${caller} → Counter.reset()  gas≈ 25 000 · count=0`);
  };
}
