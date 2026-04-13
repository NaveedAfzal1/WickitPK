import { useState, useCallback } from "react";
import { COLORS, TEAM_COLORS, S, Icons, font } from "../styles";

export default function CollectibleModal({ ticket, match, wallet, onClose }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const homeColor = TEAM_COLORS[match?.home]?.primary || COLORS.greenLight;
  const awayColor = TEAM_COLORS[match?.away]?.primary || COLORS.gold;

  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  }, []);

  const sparkles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random() * 3}s`,
    size: 2 + Math.random() * 4,
  }));

  const cardTransform = isHovering
    ? `perspective(800px) rotateY(${mousePos.x * 15}deg) rotateX(${-mousePos.y * 15}deg) scale(1.02)`
    : undefined;

  return (
    <div
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeInScale 0.4s ease-out", overflow: "hidden" }}
      onClick={onClose}
    >
      {sparkles.map(s => (
        <div
          key={s.id}
          className="sparkle-particle"
          style={{ position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size, background: Math.random() > 0.5 ? COLORS.gold : homeColor, borderRadius: "50%", boxShadow: `0 0 ${s.size * 2}px ${Math.random() > 0.5 ? COLORS.gold : homeColor}`, animationDelay: s.delay, animationDuration: s.duration, pointerEvents: "none" }}
        />
      ))}
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 24, right: 24, zIndex: 210, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 14px", cursor: "pointer", color: COLORS.white, fontFamily: font, fontSize: 13, fontWeight: 600, backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 8 }}
      >
        {Icons.close} Close
      </button>
      <div
        className="collectible-card"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => { setIsHovering(false); setMousePos({ x: 0, y: 0 }); }}
        onClick={e => e.stopPropagation()}
        style={{ width: 380, minHeight: 540, borderRadius: 24, position: "relative", cursor: "grab", transformStyle: "preserve-3d", ...(isHovering ? { transform: cardTransform, animationPlayState: "paused" } : {}) }}
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: `linear-gradient(135deg, ${homeColor}30 0%, ${COLORS.bg} 40%, ${COLORS.bgCard} 60%, ${awayColor}20 100%)`, border: `1px solid ${COLORS.gold}30`, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, transparent 20%, ${homeColor}08 30%, ${COLORS.gold}06 50%, ${awayColor}08 70%, transparent 80%)`, backgroundSize: "200% 200%", animation: "holographicShift 6s ease-in-out infinite" }} />
          <div className="collectible-shimmer" style={{ position: "absolute", top: 0, width: "60%", height: "100%", background: `linear-gradient(90deg, transparent, ${COLORS.gold}18, ${COLORS.white}12, ${COLORS.gold}18, transparent)`, transform: "skewX(-15deg)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.gold} 0px, ${COLORS.gold} 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, ${COLORS.gold} 0px, ${COLORS.gold} 1px, transparent 1px, transparent 20px)`, pointerEvents: "none" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, padding: "32px 28px", display: "flex", flexDirection: "column", minHeight: 540 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>&#x26A1;</div>
              <span style={{ fontFamily: font, fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em" }}>PSL <span style={{ color: COLORS.greenLight }}>TrustTicket</span></span>
            </div>
            <div style={{ padding: "4px 10px", borderRadius: 20, background: `${COLORS.gold}15`, border: `1px solid ${COLORS.gold}40` }}>
              <span style={{ fontFamily: font, fontSize: 10, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.08em" }}>COLLECTIBLE</span>
            </div>
          </div>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.12em", textTransform: "uppercase" }}>PSL 2026 &middot; Match {match?.matchNum}</span>
          </div>
          <div style={{ textAlign: "center", marginBottom: 20, padding: "20px 0" }}>
            <div style={{ fontFamily: font, fontSize: 28, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              <span style={{ color: homeColor }}>{match?.home}</span>
            </div>
            <div style={{ fontFamily: font, fontSize: 14, fontWeight: 400, color: COLORS.grayDark, margin: "8px 0", letterSpacing: "0.2em" }}>&mdash; VS &mdash;</div>
            <div style={{ fontFamily: font, fontSize: 28, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              <span style={{ color: awayColor }}>{match?.away}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 16, borderRadius: 14, background: `${COLORS.bg}80`, border: `1px solid ${COLORS.border}`, backdropFilter: "blur(4px)", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: COLORS.grayDark, fontFamily: font, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Date</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: font }}>{match?.date}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: COLORS.grayDark, fontFamily: font, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Time</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: font }}>{match?.time} PKT</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, color: COLORS.grayDark, fontFamily: font, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>Venue</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: font }}>{match?.venue}</div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span style={{ ...S.ticketBadge(ticket.tier), padding: "6px 20px", fontSize: 13, boxShadow: `0 0 20px ${ticket.tier === "VIP" ? COLORS.gold : COLORS.greenLight}20` }}>{ticket.tier} SECTION</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: `2px dashed ${COLORS.border}`, margin: "12px -28px", position: "relative" }}>
            <div style={{ position: "absolute", left: -8, top: -8, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.92)" }} />
            <div style={{ position: "absolute", right: -8, top: -8, width: 16, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.92)" }} />
          </div>
          <div style={{ paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div><div style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.gray }}>Token #{ticket.tokenId}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.gray }}>{wallet?.slice(0, 8)}...{wallet?.slice(-6)}</div></div>
            </div>
            <a href="#" onClick={e => e.preventDefault()} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: font, fontSize: 12, fontWeight: 600, color: COLORS.greenLight, textDecoration: "none", padding: "8px 0", opacity: 0.8 }}>
              View on WireScan Explorer {Icons.link}
            </a>
          </div>
        </div>
        <div className="collectible-stamp" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-20deg)", zIndex: 5, pointerEvents: "none" }}>
          <div style={{ fontFamily: font, fontSize: 42, fontWeight: 900, color: "transparent", WebkitTextStroke: `2px ${COLORS.gold}`, letterSpacing: "0.15em", textTransform: "uppercase", textShadow: `0 0 30px ${COLORS.gold}30`, opacity: 0.7, userSelect: "none" }}>
            ATTENDED
          </div>
        </div>
      </div>
    </div>
  );
}
