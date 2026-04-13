import { S, COLORS, font } from "../styles";

export default function HeroBanner({ deployed }) {
  return (
    <div style={{ marginBottom: 40, padding: "40px 0 20px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: "6px 14px", borderRadius: 20, background: `${COLORS.greenLight}15`, border: `1px solid ${COLORS.greenLight}30` }}>
          <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: COLORS.greenLight, letterSpacing: "0.05em" }}>
            {deployed ? "LIVE ON WIREFLUID" : "DEMO MODE"}
          </span>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 20, background: `${COLORS.gold}15`, border: `1px solid ${COLORS.gold}30` }}>
          <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.05em" }}>PSL 2026</span>
        </div>
      </div>
      <h1 style={{ ...S.sectionTitle, fontSize: 44, lineHeight: 1.1, maxWidth: 600 }}>
        Unfakeable Cricket Tickets.{" "}
        <span style={{ color: COLORS.greenLight }}>On-Chain.</span>
      </h1>
      <p style={{ ...S.sectionSub, maxWidth: 520, marginBottom: 0 }}>
        Every ticket is an NFT on WireFluid blockchain — impossible to counterfeit, price-capped to prevent scalping, and yours forever as a digital collectible.
      </p>
    </div>
  );
}
