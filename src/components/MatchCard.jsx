import { useState } from "react";
import { COLORS, TEAM_COLORS, S, Icons, font } from "../styles";

export default function MatchCard({ match, onBuy, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const homeColor = TEAM_COLORS[match.home]?.primary || COLORS.greenLight;
  const isHot = Object.values(match.tickets).some(t => t.sold / t.total > 0.8);

  const cardStyle = {
    ...S.matchCard,
    borderLeft: `3px solid ${hovered ? homeColor : homeColor + "99"}`,
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
    boxShadow: hovered ? `0 8px 32px ${homeColor}20` : "none",
    borderColor: hovered ? `${homeColor}40` : COLORS.border,
    transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
    // CSS animation for entrance — no GSAP, no StrictMode issues
    animation: `cardIn 0.45s ease-out ${index * 0.09}s both`,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onBuy(match)}
    >
      {isHot && (
        <div style={{ position: "absolute", top: 16, right: 16, padding: "4px 10px", borderRadius: 20, background: `${COLORS.red}20`, border: `1px solid ${COLORS.red}40` }}>
          <span style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: COLORS.red, letterSpacing: "0.05em" }}>SELLING FAST</span>
        </div>
      )}
      <div style={S.matchHeader(homeColor)}>
        <div style={S.matchNum}>MATCH {match.matchNum} &middot; PSL 2026</div>
        <div style={{ ...S.matchTeams, fontSize: 22, fontWeight: 800 }}>
          <span style={{ color: homeColor }}>{match.home}</span>
          <span style={S.matchVs}>vs</span>
          <span>{match.away}</span>
        </div>
      </div>
      <div style={S.matchMeta}>
        <div style={S.matchMetaRow}>{Icons.calendar}<span>{match.date}</span></div>
        <div style={S.matchMetaRow}>{Icons.clock}<span>{match.time} PKT</span></div>
        <div style={S.matchMetaRow}>{Icons.pin}<span>{match.venue}</span></div>
        <div style={S.matchMetaRow}>{Icons.shield}<span>Resale cap: {match.resaleCap}% of face value</span></div>
      </div>
      <div style={S.matchTiers}>
        {Object.entries(match.tickets).map(([tier, data]) => {
          const avail = data.total - data.sold;
          return (
            <div key={tier} style={S.tierBadge(avail > 0)}>
              <div style={S.tierName}>{tier}</div>
              <div style={S.tierPrice}>{data.price} WIRE</div>
              <div style={S.tierAvail(avail > 0)}>{avail > 0 ? `${avail} left` : "Sold Out"}</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "12px 24px 16px", borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: homeColor, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "right" }}>
          BUY TICKETS →
        </div>
      </div>
    </div>
  );
}
