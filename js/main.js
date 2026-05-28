import { initHash } from './modules/hash.js';
import { initSignatures } from './modules/signatures.js';
import { initMerkle } from './modules/merkle.js';
import { initBlockchain } from './modules/blockchain.js';
import { initMining } from './modules/mining.js';
import { initUTXO } from './modules/utxo.js';
import { initForks } from './modules/forks.js';
import { initWallet } from './modules/wallet.js';
import { initAccounts } from './modules/accounts.js';
import { initGas } from './modules/gas.js';
import { initEVM } from './modules/evm.js';
import { initSolidity } from './modules/solidity.js';
import { initERC20 } from './modules/erc20.js';
import { initNFT } from './modules/nft.js';
import { initAMM } from './modules/amm.js';
import { initRollups } from './modules/rollups.js';
import { initHalving } from './modules/halving.js';

const modules = [
  ['Hash',        initHash],
  ['Signatures',  initSignatures],
  ['Merkle',      initMerkle],
  ['Blockchain',  initBlockchain],
  ['Mining',      initMining],
  ['UTXO',        initUTXO],
  ['Halving',     initHalving],
  ['Forks',       initForks],
  ['Wallet',      initWallet],
  ['Accounts',    initAccounts],
  ['Gas',         initGas],
  ['EVM',         initEVM],
  ['Solidity',    initSolidity],
  ['ERC-20',      initERC20],
  ['NFT',         initNFT],
  ['AMM',         initAMM],
  ['Rollups',     initRollups],
];

for (const [name, fn] of modules) {
  try { fn(); }
  catch (e) { console.error(`[${name}] init failed`, e); }
}

console.log('Blockchain playground ready ·', modules.length, 'modules loaded');
