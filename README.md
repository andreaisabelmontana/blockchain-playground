# Blockchain, Cryptocurrencies & Fintech — Interactive Companion

A static, no-build web app that visualizes every core concept from the
**Blockchain, Cryptocurrencies, and Fintech** course as live, in-browser demos.

## Modules

1. **Hash** — SHA-256 with live avalanche-effect bit-diff
2. **Signatures** — real ECDSA (P-256) keygen, sign, verify, tamper
3. **Merkle trees** — build a Merkle root from arbitrary leaves
4. **Block chain** — linked blocks, edit any block and watch tamper detection
5. **Mining** — real PoW nonce search with hashrate
6. **UTXO model** — click-to-spend Bitcoin transactions with change outputs
7. **Bitcoin forks** — clickable timeline (P2SH, BCH, SegWit, BSV, Taproot, Ordinals)
8. **Wallet** — privkey → pubkey → 0x-address derivation + mnemonic
9. **ETH accounts** — EOA vs contract, balance/nonce/storage state
10. **Gas (EIP-1559)** — interactive cost calculator with base/tip split
11. **EVM** — step through a tiny program on the stack machine
12. **Solidity** — deploy & call a simulated Counter contract with require/revert
13. **ERC-20** — transfer / approve / transferFrom with allowance tracking
14. **NFTs (ERC-721)** — mint, transfer, on-chain owner / off-chain metadata
15. **AMM (Uniswap V2)** — x·y=k swap with real slippage & price impact
16. **L2 Rollups** — batch N L2 txs into 1 L1 tx (optimistic & ZK variants)
17. **Bitcoin halving** — block reward & cumulative supply across all 64 eras
18. **PoW vs PoS** — qualitative comparison

All cryptographic work runs locally in the browser via `window.crypto.subtle`.
No network, no analytics, no tracking.

## Run locally

Anything that serves static files works:

```bash
# from this docs/ folder
python -m http.server 8000
# then open http://localhost:8000
```

Or with Node:
```bash
npx serve .
```

## Deploy to GitHub Pages

1. Create a repo (e.g. `blockchain-playground`) and push the **contents of this `docs/` folder** to the repo root, OR push the whole `BLOCKCHAIN/` folder and set Pages to serve from `/docs`.
2. In GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `docs`** (or `main` / root if you pushed only the docs contents).
3. Wait ~30 s. Site goes live at `https://<your-user>.github.io/<repo>/`.

Step-by-step from this folder:

```bash
cd "C:\Users\ASUS\Desktop\BLOCKCHAIN\docs"
git init
git add .
git commit -m "Interactive blockchain playground"
git branch -M main
git remote add origin https://github.com/<your-user>/blockchain-playground.git
git push -u origin main
# then enable Pages in repo Settings → Pages → main / root
```

## File layout

```
docs/
├── index.html                # 13 interactive sections
├── styles.css
├── js/
│   ├── main.js               # bootstraps every module
│   └── modules/
│       ├── hash.js
│       ├── signatures.js
│       ├── merkle.js
│       ├── blockchain.js
│       ├── mining.js
│       ├── utxo.js
│       ├── forks.js
│       ├── wallet.js
│       ├── accounts.js
│       ├── gas.js
│       ├── evm.js
│       ├── solidity.js
│       ├── erc20.js
│       ├── nft.js
│       ├── amm.js
│       ├── rollups.js
│       └── halving.js
└── README.md
```

## Course mapping

| Session in syllabus | Module here |
|---|---|
| 1 — Introduction | `#intro` |
| 2 — Hash & digital signatures | `#hash`, `#signatures` |
| 3 — Blockchain basics | `#merkle`, `#blockchain`, `#mining` |
| 4 — Transactions & validation | `#utxo` |
| Bitcoin Forks, SW & Sync | `#forks` |
| 6 — Wallets, ETH addresses | `#wallet`, `#accounts` |
| 7–8 — ETH basics, gas | `#gas`, `#evm` |
| 9 — Smart contracts & Solidity | `#solidity` |
| 10 — Dapps, design principles | `#solidity`, `#accounts` |
| 11 — ERC-20 / ERC-721 | `#erc20`, `#nft` |
| 12 — Advanced (scaling, MEV, zk) | `#rollups`, `#consensus` |
| Bitcoin halving / supply curve | `#halving` |
| DeFi primitives | `#amm` |

## Limitations / honest disclosures

- Browser-native crypto (`window.crypto.subtle`) doesn't ship secp256k1, so the
  Signature and Wallet demos use P-256 ECDSA. The shape of the pipeline is
  identical to Bitcoin/Ethereum (curve point → hash → address).
- The Ethereum address derivation here uses SHA-256 instead of Keccak-256
  (real Ethereum) to avoid a 70 KB extra dependency. The principle is the same.
- The EVM walker handles a small opcode subset (PUSH1, ADD, MUL, MSTORE, RETURN)
  enough to convince you it's a stack machine.
- The Solidity demo is JS-backed — full compilation would need solc-js.
