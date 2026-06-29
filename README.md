# Blockchain Playground

Interactive playground for blockchain, cryptocurrency & fintech course concepts —
17 in-browser modules, plus a set of framework-free, **tested** algorithm cores.

The site (`index.html`) is a static, no-build web app: every core idea is a live
demo. `course.html` and `project.html` are the editorial course/project pages.
The interactive logic lives in `js/modules/*.js`; the math and state machines
behind those demos are now extracted into dependency-free ES modules under
`src/` and proven with Node's built-in test runner.

## Coursework

Hands-on projects built for the course:
[Rodeo](https://andreaisabelmontana.github.io/rodeo/) (a blockchain DAO for
multi-robot task allocation) ·
[Harthat Web3 Tutorial](https://andreaisabelmontana.github.io/harthat-web3-tutorial/)
(deploy & call a Solidity contract with Hardhat) ·
[Blockchain · Cryptocurrencies · Fintech](https://github.com/andreaisabelmontana/Blockchain-Cryptocurrencies-Fintech)
(notes + mini-blockchain capstone).

## Tested cores (`src/`)

| Module | What it does | Proven by |
|---|---|---|
| `sha256.js` | Pure-JS SHA-256, byte-identical to `crypto.subtle` | matches `node:crypto` on known + random vectors |
| `blockchain.js` | Block hashing, chain linkage, tamper detection | editing a block invalidates the chain; recompute restores it |
| `pow.js` | Proof-of-work nonce search + verification | found nonce meets the target; wrong nonce rejected; harder = more work |
| `merkle.js` | Merkle root + inclusion proof | root is deterministic; valid proof verifies, tampered proof fails |
| `utxo.js` | UTXO balances, spends, change, double-spend rules | valid spend conserves supply (−fee); overspend & double-spend rejected |
| `erc20.js` | ERC-20 transfer / approve / transferFrom | transfers conserve supply; overspend & over-allowance revert |
| `amm.js` | Constant-product AMM (`x·y=k`) | `k` preserved (≥, minus fee); output matches the formula; larger trade = worse price |
| `signatures.js` | Signature bind-message-to-key semantics | valid sig verifies; tampered message or wrong key fails |

The browser modules now reuse these cores where it stays clean
(`amm.js`, `erc20.js`, `merkle.js`, `blockchain.js`, `utxo.js`), so the demos run
the exact same logic the tests cover. The live Hash, Signatures and Mining demos
keep using `window.crypto.subtle` for responsiveness — `src/sha256.js` produces
the identical digest, so Node tests and the browser agree bit-for-bit.

## Run the tests

```bash
node --test
```

No dependencies, no install — Node 18+ (`node:test` + `node:assert`).

```
ℹ tests 45
ℹ suites 0
ℹ pass 45
ℹ fail 0
ℹ duration_ms 322
```

A few of the named tests:

```
✔ tampering with a block invalidates the chain
✔ recompute repairs hashes after an edit and re-validates
✔ a valid inclusion proof verifies for every leaf
✔ a tampered proof fails verification
✔ a found nonce produces a hash meeting the difficulty target
✔ verification rejects a wrong nonce
✔ higher difficulty statistically needs more work
✔ double-spend in one transaction is rejected
✔ an overspend (inputs do not cover amount + fee) is rejected
✔ a valid transfer updates balances and conserves circulating supply
✔ constant product k is preserved up to the fee across a swap
✔ larger trades get a worse effective price (slippage)
✔ sha256 is byte-identical to node:crypto for arbitrary inputs
```

## Run the site

Any static file server works:

```bash
python -m http.server 8000   # then open http://localhost:8000
# or: npx serve .
```

Open `index.html` for the playground, `course.html` / `project.html` for the
editorial pages.

## Modules in the playground

Hash · Signatures · Merkle trees · Blockchain (tamper detection) · Mining (PoW) ·
UTXO model · Bitcoin halving · Forks timeline · Wallet · ETH accounts · Gas
(EIP-1559) · EVM stack machine · Solidity Counter · ERC-20 · NFT (ERC-721) ·
AMM (Uniswap V2) · L2 rollups.

## Layout

```
index.html  course.html  project.html  styles.css
js/
  main.js                # bootstraps every module
  modules/*.js           # the 17 interactive demos (DOM wrappers)
src/                      # framework-free, tested algorithm cores
  sha256.js blockchain.js pow.js merkle.js utxo.js erc20.js amm.js signatures.js
test/                    # node:test suites for every core
package.json             # "type":"module", "test":"node --test"
```

## Honest disclosures

- The browser Signature/Wallet demos use P-256 ECDSA via `crypto.subtle` (the
  Web Crypto API does not ship secp256k1); the pipeline shape matches Bitcoin/
  Ethereum. `src/signatures.js` models the *bind-message-to-key* property
  deterministically with a SHA-256 MAC so it is testable under Node — it is not
  ECDSA itself.
- ETH address derivation in the demo uses SHA-256 in place of Keccak-256 to
  avoid a large extra dependency; the principle is identical.
- The EVM/Solidity demos cover a teaching-sized subset, not a full VM/compiler.

## License

MIT — see [LICENSE](LICENSE).
