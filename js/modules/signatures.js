function bufToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBuf(hex) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.slice(2*i, 2*i+2), 16);
  return a.buffer;
}

let state = { keyPair: null, signature: null, signedMsg: '' };

export function initSignatures() {
  const $pub   = document.getElementById('sig-pub');
  const $priv  = document.getElementById('sig-priv');
  const $msg   = document.getElementById('sig-msg');
  const $out   = document.getElementById('sig-out');
  const $res   = document.getElementById('sig-result');

  document.getElementById('sig-keygen').onclick = async () => {
    const kp = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true, ['sign', 'verify']
    );
    state.keyPair = kp;
    const pub  = await crypto.subtle.exportKey('raw', kp.publicKey);
    const priv = await crypto.subtle.exportKey('jwk', kp.privateKey);
    $pub.textContent  = bufToHex(pub);
    $priv.textContent = `d=${priv.d}`;
    $out.textContent  = '';
    $res.textContent  = 'Keypair generated. Now sign a message.';
    $res.className    = 'result';
  };

  document.getElementById('sig-sign').onclick = async () => {
    if (!state.keyPair) return alert('Generate a keypair first');
    const data = new TextEncoder().encode($msg.value);
    const sig = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' }, state.keyPair.privateKey, data
    );
    state.signature = sig;
    state.signedMsg = $msg.value;
    $out.textContent = bufToHex(sig);
    $res.textContent = 'Signed. Click Verify.';
    $res.className   = 'result';
  };

  document.getElementById('sig-verify').onclick = async () => {
    if (!state.signature) return alert('Sign a message first');
    const data = new TextEncoder().encode($msg.value);
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      state.keyPair.publicKey, state.signature, data
    );
    $res.textContent = ok
      ? `✓ VALID — signature matches the message and the public key.`
      : `✗ INVALID — message was tampered with, or signed by a different key.`;
    $res.className = 'result ' + (ok ? 'ok' : 'bad');
  };

  document.getElementById('sig-tamper').onclick = async () => {
    if (!state.signature) return alert('Sign a message first');
    $msg.value = state.signedMsg + ' [tampered]';
    const data = new TextEncoder().encode($msg.value);
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      state.keyPair.publicKey, state.signature, data
    );
    $res.textContent = ok
      ? `✓ (unexpected) valid`
      : `✗ INVALID — the message was tampered with, so the signature no longer matches. This is how blockchains stop transaction forgery.`;
    $res.className = 'result ' + (ok ? 'ok' : 'bad');
  };
}
