import { ethers } from "ethers";
import {
  WIREFLUID_CHAIN,
  CONTRACT_ADDRESS,
  TIER_NAMES,
  isContractDeployed,
  getBrowserProvider,
  getReadOnlyContract,
  getSignerContract,
  explorerTxUrl,
} from "./contract";

// ═══════════════════════════════════════════════════════════════
// WickitPK — Blockchain Interaction Layer (ethers.js v6)
// ═══════════════════════════════════════════════════════════════

// ─── ERROR HANDLER ───
export function handleBlockchainError(error) {
  // MetaMask user rejection
  if (error.code === 4001 || error.code === "ACTION_REJECTED") {
    return "Transaction rejected by user.";
  }
  // Request already pending in MetaMask
  if (error.code === -32002) {
    return "A request is already pending in MetaMask. Please open MetaMask and respond.";
  }
  // Insufficient funds
  if (error.message?.includes("insufficient funds")) {
    return "Insufficient WIRE balance for this transaction.";
  }
  // Contract revert
  if (error.message?.includes("execution reverted") || error.reason) {
    return error.reason || "Transaction reverted by the contract.";
  }
  // ethers shortMessage
  if (error.shortMessage) {
    return error.shortMessage;
  }
  return error.message || "An unknown error occurred.";
}

// ─── WALLET CONNECTION ───
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed. Please install MetaMask to continue.");
  }

  // Request account access
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  // Check current chain
  const chainId = await window.ethereum.request({ method: "eth_chainId" });

  if (chainId !== WIREFLUID_CHAIN.chainId) {
    try {
      // Try switching to WireFluid
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: WIREFLUID_CHAIN.chainId }],
      });
    } catch (switchError) {
      // Chain not added to MetaMask (error code 4902)
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: WIREFLUID_CHAIN.chainId,
              chainName: WIREFLUID_CHAIN.chainName,
              rpcUrls: WIREFLUID_CHAIN.rpcUrls,
              nativeCurrency: WIREFLUID_CHAIN.nativeCurrency,
              blockExplorerUrls: WIREFLUID_CHAIN.blockExplorerUrls,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  return accounts[0];
}

// ─── ENSURE CORRECT NETWORK ───
export async function ensureCorrectNetwork() {
  if (!window.ethereum) return;
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId !== WIREFLUID_CHAIN.chainId) {
    throw new Error(
      `Wrong network. Please switch to WireFluid Testnet (Chain ID ${WIREFLUID_CHAIN.chainIdDecimal}).`
    );
  }
}

// ─── BUY PRIMARY TICKET ───
export async function buyTicket(tokenId) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");
  await ensureCorrectNetwork();

  // Read face value from contract
  const readContract = getReadOnlyContract();
  const info = await readContract.getTicketInfo(tokenId);
  const faceValue = info.faceValue; // BigInt in wei

  // Send transaction
  const contract = await getSignerContract();
  const tx = await contract.buyTicket(tokenId, { value: faceValue });
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    explorerUrl: explorerTxUrl(receipt.hash),
    tokenId: Number(tokenId),
  };
}

// ─── LIST FOR RESALE ───
export async function listForResale(tokenId, priceWei) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");
  await ensureCorrectNetwork();

  const contract = await getSignerContract();
  const tx = await contract.listForResale(tokenId, priceWei);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    explorerUrl: explorerTxUrl(receipt.hash),
  };
}

// ─── CANCEL LISTING ───
export async function cancelListing(tokenId) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");
  await ensureCorrectNetwork();

  const contract = await getSignerContract();
  const tx = await contract.cancelListing(tokenId);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    explorerUrl: explorerTxUrl(receipt.hash),
  };
}

// ─── BUY RESALE TICKET ───
export async function buyResale(tokenId) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");
  await ensureCorrectNetwork();

  // Read listing price
  const readContract = getReadOnlyContract();
  const resaleInfo = await readContract.getTicketResaleInfo(tokenId);
  const listingPrice = resaleInfo.listingPrice; // BigInt in wei

  const contract = await getSignerContract();
  const tx = await contract.buyResale(tokenId, { value: listingPrice });
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    explorerUrl: explorerTxUrl(receipt.hash),
  };
}

// ─── VERIFY OWNERSHIP (read-only, no wallet needed) ───
export async function verifyOwnership(tokenId, walletAddress) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");

  const contract = getReadOnlyContract();
  const valid = await contract.verifyOwnership(tokenId, walletAddress);
  return valid;
}

// ─── MARK TICKET AS USED ───
export async function markTicketAsUsed(tokenId) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");
  await ensureCorrectNetwork();

  const contract = await getSignerContract();
  const tx = await contract.markAsUsed(tokenId);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    explorerUrl: explorerTxUrl(receipt.hash),
  };
}

// ─── MARK MATCH AS COLLECTIBLE (owner only) ───
export async function markAsCollectible(matchId) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");
  await ensureCorrectNetwork();

  const contract = await getSignerContract();
  const tx = await contract.markAsCollectible(matchId);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    explorerUrl: explorerTxUrl(receipt.hash),
  };
}

// ─── GIFT TRANSFER (safeTransferFrom after buying) ───
export async function giftTransfer(from, to, tokenId) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");
  await ensureCorrectNetwork();

  const contract = await getSignerContract();
  // Use function fragment selector for overloaded safeTransferFrom
  const tx = await contract["safeTransferFrom(address,address,uint256)"](from, to, tokenId);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    explorerUrl: explorerTxUrl(receipt.hash),
  };
}

// ─── TEAM NAME LOOKUP ───
const TEAM_NAME_MAP = {
  LQ: "Lahore Qalandars",
  IU: "Islamabad United",
  KK: "Karachi Kings",
  MS: "Multan Sultans",
  PZ: "Peshawar Zalmi",
  QG: "Quetta Gladiators",
  RP: "Rawalpindi Pindiz",
  HK: "Hyderabad Kingsmen",
};

function parseMatchName(name) {
  // Format: "LQ vs IU - Match 1"
  const dashIdx = name.indexOf(" - ");
  const vsPart = dashIdx !== -1 ? name.slice(0, dashIdx) : name;
  const matchPart = dashIdx !== -1 ? name.slice(dashIdx + 3) : "";
  const matchNum = matchPart ? parseInt(matchPart.replace("Match ", "")) || null : null;
  const parts = vsPart.split(" vs ");
  const homeAbbr = (parts[0] || "").trim();
  const awayAbbr = (parts[1] || "").trim();
  return {
    home: TEAM_NAME_MAP[homeAbbr] || homeAbbr,
    away: TEAM_NAME_MAP[awayAbbr] || awayAbbr,
    matchNum,
  };
}

function formatMatchDate(unixTimestamp) {
  const d = new Date(Number(unixTimestamp) * 1000);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatMatchTime(unixTimestamp) {
  const d = new Date(Number(unixTimestamp) * 1000);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// ─── FETCH ALL MATCHES ───
const MATCHES_CACHE_KEY = "wickitpk_matches";
const MATCHES_CACHE_TS_KEY = "wickitpk_matches_ts";
const MATCHES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function clearMatchesCache() {
  sessionStorage.removeItem(MATCHES_CACHE_KEY);
  sessionStorage.removeItem(MATCHES_CACHE_TS_KEY);
}

export async function fetchAllMatches() {
  if (!isContractDeployed()) return [];

  // Return cached data if still fresh
  try {
    const cached = sessionStorage.getItem(MATCHES_CACHE_KEY);
    const cachedTs = sessionStorage.getItem(MATCHES_CACHE_TS_KEY);
    if (cached && cachedTs && Date.now() - Number(cachedTs) < MATCHES_CACHE_TTL_MS) {
      return JSON.parse(cached);
    }
  } catch {}

  const contract = getReadOnlyContract();
  const nextId = await contract.nextMatchId();
  const count = Number(nextId);

  const matchIds = [];
  for (let i = 1; i < count; i++) matchIds.push(i);

  const matches = await Promise.all(
    matchIds.map(async (id) => {
      const [details, availableTokenIds] = await Promise.all([
        contract.getMatchDetails(id),
        contract.getAvailableTickets(id),
      ]);

      if (!details.active) return null;

      const { home, away, matchNum } = parseMatchName(details.name);

      // Fetch ticket info for all available tokens to build per-tier pricing
      const availableTickets = await batchFetchTicketInfo(contract, availableTokenIds);

      const tierMap = {};
      for (const ticket of availableTickets) {
        const tier = ticket.tier;
        if (!tierMap[tier]) {
          tierMap[tier] = {
            price: ethers.formatEther(ticket.faceValue),
            priceWei: ticket.faceValue,
            available: 0,
            total: 0,
            sold: 0,
          };
        }
        tierMap[tier].available++;
        tierMap[tier].total++;
      }

      // Ensure all 3 tiers are present
      for (const tier of ["General", "Premium", "VIP"]) {
        if (!tierMap[tier]) {
          tierMap[tier] = { price: "0", priceWei: BigInt(0), available: 0, total: 0, sold: 0 };
        }
      }

      return {
        id,
        home,
        away,
        matchNum: matchNum || id,
        date: formatMatchDate(details.date),
        time: formatMatchTime(details.date),
        venue: details.venue,
        resaleCap: Number(details.maxResalePercentage),
        collectible: details.collectible,
        tickets: tierMap,
      };
    })
  );

  const result = matches.filter(Boolean);

  // Cache the result (BigInt fields serialized to strings for JSON compatibility)
  try {
    const serializable = JSON.parse(JSON.stringify(result, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    ));
    sessionStorage.setItem(MATCHES_CACHE_KEY, JSON.stringify(serializable));
    sessionStorage.setItem(MATCHES_CACHE_TS_KEY, String(Date.now()));
  } catch {}

  return result;
}

// ─── FETCH AVAILABLE TICKETS FOR A MATCH ───
export async function fetchAvailableTickets(matchId) {
  if (!isContractDeployed()) return [];

  const contract = getReadOnlyContract();
  const tokenIds = await contract.getAvailableTickets(matchId);

  // Batch fetch ticket details
  const tickets = await batchFetchTicketInfo(contract, tokenIds);
  return tickets;
}

// ─── FETCH RESALE TICKETS FOR A MATCH ───
export async function fetchResaleTickets(matchId) {
  if (!isContractDeployed()) return [];

  const contract = getReadOnlyContract();
  const tokenIds = await contract.getResaleTickets(matchId);

  // Batch fetch ticket info + resale info
  const BATCH_SIZE = 10;
  const results = [];
  for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
    const batch = tokenIds.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(
      batch.map(async (id) => {
        const [info, resaleInfo] = await Promise.all([
          contract.getTicketInfo(id),
          contract.getTicketResaleInfo(id),
        ]);
        return {
          tokenId: Number(id),
          matchId: Number(info.matchId),
          tier: TIER_NAMES[Number(info.tier)] || "General",
          faceValue: info.faceValue, // BigInt wei
          faceValueFormatted: ethers.formatEther(info.faceValue),
          used: info.used,
          forSale: resaleInfo.forSale,
          listingPrice: resaleInfo.listingPrice, // BigInt wei
          listingPriceFormatted: ethers.formatEther(resaleInfo.listingPrice),
          seller: resaleInfo.seller,
          sellerShort: `${resaleInfo.seller.slice(0, 6)}...${resaleInfo.seller.slice(-4)}`,
        };
      })
    );
    results.push(...details);
  }

  return results.filter((t) => t.forSale);
}

// ─── FETCH MY TICKETS (across all matches) ───
export async function fetchMyTickets(walletAddress, matchIds) {
  if (!isContractDeployed()) return [];

  const contract = getReadOnlyContract();
  const allTickets = [];

  // Fetch across all known match IDs
  const matchPromises = matchIds.map(async (matchId) => {
    const tokenIds = await contract.getMyTickets(walletAddress, matchId);
    return { matchId, tokenIds };
  });

  const matchResults = await Promise.all(matchPromises);

  for (const { matchId, tokenIds } of matchResults) {
    const tickets = await Promise.all(
      tokenIds.map(async (id) => {
        const [info, resaleInfo] = await Promise.all([
          contract.getTicketInfo(id),
          contract.getTicketResaleInfo(id),
        ]);
        let status = "active";
        if (info.used) status = "used";
        else if (resaleInfo.forSale) status = "listed";

        // Check if match is collectible
        let matchCollectible = false;
        try {
          matchCollectible = await contract.isMatchCollectible(matchId);
        } catch (_) {
          // ignore
        }
        if (matchCollectible && info.used) status = "collectible";

        return {
          tokenId: Number(id),
          matchId: Number(info.matchId),
          tier: TIER_NAMES[Number(info.tier)] || "General",
          faceValue: info.faceValue, // BigInt wei
          faceValueFormatted: ethers.formatEther(info.faceValue),
          used: info.used,
          status,
          listPrice: resaleInfo.forSale ? resaleInfo.listingPrice : null,
          listPriceFormatted: resaleInfo.forSale
            ? ethers.formatEther(resaleInfo.listingPrice)
            : null,
        };
      })
    );
    allTickets.push(...tickets);
  }

  return allTickets;
}

// ─── FETCH MATCH DETAILS ───
export async function fetchMatchDetails(matchId) {
  if (!isContractDeployed()) return null;

  const contract = getReadOnlyContract();
  const details = await contract.getMatchDetails(matchId);

  return {
    id: matchId,
    name: details.name,
    venue: details.venue,
    date: Number(details.date),
    maxResalePercentage: Number(details.maxResalePercentage),
    active: details.active,
    collectible: details.collectible,
  };
}

// ─── BATCH FETCH TICKET INFO ───
async function batchFetchTicketInfo(contract, tokenIds) {
  const BATCH_SIZE = 10;
  const results = [];

  for (let i = 0; i < tokenIds.length; i += BATCH_SIZE) {
    const batch = tokenIds.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(
      batch.map(async (id) => {
        const info = await contract.getTicketInfo(id);
        return {
          tokenId: Number(id),
          matchId: Number(info.matchId),
          tier: TIER_NAMES[Number(info.tier)] || "General",
          faceValue: info.faceValue,
          faceValueFormatted: ethers.formatEther(info.faceValue),
          used: info.used,
          currentOwner: info.currentOwner,
        };
      })
    );
    results.push(...details);
  }

  return results;
}
