import { useState } from "react";
import QRCode from "qrcode";
import { COLORS, TEAM_COLORS, S, Icons, font } from "../styles";
import CollectibleModal from "./CollectibleModal";

const BADGE_TIERS = [
  { min: 8, label: "Diamond", color: "#b9f2ff", className: "badge-diamond", emoji: "💎" },
  { min: 5, label: "Gold",    color: "#FFD700", className: "badge-gold",    emoji: "🥇" },
  { min: 3, label: "Silver",  color: "#c0c0c0", className: "badge-silver",  emoji: "🥈" },
  { min: 1, label: "Bronze",  color: "#cd7f32", className: "badge-bronze",  emoji: "🥉" },
];

export default function MyTicketsPage({ wallet, myTickets, matches, onListResale, onCancelListing }) {
  const [listingModal, setListingModal] = useState(null);
  const [collectibleView, setCollectibleView] = useState(null);
  const [listPrice, setListPrice] = useState("");
  const [qrModal, setQrModal] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  const showQr = async (ticket) => {
    setQrModal(ticket);
    setQrDataUrl(null);
    const payload = JSON.stringify({ tokenId: ticket.tokenId, wallet, matchId: ticket.matchId, timestamp: Date.now() });
    try {
      const url = await QRCode.toDataURL(payload, { width: 200, margin: 1, color: { dark: "#0a0f1a", light: "#ffffff" } });
      setQrDataUrl(url);
    } catch {}
  };

  if (!wallet) {
    return (
      <div style={{ ...S.page, textAlign: "center", paddingTop: 120 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${COLORS.gold}10`, border: `1px solid ${COLORS.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>&#x1F3AB;</div>
        <h2 style={{ ...S.sectionTitle, fontSize: 28 }}>Connect Your Wallet</h2>
        <p style={{ color: COLORS.gray, fontSize: 15 }}>Connect MetaMask to view your NFT tickets</p>
      </div>
    );
  }

  if (myTickets.length === 0) {
    return (
      <div style={{ ...S.page, textAlign: "center", paddingTop: 120 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${COLORS.greenLight}10`, border: `1px solid ${COLORS.greenLight}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>&#x1F3CF;</div>
        <h2 style={{ ...S.sectionTitle, fontSize: 28 }}>No Tickets Yet</h2>
        <p style={{ color: COLORS.gray, fontSize: 15 }}>Browse matches and buy your first NFT ticket!</p>
      </div>
    );
  }

  const usedCount = myTickets.filter(t => t.status === "used" || t.status === "collectible").length;
  const earnedBadge = BADGE_TIERS.find(b => usedCount >= b.min);

  return (
    <div style={S.page}>
      <h1 style={S.sectionTitle}>My Tickets</h1>
      <p style={S.sectionSub}>{myTickets.length} NFT ticket{myTickets.length !== 1 ? "s" : ""} in your wallet</p>

      {/* ── Fan Loyalty Badge ── */}
      {earnedBadge && (
        <div
          className={earnedBadge.className}
          style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 24px", borderRadius: 16, background: `${earnedBadge.color}10`, marginBottom: 28, cursor: "default" }}
        >
          <span style={{ fontSize: 36 }}>{earnedBadge.emoji}</span>
          <div>
            <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: earnedBadge.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Fan Loyalty Badge</div>
            <div style={{ fontFamily: font, fontSize: 22, fontWeight: 800, color: earnedBadge.color }}>{earnedBadge.label} Fan</div>
            <div style={{ fontFamily: font, fontSize: 12, color: earnedBadge.color, opacity: 0.7, marginTop: 2 }}>{usedCount} match{usedCount !== 1 ? "es" : ""} attended</div>
          </div>
          {BADGE_TIERS.slice().reverse().map(b => (
            <div key={b.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, opacity: usedCount >= b.min ? 1 : 0.25 }}>
              <span style={{ fontSize: 16 }}>{b.emoji}</span>
              <span style={{ fontFamily: font, fontSize: 9, fontWeight: 700, color: b.color, letterSpacing: "0.06em" }}>{b.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {myTickets.map((t, i) => {
          const match = matches.find(m => m.id === t.matchId);
          const homeColor = TEAM_COLORS[match?.home]?.primary || COLORS.greenLight;
          const faceDisplay = t.faceValueFormatted ?? String(t.faceValue ?? 0);
          const listDisplay = t.listPriceFormatted ?? String(t.listPrice ?? 0);
          return (
            <div key={i} style={S.ticketCard}>
              <div style={{ height: 6, background: `linear-gradient(90deg, ${homeColor}, ${COLORS.gold})` }} />
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                  <div>
                    <span style={S.ticketBadge(t.tier)}>{t.tier}</span>
                    <span style={{ ...S.ticketStatus(t.status), marginLeft: 8 }}>
                      {t.status === "active" ? "\u25CF Active" : t.status === "listed" ? "\u25CE Listed" : t.status === "used" ? "\u2713 Used" : "\u2605 Collectible"}
                    </span>
                  </div>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.grayDark }}>#{t.tokenId}</span>
                </div>
                <h3 style={{ fontFamily: font, fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                  {match ? `${match.home} vs ${match.away}` : `Match #${t.matchId}`}
                </h3>
                <p style={{ fontSize: 13, color: COLORS.gray, marginBottom: 4 }}>
                  {match ? `${match.date} \u00B7 ${match.venue}` : ""}
                </p>
                <div style={{ fontFamily: font, fontSize: 22, fontWeight: 800, marginTop: 12 }}>
                  {faceDisplay} WIRE
                </div>
                {t.status === "listed" && t.listPrice && (
                  <div style={{ fontSize: 13, color: COLORS.gold, marginTop: 4 }}>Listed at {listDisplay} WIRE</div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                  {t.status === "active" && (
                    <>
                      <button style={S.btnGold} onClick={() => setListingModal(t)}>List for Resale</button>
                      <button style={{ fontFamily: font, padding: "10px 20px", borderRadius: 10, border: `1px solid ${COLORS.greenLight}40`, background: `${COLORS.greenLight}10`, color: COLORS.greenLight, fontSize: 13, fontWeight: 700, cursor: "pointer" }} onClick={() => showQr(t)}>Show QR</button>
                    </>
                  )}
                  {t.status === "listed" && (
                    <button style={S.btnDanger} onClick={() => onCancelListing(t.tokenId)}>Cancel Listing</button>
                  )}
                  {(t.status === "used" || t.status === "collectible") && (
                    <button
                      style={{ fontFamily: font, padding: "10px 20px", borderRadius: 10, border: `1px solid ${COLORS.gold}40`, background: `linear-gradient(135deg, ${COLORS.gold}15, ${COLORS.gold}05)`, color: COLORS.gold, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", gap: 8 }}
                      onClick={() => setCollectibleView(t)}
                    >
                      {Icons.star} View Collectible
                    </button>
                  )}
                </div>
                <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: COLORS.bg, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.grayDark }}>
                  {Icons.shield} On-chain &middot; WireFluid &middot; Token #{t.tokenId}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* List for Resale Modal */}
      {listingModal && (() => {
        const listingMatch = matches.find(m => m.id === listingModal.matchId);
        const resaleCap = listingMatch?.resaleCap || 120;
        const faceDisplay = listingModal.faceValueFormatted ?? String(listingModal.faceValue ?? 0);
        const maxResale = (parseFloat(faceDisplay) * resaleCap / 100).toFixed(6);
        return (
          <div style={S.modal} onClick={() => setListingModal(null)}>
            <div style={{ ...S.modalContent, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <div style={S.modalHeader}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontFamily: font, fontSize: 20, fontWeight: 800 }}>List for Resale</h2>
                  <button onClick={() => setListingModal(null)} style={{ background: "none", border: "none", color: COLORS.gray, cursor: "pointer" }}>{Icons.close}</button>
                </div>
              </div>
              <div style={S.modalBody}>
                <div style={{ padding: 16, borderRadius: 12, background: COLORS.bg, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: COLORS.gray }}>Face Value</div>
                  <div style={{ fontFamily: font, fontSize: 24, fontWeight: 800 }}>{faceDisplay} WIRE</div>
                  <div style={{ fontSize: 12, color: COLORS.gold, marginTop: 4 }}>
                    Max resale: {maxResale} WIRE
                  </div>
                </div>
                <label style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.gray, display: "block", marginBottom: 8 }}>Your Price (WIRE)</label>
                <input
                  type="number"
                  step="any"
                  value={listPrice}
                  onChange={e => setListPrice(e.target.value)}
                  placeholder={`Max ${maxResale}`}
                  style={S.verifyInput}
                />
                <button
                  style={{ ...S.btnPrimary(!listPrice), marginTop: 16 }}
                  onClick={() => {
                    onListResale(listingModal.tokenId, listPrice);
                    setListingModal(null);
                    setListPrice("");
                  }}
                  disabled={!listPrice}
                >
                  List Ticket
                </button>
                <p style={{ marginTop: 12, fontSize: 11, color: COLORS.grayDark, textAlign: "center" }}>5% royalty goes to the organizer on resale</p>
              </div>
            </div>
          </div>
        );
      })()}

      {qrModal && (
        <div style={S.modal} onClick={() => setQrModal(null)}>
          <div style={{ ...S.modalContent, maxWidth: 320, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ ...S.modalHeader, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: font, fontSize: 16, fontWeight: 800 }}>Entry QR Code</span>
              <button onClick={() => setQrModal(null)} style={{ background: "none", border: "none", color: COLORS.gray, cursor: "pointer", padding: 4 }}>{Icons.close}</button>
            </div>
            <div style={S.modalBody}>
              <div style={{ padding: 12, background: COLORS.white, borderRadius: 12, display: "inline-block", border: `2px solid ${COLORS.greenLight}40` }}>
                {qrDataUrl
                  ? <img src={qrDataUrl} alt="Entry QR Code" width={200} height={200} style={{ display: "block", borderRadius: 4 }} />
                  : <div style={{ width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>Generating...</div>
                }
              </div>
              <p style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.greenLight, marginTop: 16, lineHeight: 1.5 }}>
                Valid for 5 minutes — show this at the stadium gate
              </p>
              <p style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.grayDark, marginTop: 6 }}>
                Token #{qrModal.tokenId} &middot; {qrModal.tier}
              </p>
            </div>
          </div>
        </div>
      )}

      {collectibleView && (
        <CollectibleModal
          ticket={collectibleView}
          match={matches.find(m => m.id === collectibleView.matchId)}
          wallet={wallet}
          onClose={() => setCollectibleView(null)}
        />
      )}
    </div>
  );
}
