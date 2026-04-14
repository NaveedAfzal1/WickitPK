import { useEffect, useRef } from "react";
import { COLORS, font, fontBody } from "../styles";
import { gsap } from "gsap";

export default function HeroBanner({ deployed }) {
  const containerRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow",  { y: 60, opacity: 0, duration: 0.6 })
        .from(".hero-line1",    { y: 60, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".hero-line2",    { y: 60, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".hero-line3",    { y: 60, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".hero-subtitle", { y: 40, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".hero-badges",   { y: 40, opacity: 0, duration: 0.6 }, "-=0.3");

      gsap.to(orb1Ref.current, { y: -20, repeat: -1, yoyo: true, duration: 4, ease: "sine.inOut" });
      gsap.to(orb2Ref.current, { y: -20, repeat: -1, yoyo: true, duration: 4, ease: "sine.inOut", delay: 2 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    { icon: "🔒", label: "UNFAKEABLE" },
    { icon: "💰", label: "ZERO SCALPING" },
    { icon: "🏆", label: "FOREVER YOURS" },
    { icon: "⚡", label: "5s FINALITY" },
  ];

  const tickerText = "UNFAKEABLE TICKETS · ZERO SCALPING · FOREVER COLLECTIBLES · BUILT ON WIREFLUID · PSL 2026 · RAWALPINDI PINDIZ · ";

  return (
    <div ref={containerRef} style={{ marginBottom: 40, padding: "60px 0 20px", position: "relative" }}>
      {/* Floating glow orbs */}
      <div ref={orb1Ref} style={{ position: "absolute", top: -40, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #f9731618 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div ref={orb2Ref} style={{ position: "absolute", top: 20, right: -60, width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.greenLight}12 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Eyebrow badge */}
        <div className="hero-eyebrow" style={{ marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 100, border: `1px solid ${COLORS.gold}50`, background: `${COLORS.gold}10` }}>
            <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.1em" }}>
              ⚡ {deployed ? "ENTANGLED 2026 · WIREFLUID BLOCKCHAIN" : "DEMO MODE · WIREFLUID BLOCKCHAIN"}
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="hero-line1" style={{ fontFamily: font, fontSize: 72, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em", textTransform: "uppercase", color: COLORS.white }}>
          UNFAKEABLE
        </div>
        <div className="hero-line2" style={{ fontFamily: font, fontSize: 72, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em", textTransform: "uppercase", color: COLORS.greenLight }}>
          CRICKET TICKETS.
        </div>
        <div className="hero-line3" style={{ fontFamily: font, fontSize: 56, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", textTransform: "uppercase", color: COLORS.gold, marginBottom: 24 }}>
          ON-CHAIN.
        </div>

        {/* Subtitle */}
        <p className="hero-subtitle" style={{ fontFamily: fontBody, fontSize: 15, color: COLORS.gray, maxWidth: 520, lineHeight: 1.6, marginBottom: 32 }}>
          Every ticket is an NFT on WireFluid blockchain — impossible to counterfeit, price-capped to prevent scalping, and yours forever as a digital collectible.
        </p>

        {/* Feature badges */}
        <div className="hero-badges" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 40 }}>
          {features.map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, background: COLORS.bgCard, border: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: COLORS.white, letterSpacing: "0.06em" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling ticker */}
      <div style={{ overflow: "hidden", borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: "10px 0", background: `${COLORS.bgCard}80` }}>
        <div className="ticker-track" style={{ display: "flex", whiteSpace: "nowrap" }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: COLORS.gray, letterSpacing: "0.1em", flexShrink: 0 }}>
              {tickerText}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
