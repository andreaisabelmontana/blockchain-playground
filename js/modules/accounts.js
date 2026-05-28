let state, log;

function init() {
  state = {
    Alice:  { type: 'eoa', addr: '0xA11ce…A11CE', balance: 10.0, nonce: 0 },
    Bob:    { type: 'eoa', addr: '0xB0b0…0B0B',   balance: 5.0,  nonce: 0 },
    Counter:{ type: 'contract', addr: '0xC0de…C0DE', balance: 0, nonce: 1,
              code: '60806040…', storage: { count: 0 } },
  };
  log = ['Initial state created.'];
}

function render() {
  const $v = document.getElementById('accounts-view');
  $v.innerHTML = '';
  for (const [name, a] of Object.entries(state)) {
    const el = document.createElement('div');
    el.className = 'account ' + a.type;
    el.innerHTML = `
      <h4>${name} <span class="meta">(${a.type === 'eoa' ? 'EOA' : 'CONTRACT'})</span></h4>
      <div class="row2"><b>address</b><code>${a.addr}</code></div>
      <div class="row2"><b>balance</b><span>${a.balance.toFixed(4)} ETH</span></div>
      <div class="row2"><b>nonce</b><span>${a.nonce}</span></div>
      ${a.type === 'contract' ? `
        <div class="row2"><b>code</b><code>${a.code}</code></div>
        <div class="row2"><b>storage.count</b><span>${a.storage.count}</span></div>
      ` : ''}
    `;
    $v.appendChild(el);
  }
  document.getElementById('acct-log').textContent = log.join('\n');
}

export function initAccounts() {
  init();
  document.getElementById('acct-send').onclick = () => {
    const amt = 1.0, fee = 0.0021;
    if (state.Alice.balance < amt + fee) return alert('Alice insufficient funds');
    state.Alice.balance -= (amt + fee);
    state.Alice.nonce += 1;
    state.Bob.balance += amt;
    log.unshift(`tx#${state.Alice.nonce}: Alice → Bob  ${amt} ETH  (gas fee ${fee})`);
    render();
  };
  document.getElementById('acct-call').onclick = () => {
    const fee = 0.00043;
    if (state.Alice.balance < fee) return alert('Alice insufficient gas');
    state.Alice.balance -= fee;
    state.Alice.nonce += 1;
    state.Counter.storage.count += 1;
    log.unshift(`tx#${state.Alice.nonce}: Alice → Counter.increment()  (gas fee ${fee}) → count = ${state.Counter.storage.count}`);
    render();
  };
  document.getElementById('acct-reset').onclick = () => { init(); render(); };
  render();
}
