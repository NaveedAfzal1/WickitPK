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
// PSL TrustTicket — Blockchain Interaction Layer (ethers.js v6)
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

// ─── LIST FOR RESALE (2-step: approve + list) ───
export async function listForResale(tokenId, priceWei) {
  if (!isContractDeployed()) throw new Error("Contract not yet deployed.");
  await ensureCorrectNetwork();

  const contract = await getSignerContract();

  // Step 1: Check if contract is approved, if not — approve
  const approved = await contract.getApproved(tokenId);
  if (approved.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
    const approveTx = await contract.approve(CONTRACT_ADDRESS, tokenId);
    await approveTx.wait();
  }

  // Step 2: List for resale
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

// ─── FETCH ALL MATCHES ───
export async function fetchAllMatches() {
  if (!isContractDeployed()) return [];

  const contract = getReadOnlyContract();
  const nextId = await contract.nextMatchId();
  const count = Number(nextId);

  const matches = [];
  const promises = [];
  for (let i = 1; i < count; i++) {
    promises.push(
      contract.getMatchDetails(i).then((details) => ({
        id: i,
        name: details.name,
        venue: details.venue,
        date: Number(details.date),
        maxResalePercentage: Number(details.maxResalePercentage),
        active: details.active,
        collectible: details.collectible,
      }))
    );
  }

  const results = await Promise.all(promises);
  return results.filter((m) => m.active);
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
