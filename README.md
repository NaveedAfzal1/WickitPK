# WickitPK — Pakistan's First Blockchain PSL Ticketing Platform

> Built on WireFluid | Entangled 2026 Hackathon

**Live Demo:** https://wickit-pk.vercel.app/

---

## The Problem

PSL ticket fraud costs Pakistani fans millions every year. Counterfeit tickets, scalpers selling at 5x face value, and no way to prove authenticity at the gate. Existing solutions (paper tickets, QR codes) are trivially faked.

## The Solution

WickitPK puts every PSL ticket on-chain as an ERC-721 NFT. Ownership is unforgeable. Prices are smart-contract-enforced. Gate verification is instant and trustless.

---

## Live Features

| Feature | Description |
|---------|-------------|
| **NFT Tickets** | Buy General, Premium, or VIP tickets minted as ERC-721 NFTs |
| **Anti-Scalping** | Per-match resale price caps enforced by smart contract (e.g. max 120% of face value) |
| **QR Verification** | Fans show a wallet-signed QR; gate operators scan to verify on-chain ownership in seconds |
| **Resale Marketplace** | List, buy, and cancel resale tickets — 5% royalty auto-sent to organizer |
| **Collectible Badges** | Used tickets at marked matches become permanent holographic NFT collectibles |
| **Fan Loyalty Tiers** | Bronze → Silver → Gold → Diamond based on matches attended |
| **Gift Tickets** | Buy and transfer tickets directly to up to 12 wallet addresses in one flow |
| **Admin Panel** | Deployer can mark matches as collectible post-game |

---

## Demo Walkthrough (for judges)

1. Open https://wickit-pk.vercel.app/
2. Connect MetaMask → add WireFluid Testnet (auto-prompted)
3. Select any match → choose a tier → click **Buy Ticket**
4. After purchase: go to **My Tickets** → see your NFT with QR code
5. Open **Verify** page in another tab → scan or paste the QR → click **Verify Ticket**
6. Click **Mark as Used** → ticket becomes a collectible badge

---

## Deployed Contract

- **Address:** `0x0a6F272f3f7caf8927988ECEEb03834E8C51B064`
- **Network:** WireFluid Testnet (Chain ID: 92533)
- **Explorer:** https://wirefluidscan.com
- **Deployer:** `0xb1e5427e245f3741Aa2ced12be2A67b8F527c892`

### On-Chain Transaction Hashes

| Action | TX Hash |
|--------|---------|
| Deploy | `0x6c4bad0bf0f13febff1744f17ace4327300707d0f6945ec8dfaa83b69ed80332` |
| Match 1 | `0x38f621cd3937fbd9fcd29e37bedc553385b64d0b27e7e3c8701672555de41138` |
| Match 2 | `0xed05707ac53a24513a70917c15e0ddc02a347ee7b590fe2e4fc8b279f3f526e3` |
| Match 3 | `0x977398a6f89d19ed828098c0590924a98365b45a08b9d1339e747fd9854f921a` |
| Match 4 | `0xc1ae2fcc4afca6b579afdee5173f3e9f3235a067bbfaa7f5899f639416285f33` |
| Match 5 | `0x0a55f0a38d239b2cbef39d285f9a4fcd2b3d1977c1a932b3e4cde1d121c211d9` |
| Match 6 | `0xebce31818b2d241b80ed5b360b1771d671d20bf0edaa4c8918b87b45deb25ce1` |

---

## Why WireFluid?

Stadium gates cannot tell 10,000 fans to wait for Ethereum finality. WireFluid delivers:

- **Sub-5s finality** via CometBFT consensus — fast enough for stadium queues
- **< 0.001 WIRE gas** per transaction — affordable for every fan
- **EVM-compatible** — standard ethers.js v6 + MetaMask, no new tooling

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.19, OpenZeppelin ERC-721 |
| Frontend | React 19, Vite 8, ethers.js v6 |
| Wallet | MetaMask (EIP-1193) |
| Chain | WireFluid Testnet |
| Hosting | Vercel |

---

## Architecture

```
Fan / Gate Operator
        ↓
React Frontend (wickit-pk.vercel.app)
        ↓
ethers.js v6 — wallet + read-only RPC
        ↓
PSLTrustTicket.sol (ERC-721)
  on WireFluid Testnet (Chain ID: 92533)
```

No backend. No database. Fully client-side dApp.

---

## Run Locally

```bash
git clone <repo>
npm install
npm run dev   # http://localhost:5173
```

Add WireFluid Testnet to MetaMask:
- **RPC:** https://evm.wirefluid.com
- **Chain ID:** 92533
- **Currency:** WIRE
- **Explorer:** https://wirefluidscan.com
