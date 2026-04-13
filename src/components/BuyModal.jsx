import { useState } from "react";
import { COLORS, S, Icons, font } from "../styles";

export default function BuyModal({ match, onClose, wallet, onPurchase, deployed, loading }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchasedTokenId, setPurchasedTokenId] = useState(null);

  const handleBuy = async () => {
    if (!wallet || !selectedTier) return;
    setBuying(true);
    try {
      const tokenId = await onPurchase(match, selectedTier);
      setPurchasedTokenId(tokenId || Math.floor(Math.random() * 900 + 100));
      setSuccess(true);
    } catch {
      // error handled by parent
    }
    setBuying(false);
  };

  if (success) {
    return (
      <div style={S.modal} onClick={onClose}>
        <div style={{ ...S.modalContent, textAlign: "center", padding: 48 }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${COLORS.greenLight}15`, border: `2px solid ${COLORS.greenLight}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            {Icons.check}
          </div>
          <h2 style={{ fontFamily: font, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Ticket Purchased!</h2>
          <p style={{ color: COLORS.gray, marginBottom: 8, fontSize: 14 }}>
            Your {selectedTier} ticket NFT has been minted to your wallet.
          </p>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: COLORS.bg, border: `1px solid ${COLORS.border}`, marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: COLORS.gray }}>Token ID: #{purchasedTokenId}</span>
            {Icons.link}
          </div>
          {/* QR Code */}
          <div style={{ margin: "0 auto 24px", width: 180 }}>
            <div style={{ padding: 12, background: COLORS.white, borderRadius: 12, display: "inline-block" }}>
              <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="8" width="36" height="36" rx="4" fill="none" stroke="#0a0f1a" strokeWidth="5"/>
                <rect x="16" y="16" width="20" height="20" rx="2" fill="#0a0f1a"/>
                <rect x="96" y="8" width="36" height="36" rx="4" fill="none" stroke="#0a0f1a" strokeWidth="5"/>
                <rect x="104" y="16" width="20" height="20" rx="2" fill="#0a0f1a"/>
                <rect x="8" y="96" width="36" height="36" rx="4" fill="none" stroke="#0a0f1a" strokeWidth="5"/>
                <rect x="16" y="104" width="20" height="20" rx="2" fill="#0a0f1a"/>
                {[[52,8],[60,8],[68,8],[76,8],[84,8],[52,16],[68,16],[84,16],[52,24],[60,24],[76,24],[84,24],[8,52],[16,52],[24,52],[36,52],[52,52],[68,52],[76,52],[84,52],[96,52],[112,52],[120,52],[8,60],[24,60],[36,60],[52,60],[60,60],[76,60],[96,60],[120,60],[8,68],[16,68],[36,68],[52,68],[68,68],[84,68],[96,68],[104,68],[120,68],[8,76],[24,76],[36,76],[52,76],[60,76],[68,76],[76,76],[96,76],[112,76],[120,76],[8,84],[16,84],[36,84],[60,84],[76,84],[84,84],[96,84],[104,84],[120,84],[52,96],[60,96],[76,96],[96,96],[112,96],[120,96],[52,104],[68,104],[84,104],[96,104],[120,104],[52,112],[60,112],[68,112],[76,112],[84,112],[96,112],[104,112],[120,112],[52,120],[76,120],[96,120],[112,120],[120,120]].map(([x,y], i) => (
                  <rect key={i} x={x} y={y} width="7" height="7" rx="1" fill="#0a0f1a"/>
                ))}
                <rect x="54" y="54" width="32" height="32" rx="6" fill="#1a472a"/>
                <text x="70" y="74" textAnchor="middle" fontFamily="Sora, sans-serif" fontSize="10" fontWeight="800" fill="#FFD700">PSL</text>
              </svg>
            </div>
            <p style={{ fontFamily: font, fontSize: 12, fontWeight: 600, color: COLORS.gray, marginTop: 10, lineHeight: 1.4 }}>
              Your entry QR Code — show this at the stadium gate
            </p>
          </div>
          <button style={{ ...S.btnPrimary(false), width: "auto", display: "inline-block", padding: "12px 32px" }} onClick={onClose}>
            View My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalContent} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.08em", marginBottom: 4 }}>MATCH {match.matchNum}</div>
              <h2 style={{ fontFamily: font, fontSize: 20, fontWeight: 800 }}>{match.home} vs {match.away}</h2>
              <p style={{ fontSize: 13, color: COLORS.gray, marginTop: 4 }}>{match.date} &middot; {match.venue}</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.gray, cursor: "pointer", padding: 8 }}>{Icons.close}</button>
          </div>
        </div>
        <div style={S.modalBody}>
          <p style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.gray, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Select Tier</p>
          {Object.entries(match.tickets).map(([tier, data]) => {
            const avail = data.total - data.sold;
            return (
              <div key={tier} style={S.tierSelect(selectedTier === tier)} onClick={() => avail > 0 && setSelectedTier(tier)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={S.ticketBadge(tier)}>{tier}</span>
                    <div style={{ marginTop: 8, fontFamily: font, fontSize: 22, fontWeight: 800 }}>PKR {data.price.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: avail > 0 ? COLORS.greenLight : COLORS.red, fontWeight: 600 }}>{avail > 0 ? `${avail} available` : "Sold Out"}</div>
                    <div style={{ fontSize: 11, color: COLORS.grayDark, marginTop: 4 }}>of {data.total} total</div>
                  </div>
                </div>
              </div>
            );
          })}
          {!wallet && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: `${COLORS.gold}08`, border: `1px solid ${COLORS.gold}30`, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: COLORS.gold, fontWeight: 600 }}>Connect your MetaMask wallet to purchase</p>
            </div>
          )}
          <button style={{ ...S.btnPrimary(!wallet || !selectedTier || buying), marginTop: 20 }} onClick={handleBuy} disabled={!wallet || !selectedTier || buying}>
            {buying ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span className="spinner" />
                {deployed ? "Confirming on WireFluid..." : "Simulating purchase..."}
              </span>
            ) : (
              `Buy ${selectedTier || "Ticket"} — PKR ${selectedTier ? match.tickets[selectedTier].price.toLocaleString() : "\u2014"}`
            )}
          </button>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: COLORS.grayDark, fontSize: 12 }}>
            {Icons.shield}
            <span>Secured by WireFluid Blockchain &middot; 5s Finality</span>
          </div>
        </div>
      </div>
    </div>
  );
}
