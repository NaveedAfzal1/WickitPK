# WickitPK — PSL TrustTicket dApp

## Project Overview
Blockchain-based NFT ticket marketplace for Pakistan Super League (PSL) cricket matches. Fans can buy primary tickets, list/buy resale tickets, and gate operators can verify & scan tickets. Used/scanned tickets at special matches become collectible NFT badges.

## Build & Dev Commands
```
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Tech Stack
- **Framework**: React 19.2.4 (JSX, no TypeScript)
- **Build Tool**: Vite 8.0.0
- **Blockchain**: ethers.js v6.16.0
- **Wallet**: MetaMask (window.ethereum)
- **Network**: WireFluid Testnet (Chain ID: 92533, RPC: https://evm.wirefluid.com)
- **Currency**: WIRE (18 decimals — all prices in wei on-chain, formatted with ethers.formatEther for display)
- **Styling**: Inline styles only — centralized design system in `src/styles.js`

## Deployed Contract
- **Address**: `0x0a6F272f3f7caf8927988ECEEb03834E8C51B064`
- **Name**: PSLTrustTicket (ERC721-based NFT ticketing)
- **Network**: WireFluid Testnet
- **Deployer**: `0xb1e5427e245f3741Aa2ced12be2A67b8F527c892`
- **Block**: 884429
- **Explorer**: https://wirefluidscan.com

## Matches On-Chain (6 total)
| ID | Name | Venue |
|----|------|-------|
| 1 | LQ vs IU - Match 1 | Gaddafi Stadium Lahore |
| 2 | KK vs MS - Match 2 | National Bank Stadium Karachi |
| 3 | PZ vs QG - Match 3 | Rawalpindi Cricket Stadium |
| 4 | LQ vs KK - Match 4 | Gaddafi Stadium Lahore |
| 5 | RP vs HK - Match 5 | Rawalpindi Cricket Stadium |
| 6 | LQ vs RP - Match 6 | Gaddafi Stadium Lahore |

Match names follow the format: `"XX vs YY - Match N"` — parsed by `parseMatchName()` in `blockchain.js`.

## Team Abbreviation → Full Name Lookup
Located in `src/blockchain.js` as `TEAM_NAME_MAP`:
```
LQ = Lahore Qalandars
IU = Islamabad United
KK = Karachi Kings
MS = Multan Sultans
PZ = Peshawar Zalmi
QG = Quetta Gladiators
RP = Rawalpindi Pindiz
HK = Hyderabad Kingsmen
```

## Team Colors (in src/styles.js → TEAM_COLORS)
```
Lahore Qalandars:   primary #22c55e, secondary #dc2626
Islamabad United:   primary #dc2626, secondary #fbbf24
Karachi Kings:      primary #3b82f6, secondary #fbbf24
Multan Sultans:     primary #fbbf24, secondary #2563eb
Peshawar Zalmi:     primary #fbbf24, secondary #1e3a5f
Quetta Gladiators:  primary #7c3aed, secondary #fbbf24
Rawalpindi Pindiz:  primary #1e40af, secondary #FFD700
Hyderabad Kingsmen: primary #7c3aed, secondary #f59e0b
```

## Project Structure
```
src/
├── App.jsx              # Root component — all top-level state + handlers
├── blockchain.js        # ethers.js wrapper — all contract calls + fetch helpers
├── contract.js          # ABI, CONTRACT_ADDRESS, network config, provider helpers
├── mockData.js          # Demo fallback data (used only when contract not deployed)
├── styles.js            # Design system: COLORS, TEAM_COLORS, S (styles), Icons
├── main.jsx             # React entry point
├── index.css            # Minimal global CSS (6 lines)
└── components/
    ├── Navbar.jsx           # Navigation + wallet connect button
    ├── HeroBanner.jsx       # Hero section with LIVE/DEMO badge
    ├── MatchCard.jsx        # Clickable match card with tier pricing
    ├── BuyModal.jsx         # Tier selector + purchase flow modal
    ├── ResaleSection.jsx    # Resale marketplace grid
    ├── MyTicketsPage.jsx    # User's owned tickets + list-for-resale modal
    ├── CollectibleModal.jsx # Full-screen 3D collectible badge viewer
    └── VerifyPage.jsx       # Gate operator ticket verification tool
```

## Architecture & Data Flow
```
User Action
    ↓
App.jsx (state: matches, resaleListings, myTickets, wallet, toast)
    ↓
blockchain.js (ethers.js v6 wrappers)
    ↓
contract.js (ABI + provider factories)
    ↓
MetaMask → WireFluid Testnet → PSLTrustTicket contract
```

**No backend server, no database. Pure client-side dApp.**

## Key State in App.jsx
| State | Type | Source |
|-------|------|--------|
| `matches` | Array | Fetched via `fetchAllMatches()` on mount |
| `resaleListings` | Array | Fetched via `fetchResaleTickets()` per match when matches load |
| `myTickets` | Array | Fetched via `fetchMyTickets()` when wallet connects |
| `wallet` | String/null | MetaMask address |
| `matchesLoading` | Boolean | True while fetching matches from chain |

## Important Data Formats

### Match Object (from chain, built in fetchAllMatches)
```js
{
  id: 1,
  home: "Lahore Qalandars",     // parsed from on-chain name
  away: "Islamabad United",      // parsed from on-chain name
  matchNum: 1,                   // parsed from on-chain name
  date: "March 26, 2026",        // formatted from unix timestamp
  time: "7:00 PM",               // formatted from unix timestamp
  venue: "Gaddafi Stadium Lahore",
  resaleCap: 120,                // maxResalePercentage from contract
  collectible: false,
  tickets: {
    General: { price: "0.01", priceWei: BigInt, available: 50, total: 50, sold: 0 },
    Premium: { price: "0.05", priceWei: BigInt, available: 30, total: 30, sold: 0 },
    VIP:     { price: "0.1",  priceWei: BigInt, available: 10, total: 10, sold: 0 },
  }
}
```
Note: `total = available`, `sold = 0` — contract only exposes remaining availability, not historical totals.

### Ticket Object (from fetchMyTickets / after purchase)
```js
{
  tokenId: 42,
  matchId: 1,
  tier: "Premium",
  faceValue: BigInt,           // wei — for contract calls
  faceValueFormatted: "0.05",  // WIRE string — for display
  status: "active" | "listed" | "used" | "collectible",
  listPrice: null | String,    // WIRE string entered by user
  listPriceFormatted: null | String,
}
```

### Resale Listing Object (from fetchResaleTickets)
```js
{
  tokenId: 42,
  matchId: 1,
  tier: "Premium",
  faceValue: BigInt,
  faceValueFormatted: "0.05",      // WIRE
  listingPrice: BigInt,
  listingPriceFormatted: "0.06",   // WIRE
  seller: "0x1234...abcd",
  sellerShort: "0x1234...abcd",
}
```

## Key Functions in blockchain.js

### Data Fetching
| Function | Description |
|----------|-------------|
| `fetchAllMatches()` | Reads `nextMatchId()`, fetches all active matches with tier data |
| `fetchResaleTickets(matchId)` | Gets resale listings for a match |
| `fetchMyTickets(wallet, matchIds)` | Gets all tickets owned by wallet across all matches |
| `fetchAvailableTickets(matchId)` | Gets unsold token IDs + info for a match |

### Transactions
| Function | Description |
|----------|-------------|
| `buyTicket(tokenId)` | Reads faceValue from contract, sends payable tx |
| `listForResale(tokenId, priceWei)` | approve() + listForResale() (2-step) |
| `cancelListing(tokenId)` | Cancels a resale listing |
| `buyResale(tokenId)` | Reads listingPrice, sends payable tx |
| `verifyOwnership(tokenId, wallet)` | Read-only ownership check |
| `markTicketAsUsed(tokenId)` | Gate operator marks ticket as scanned |

## Smart Contract Key Points
- **Ticket tiers**: 0=General, 1=Premium, 2=VIP (uint8 enum)
- **Resale cap**: per-match `maxResalePercentage` (e.g. 120 = max 120% of face value)
- **Royalty**: 5% to organizer on every resale (taken from buyer payment)
- **Gate operators**: set by contract owner via `setGateOperator(address, bool)`
- **Collectibles**: owner calls `markAsCollectible(matchId)` — used tickets at that match become collectible badges
- **Match IDs**: start at 1, auto-incremented by `nextMatchId`
- **Token IDs**: start at 1, auto-incremented by `nextTokenId`

## Price Handling
- All on-chain prices are in WIRE wei (18 decimals, BigInt)
- **Display**: use `ethers.formatEther(priceWei)` → string like `"0.01"`
- **Resale listing input**: user enters WIRE amount (e.g. "0.012"), converted with `ethers.parseEther(String(price))` in `handleListResale`
- Currency label throughout UI: **WIRE** (not PKR — was PKR in original mock data)

## Demo Mode
- When `CONTRACT_ADDRESS = "0x000...000"`, `isContractDeployed()` returns false
- App falls back to `MATCHES` and `RESALE_LISTINGS` from `mockData.js`
- Mock transactions simulated with `wait()` delays
- Currently: **LIVE mode** (real contract deployed)

## Pages
| Route (state) | Component | Access |
|--------------|-----------|--------|
| `browse` | HeroBanner + MatchCard grid + ResaleSection | Public |
| `my-tickets` | MyTicketsPage | Wallet required |
| `verify` | VerifyPage | Public (gate operators) |

## Adding New Teams
1. Add abbreviation → full name in `TEAM_NAME_MAP` in `src/blockchain.js`
2. Add full name → colors in `TEAM_COLORS` in `src/styles.js`

## Adding New Matches
Deploy on-chain using `createMatch(name, venue, date, maxResalePercentage)` then `mintTickets(matchId, tier, faceValue, quantity)` for each tier. The app picks them up automatically via `nextMatchId()` — no frontend changes needed.

## No Tests
No test suite configured. Testing is done manually via demo mode and live testnet.
