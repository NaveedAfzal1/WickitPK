import { useState } from "react";
import { COLORS, TEAM_COLORS, S, Icons, font } from "../styles";

export default function MatchCard({ match, onBuy }) {
  const [hovered, setHovered] = useState(false);
  const homeColor = TEAM_COLORS[match.home]?.primary || COLORS.greenLight;
  const isHot = Object.values(match.tickets).some(t => t.sold / t.total > 0.8);

  return (
    <div
      style={{ ...S.matchCard, ...(hovered ? S.matchCardHover : {}) }}
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
        <div style={S.matchTeams}>
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
              <div style={S.tierPrice}>PKR {data.price.toLocaleString()}</div>
              <div style={S.tierAvail(avail > 0)}>{avail > 0 ? `${avail} left` : "Sold Out"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
