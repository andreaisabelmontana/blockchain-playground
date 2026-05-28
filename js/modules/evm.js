const program = [
  { op: 'PUSH1', arg: 3, gas: 3, cmt: '// push 3 onto stack' },
  { op: 'PUSH1', arg: 4, gas: 3, cmt: '// push 4 onto stack' },
  { op: 'ADD',   gas: 3, cmt: '// pop two, push sum (7)' },
  { op: 'PUSH1', arg: 2, gas: 3, cmt: '// push 2' },
  { op: 'MUL',   gas: 5, cmt: '// pop two, push product (14)' },
  { op: 'PUSH1', arg: 0x00, gas: 3, cmt: '// memory offset' },
  { op: 'MSTORE', gas: 6, cmt: '// store result in memory' },
  { op: 'PUSH1', arg: 0x20, gas: 3, cmt: '// length 32 bytes' },
  { op: 'PUSH1', arg: 0x00, gas: 3, cmt: '// offset 0' },
  { op: 'RETURN', gas: 0, cmt: '// return memory[0:32] = 14' },
];

let pc, stack, gas;

function render() {
  const $code = document.getElementById('evm-code');
  $code.innerHTML = program.map((ins, i) => {
    const line = `${String(i).padStart(2,'0')}: ${ins.op}${ins.arg !== undefined ? ' 0x' + ins.arg.toString(16).padStart(2,'0') : ''}  ${ins.cmt}`;
    return i === pc ? `<span class="pc">${line}</span>` : line;
  }).join('\n');

  const $s = document.getElementById('evm-stack');
  $s.innerHTML = '';
  stack.forEach((v, i) => {
    const f = document.createElement('div');
    f.className = 'frame' + (i === stack.length - 1 ? ' new' : '');
    f.textContent = '0x' + v.toString(16);
    $s.appendChild(f);
  });
  document.getElementById('evm-gas').textContent = gas;
  document.getElementById('evm-pc').textContent = pc < program.length ? pc : 'HALT';
}

function step() {
  if (pc >= program.length) return false;
  const ins = program[pc];
  gas += ins.gas;
  switch (ins.op) {
    case 'PUSH1': stack.push(ins.arg); break;
    case 'ADD':   { const b = stack.pop(), a = stack.pop(); stack.push(a + b); break; }
    case 'MUL':   { const b = stack.pop(), a = stack.pop(); stack.push(a * b); break; }
    case 'MSTORE': stack.pop(); stack.pop(); break;
    case 'RETURN': stack.pop(); stack.pop(); break;
  }
  pc++;
  render();
  return pc < program.length;
}

function reset() { pc = 0; stack = []; gas = 0; render(); }

export function initEVM() {
  reset();
  document.getElementById('evm-step').onclick = () => step();
  document.getElementById('evm-run').onclick  = () => { while (step()) {} };
  document.getElementById('evm-reset').onclick = reset;
}
