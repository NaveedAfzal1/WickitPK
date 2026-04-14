import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { isContractDeployed } from "./contract";
import {
  connectWallet,
  handleBlockchainError,
  buyTicket as buyTicketOnChain,
  buyResale as buyResaleOnChain,
  listForResale as listForResaleOnChain,
  cancelListing as cancelListingOnChain,
  giftTransfer as giftTransferOnChain,
  markAsCollectible as markAsCollectibleOnChain,
  fetchAllMatches,
  fetchResaleTickets,
  fetchMyTickets,
  fetchAvailableTickets,
  clearMatchesCache,
} from "./blockchain";
import { COLORS, S, font } from "./styles";
import { MATCHES, RESALE_LISTINGS, MOCK_MY_TICKETS, wait } from "./mockData";

import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import MatchCard from "./components/MatchCard";
import BuyModal from "./components/BuyModal";
import ResaleSection from "./components/ResaleSection";
import MyTicketsPage from "./components/MyTicketsPage";
import VerifyPage from "./components/VerifyPage";

export default function App() {
  const [page, setPage] = useState("browse");
  const [wallet, setWallet] = useState(null);
  const [buyModal, setBuyModal] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [toast, setToast] = useState(null);
  const [matches, setMatches] = useState([]);
  const [resaleListings, setResaleListings] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const deployed = isContractDeployed();

  // ─── TOAST ───
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── WALLET CONNECTION ───
  const handleConnect = async () => {
    if (wallet) return;
    try {
      const addr = await connectWallet();
      setWallet(addr);
      showToast("Wallet connected to WireFluid Testnet!");
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
    }
  };

  // Listen for MetaMask account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = (accounts) => { clearMatchesCache(); setWallet(accounts[0] || null); };
    const onChain = () => window.location.reload();
    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, []);

  // ─── LOAD MATCHES ON MOUNT ───
  useEffect(() => {
    if (!deployed) {
      setMatches(MATCHES);
      setResaleListings(RESALE_LISTINGS);
      return;
    }
    setMatchesLoading(true);
    fetchAllMatches()
      .then(data => setMatches(data))
      .catch(err => console.error("Failed to load matches:", err))
      .finally(() => setMatchesLoading(false));
  }, []);

  // ─── LOAD RESALE LISTINGS WHEN MATCHES ARE READY ───
  useEffect(() => {
    if (!deployed || matches.length === 0) return;
    Promise.all(matches.map(m => fetchResaleTickets(m.id)))
      .then(results => setResaleListings(results.flat()))
      .catch(err => console.error("Failed to load resale listings:", err));
  }, [matches]);

  // ─── LOAD MY TICKETS FROM CHAIN WHEN WALLET CONNECTS ───
  useEffect(() => {
    if (!wallet || !deployed || matches.length === 0) return;
    const matchIds = matches.map(m => m.id);
    fetchMyTickets(wallet, matchIds)
      .then(setMyTickets)
      .catch(err => console.error("Failed to load tickets:", err));
  }, [wallet, matches]);

  // Load demo tickets when wallet connects (demo mode only)
  useEffect(() => {
    if (wallet && !deployed && myTickets.length === 0) {
      setMyTickets(MOCK_MY_TICKETS);
    }
  }, [wallet]);

  // ─── ADMIN: MARK MATCH AS COLLECTIBLE ───
  const DEPLOYER = "0xb1e5427e245f3741Aa2ced12be2A67b8F527c892";
  const isAdmin = wallet && wallet.toLowerCase() === DEPLOYER.toLowerCase();

  const handleMarkCollectible = async (matchId) => {
    try {
      showToast("Confirm transaction in MetaMask...");
      const result = await markAsCollectibleOnChain(matchId);
      showToast(`Match marked as collectible! TX: ${result.txHash.slice(0, 14)}...`);
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, collectible: true } : m));
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
    }
  };

  // ─── PURCHASE TICKET ───
  const handlePurchase = async (match, tier) => {
    try {
      let tokenId;
      if (deployed) {
        showToast("Fetching available tickets...");
        const available = await fetchAvailableTickets(match.id);
        const tierTickets = available.filter(t => t.tier === tier);
        if (tierTickets.length === 0) throw new Error(`No ${tier} tickets available for this match`);
        tokenId = tierTickets[0].tokenId;
        showToast("Confirm transaction in MetaMask...");
        const result = await buyTicketOnChain(tokenId);
        showToast(`Ticket purchased! TX: ${result.txHash.slice(0, 14)}...`);
      } else {
        tokenId = Math.floor(Math.random() * 900 + 100);
        await wait(2000);
      }

      const ticketData = match.tickets[tier];
      setMyTickets(prev => [...prev, {
        tokenId,
        matchId: match.id,
        tier,
        faceValue: ticketData?.priceWei ?? BigInt(0),
        faceValueFormatted: ticketData?.price || "0",
        status: "active",
        listPrice: null,
        listPriceFormatted: null,
      }]);
      if (!deployed) showToast(`${tier} ticket purchased! Token #${tokenId}`);
      setTimeout(() => { setBuyModal(null); setPage("my-tickets"); }, 1500);
      return tokenId;
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
      throw err;
    }
  };

  // ─── GIFT PURCHASE ───
  const handleGiftPurchase = async (match, tier, recipients, onProgress) => {
    const total = recipients.length * 2;
    let step = 0;
    try {
      if (deployed) {
        showToast("Fetching available tickets...");
        const available = await fetchAvailableTickets(match.id);
        const tierTickets = available.filter(t => t.tier === tier);
        if (tierTickets.length < recipients.length) {
          throw new Error(`Only ${tierTickets.length} ${tier} tickets available for this match`);
        }
        for (let i = 0; i < recipients.length; i++) {
          onProgress(step++, total, `Buying ticket ${i + 1} of ${recipients.length}...`);
          const tokenId = tierTickets[i].tokenId;
          await buyTicketOnChain(tokenId);
          onProgress(step++, total, `Transferring to ${recipients[i].slice(0, 8)}...`);
          await giftTransferOnChain(wallet, recipients[i], tokenId);
        }
      } else {
        for (let i = 0; i < recipients.length; i++) {
          onProgress(step++, total, `Buying ticket ${i + 1} of ${recipients.length}...`);
          await wait(800);
          onProgress(step++, total, `Transferring to ${recipients[i].slice(0, 8)}...`);
          await wait(400);
        }
      }
      onProgress(total, total, "All done!");
      showToast(`${recipients.length} ticket${recipients.length > 1 ? "s" : ""} gifted successfully!`);
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
      throw err;
    }
  };

  // ─── LIST FOR RESALE ───
  const handleListResale = async (tokenId, price) => {
    try {
      if (deployed) {
        showToast("Approve & list \u2014 confirm in MetaMask...");
        const priceWei = ethers.parseEther(String(price));
        await listForResaleOnChain(tokenId, priceWei);
        showToast("Listed for resale on-chain!");
      } else {
        await wait(600);
        showToast(`Ticket #${tokenId} listed for ${price} WIRE`);
      }
      setMyTickets(prev => prev.map(t =>
        t.tokenId === tokenId ? { ...t, status: "listed", listPrice: price, listPriceFormatted: String(price) } : t
      ));
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
    }
  };

  // ─── CANCEL LISTING ───
  const handleCancelListing = async (tokenId) => {
    try {
      if (deployed) {
        showToast("Confirm cancellation in MetaMask...");
        await cancelListingOnChain(tokenId);
        showToast("Listing cancelled on-chain!");
      } else {
        await wait(400);
        showToast(`Listing cancelled for ticket #${tokenId}`);
      }
      setMyTickets(prev => prev.map(t =>
        t.tokenId === tokenId ? { ...t, status: "active", listPrice: null, listPriceFormatted: null } : t
      ));
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
    }
  };

  // ─── BUY RESALE ───
  const handleBuyResale = async (listing) => {
    if (!wallet) { showToast("Connect wallet first", "error"); return; }
    try {
      if (deployed) {
        showToast("Confirm transaction in MetaMask...");
        await buyResaleOnChain(listing.tokenId);
        showToast("Resale ticket purchased on-chain!");
      } else {
        await wait(800);
        showToast(`Resale ticket #${listing.tokenId} purchased!`);
      }
      setMyTickets(prev => [...prev, {
        tokenId: listing.tokenId,
        matchId: listing.matchId,
        tier: listing.tier,
        faceValue: listing.faceValue,
        faceValueFormatted: listing.faceValueFormatted || "0",
        status: "active",
        listPrice: null,
        listPriceFormatted: null,
      }]);
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
    }
  };

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes levitate { 0%, 100% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-14px) rotateX(1.5deg); } }
        @keyframes shimmerSweep { 0% { left: -100%; opacity: 0; } 15% { opacity: 1; } 50% { left: 100%; opacity: 0; } 100% { left: 100%; opacity: 0; } }
        @keyframes stampIn { 0% { transform: translate(-50%, -50%) rotate(-20deg) scale(3); opacity: 0; } 60% { transform: translate(-50%, -50%) rotate(-20deg) scale(0.95); opacity: 0.9; } 80% { transform: translate(-50%, -50%) rotate(-20deg) scale(1.05); } 100% { transform: translate(-50%, -50%) rotate(-20deg) scale(1); opacity: 1; } }
        @keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(180deg); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 30px rgba(255,215,0,0.15), 0 0 60px rgba(255,215,0,0.05); } 50% { box-shadow: 0 0 50px rgba(255,215,0,0.3), 0 0 100px rgba(255,215,0,0.1); } }
        @keyframes holographicShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes badgeGlowBronze { 0%, 100% { box-shadow: 0 0 8px #cd7f3250, 0 0 20px #cd7f3220; } 50% { box-shadow: 0 0 24px #cd7f3299, 0 0 48px #cd7f3245; } }
        @keyframes badgeGlowSilver { 0%, 100% { box-shadow: 0 0 8px #c0c0c050, 0 0 20px #c0c0c020; } 50% { box-shadow: 0 0 24px #c0c0c099, 0 0 48px #c0c0c045; } }
        @keyframes badgeGlowGold   { 0%, 100% { box-shadow: 0 0 8px #FFD70050, 0 0 20px #FFD70020; } 50% { box-shadow: 0 0 24px #FFD70099, 0 0 48px #FFD70045; } }
        @keyframes badgeGlowDiamond{ 0%, 100% { box-shadow: 0 0 8px #b9f2ff50, 0 0 20px #b9f2ff20; } 50% { box-shadow: 0 0 24px #b9f2ff99, 0 0 48px #b9f2ff45; } }
        .badge-bronze { animation: badgeGlowBronze 2s ease-in-out infinite; border: 2px solid #cd7f32 !important; }
        .badge-silver { animation: badgeGlowSilver 2s ease-in-out infinite; border: 2px solid #c0c0c0 !important; }
        .badge-gold   { animation: badgeGlowGold   2s ease-in-out infinite; border: 2px solid #FFD700 !important; }
        .badge-diamond{ animation: badgeGlowDiamond 2s ease-in-out infinite; border: 2px solid #b9f2ff !important; }
        .collectible-card { animation: levitate 4s ease-in-out infinite, pulseGlow 4s ease-in-out infinite; transition: transform 0.15s ease-out; }
        .collectible-card:hover { animation-play-state: paused; }
        .collectible-shimmer { animation: shimmerSweep 3s ease-in-out infinite; animation-delay: 1s; }
        .collectible-stamp { animation: stampIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; animation-delay: 0.5s; opacity: 0; }
        .sparkle-particle { animation: sparkle 2.5s ease-in-out infinite; }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @media (max-width: 768px) { .match-grid { grid-template-columns: 1fr !important; } .stats-bar { grid-template-columns: repeat(2, 1fr) !important; } }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
        input:focus { border-color: ${COLORS.greenLight} !important; box-shadow: 0 0 0 3px ${COLORS.greenGlow}; }
        button:hover { opacity: 0.9; }
      `}</style>

      <div style={S.bgGlow} />
      <div style={S.gridOverlay} />

      <Navbar page={page} setPage={setPage} wallet={wallet} onConnect={handleConnect} />

      {page === "browse" && (
        <div style={S.page}>
          <HeroBanner deployed={deployed} />
          {/* Stats Bar */}
          <div className="stats-bar" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40, padding: "20px 0" }}>
            {[
              { value: String(matches.length || 6), label: "Matches", icon: "\uD83C\uDFCF" },
              { value: "6", label: "Venues", icon: "\uD83C\uDFDF\uFE0F" },
              { value: "100%", label: "On-Chain", icon: "\u26D3\uFE0F" },
              { value: "5s", label: "Confirmation", icon: "\u26A1" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontFamily: font, fontSize: 24, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.02em" }}>{s.value}</div>
                <div style={{ fontFamily: font, fontSize: 11, fontWeight: 600, color: COLORS.gray, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <h2 style={{ ...S.sectionTitle, fontSize: 24 }}>Upcoming Matches</h2>
          <p style={S.sectionSub}>Select a match to purchase verified digital tickets</p>
          {matchesLoading ? (
            <div style={{ textAlign: "center", padding: 60, color: COLORS.gray }}>
              <div style={{ display: "inline-block", width: 32, height: 32, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.greenLight, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ marginTop: 16, fontFamily: font, fontSize: 14 }}>Loading matches from chain...</p>
            </div>
          ) : (
            <div className="match-grid" style={S.matchGrid}>
              {matches.map(m => (
                <MatchCard key={m.id} match={m} onBuy={(match) => setBuyModal(match)} />
              ))}
            </div>
          )}
          {isAdmin && (
            <div style={{ marginTop: 40, padding: 24, borderRadius: 16, background: `${COLORS.gold}08`, border: `1px solid ${COLORS.gold}30` }}>
              <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
                Admin — Mark Match as Collectible
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {matches.map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontFamily: font, fontSize: 14, fontWeight: 600 }}>
                      Match {m.matchNum} — {m.home} vs {m.away}
                    </span>
                    {m.collectible ? (
                      <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: COLORS.gold }}>★ Collectible</span>
                    ) : (
                      <button
                        onClick={() => handleMarkCollectible(m.id)}
                        style={{ fontFamily: font, fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: `1px solid ${COLORS.gold}50`, background: `${COLORS.gold}10`, color: COLORS.gold, cursor: "pointer" }}
                      >
                        Mark as Collectible
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <ResaleSection listings={resaleListings} matches={matches} wallet={wallet} onBuyResale={handleBuyResale} />
        </div>
      )}

      {page === "my-tickets" && (
        <MyTicketsPage
          wallet={wallet}
          myTickets={myTickets}
          matches={matches}
          onListResale={handleListResale}
          onCancelListing={handleCancelListing}
        />
      )}

      {page === "verify" && <VerifyPage showToast={showToast} />}

      {buyModal && (
        <BuyModal
          match={buyModal}
          onClose={() => { setBuyModal(null); setPage("my-tickets"); }}
          wallet={wallet}
          onPurchase={handlePurchase}
          onGiftPurchase={handleGiftPurchase}
          deployed={deployed}
        />
      )}

      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );
}
