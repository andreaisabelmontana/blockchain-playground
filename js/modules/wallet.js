import { sha256Hex } from './hash.js';

const wordlist = ['abandon','ability','able','about','above','absent','absorb','abstract',
  'absurd','abuse','access','accident','account','accuse','achieve','acid','acoustic',
  'acquire','across','act','action','actor','actress','actual','adapt','add','addict',
  'address','adjust','admit','adult','advance','advice','aerobic','affair','afford',
  'afraid','again','age','agent','agree','ahead','aim','air','airport','aisle','alarm',
  'album','alcohol','alert','alien','all','alley','allow','almost','alone','alpha',
  'already','also','alter','always','amateur','amazing','among','amount','amused'];

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function initWallet() {
  document.getElementById('wallet-gen').onclick = async () => {
    const kp = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']
    );
    const pub = await crypto.subtle.exportKey('raw', kp.publicKey);
    const priv = await crypto.subtle.exportKey('jwk', kp.privateKey);
    const pubHex = bufToHex(pub);
    const addr = '0x' + (await sha256Hex(pubHex)).slice(-40);
    document.getElementById('wallet-priv').textContent = priv.d;
    document.getElementById('wallet-pub').textContent  = pubHex;
    document.getElementById('wallet-addr').textContent = addr;

    const rand = crypto.getRandomValues(new Uint8Array(12));
    const phrase = [...rand].map(b => wordlist[b % wordlist.length]).join(' ');
    document.getElementById('wallet-mnemonic').textContent = phrase;
  };
  document.getElementById('wallet-gen').click();
}
