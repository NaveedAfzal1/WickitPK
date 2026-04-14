import { COLORS, S, Icons, font } from "../styles";

export default function ResaleSection({ listings, matches, wallet, onBuyResale }) {
  if (listings.length === 0) return null;
  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ ...S.sectionTitle, fontSize: 24, display: "flex", alignItems: "center", gap: 8 }}>
        {Icons.tag} Resale Marketplace
      </h2>
      <p style={{ ...S.sectionSub, marginBottom: 20 }}>Price-capped tickets from verified holders. Organizer gets 5% royalty.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {listings.map(l => {
          const match = matches.find(m => m.id === l.matchId);
          const faceVal = parseFloat(l.faceValueFormatted ?? l.faceValue ?? 0);
          const listVal = parseFloat(l.listingPriceFormatted ?? l.listPrice ?? 0);
          const savings = faceVal > 0 ? ((listVal / faceVal - 1) * 100).toFixed(0) : "0";
          const displayListPrice = l.listingPriceFormatted ?? String(l.listPrice ?? 0);
          const displayFaceValue = l.faceValueFormatted ?? String(l.faceValue ?? 0);
          return (
            <div key={l.tokenId} style={{ ...S.ticketCard, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <span style={S.ticketBadge(l.tier)}>{l.tier}</span>
                  <h3 style={{ fontFamily: font, fontSize: 16, fontWeight: 700, marginTop: 8 }}>
                    {match ? `${match.home} vs ${match.away}` : `Match #${l.matchId}`}
                  </h3>
                  <p style={{ fontSize: 12, color: COLORS.gray }}>{match?.date} &middot; Token #{l.tokenId}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: font, fontSize: 20, fontWeight: 800, color: COLORS.gold }}>{displayListPrice} WIRE</div>
                  <div style={{ fontSize: 11, color: COLORS.grayDark }}>Face: {displayFaceValue} WIRE</div>
                  <div style={{ fontSize: 11, color: COLORS.gold }}>+{savings}% markup</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btnGold, flex: 1 }} onClick={() => onBuyResale(l)}>Buy Resale</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: COLORS.grayDark }}>
                Seller: {l.sellerShort ?? l.seller} &middot; 5% royalty to organizer
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
