import { useState } from "react";
import { COLORS, TEAM_COLORS, S, Icons, font } from "../styles";
import { MATCHES } from "../mockData";
import CollectibleModal from "./CollectibleModal";

export default function MyTicketsPage({ wallet, myTickets, onListResale, onCancelListing }) {
  const [listingModal, setListingModal] = useState(null);
  const [collectibleView, setCollectibleView] = useState(null);
  const [listPrice, setListPrice] = useState("");

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

  return (
    <div style={S.page}>
      <h1 style={S.sectionTitle}>My Tickets</h1>
      <p style={S.sectionSub}>{myTickets.length} NFT ticket{myTickets.length !== 1 ? "s" : ""} in your wallet</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {myTickets.map((t, i) => {
          const match = MATCHES.find(m => m.id === t.matchId);
          const homeColor = TEAM_COLORS[match?.home]?.primary || COLORS.greenLight;
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
                  PKR {(t.faceValue || 0).toLocaleString()}
                </div>
                {t.status === "listed" && t.listPrice && (
                  <div style={{ fontSize: 13, color: COLORS.gold, marginTop: 4 }}>Listed at PKR {t.listPrice.toLocaleString()}</div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  {t.status === "active" && (
                    <button style={S.btnGold} onClick={() => setListingModal(t)}>List for Resale</button>
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
                  {Icons.shield} On-chain &middot; WireFluid &middot; Tx: 0x{Math.random().toString(16).slice(2, 10)}...
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* List for Resale Modal */}
      {listingModal && (
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
                <div style={{ fontFamily: font, fontSize: 24, fontWeight: 800 }}>PKR {(listingModal.faceValue || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: COLORS.gold, marginTop: 4 }}>
                  Max resale: PKR {((listingModal.faceValue || 0) * (MATCHES.find(m => m.id === listingModal.matchId)?.resaleCap || 120) / 100).toLocaleString()}
                </div>
              </div>
              <label style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.gray, display: "block", marginBottom: 8 }}>Your Price (PKR)</label>
              <input
                type="number"
                value={listPrice}
                onChange={e => setListPrice(e.target.value)}
                placeholder={`Max ${((listingModal.faceValue || 0) * (MATCHES.find(m => m.id === listingModal.matchId)?.resaleCap || 120) / 100).toLocaleString()}`}
                style={S.verifyInput}
              />
              <button
                style={{ ...S.btnPrimary(!listPrice), marginTop: 16 }}
                onClick={() => {
                  onListResale(listingModal.tokenId, parseInt(listPrice));
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
      )}

      {collectibleView && (
        <CollectibleModal
          ticket={collectibleView}
          match={MATCHES.find(m => m.id === collectibleView.matchId)}
          wallet={wallet}
          onClose={() => setCollectibleView(null)}
        />
      )}
    </div>
  );
}
