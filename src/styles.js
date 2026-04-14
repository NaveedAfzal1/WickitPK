// ═══════════════════════════════════════════════════════════════
// PSL TrustTicket — Design System (Colors, Styles, Icons)
// ═══════════════════════════════════════════════════════════════

export const COLORS = {
  bg: "#07090d",
  bgCard: "#0c1018",
  bgCardHover: "#1a2332",
  border: "#1c2738",
  green: "#1a472a",
  greenLight: "#22c55e",
  greenGlow: "#22c55e33",
  gold: "#f97316",
  goldDim: "#c2570d",
  navy: "#0f172a",
  white: "#f8fafc",
  gray: "#94a3b8",
  grayDark: "#475569",
  red: "#ef4444",
  redGlow: "#ef444433",
};

export const TEAM_COLORS = {
  "Lahore Qalandars": { primary: "#22c55e", secondary: "#dc2626" },
  "Islamabad United": { primary: "#dc2626", secondary: "#fbbf24" },
  "Karachi Kings": { primary: "#1d4ed8", secondary: "#fbbf24" },
  "Multan Sultans": { primary: "#fbbf24", secondary: "#1d4ed8" },
  "Peshawar Zalmi": { primary: "#f59e0b", secondary: "#1c1c1c" },
  "Quetta Gladiators": { primary: "#7c3aed", secondary: "#fbbf24" },
  "Rawalpindi Pindiz": { primary: "#f97316", secondary: "#22c55e" },
  "Hyderabad Kingsmen": { primary: "#1c1c1c", secondary: "#8b5cf6" },
};

export const font = "'Sora', sans-serif";
export const fontBody = "'Plus Jakarta Sans', sans-serif";

export const S = {
  app: { fontFamily: fontBody, background: COLORS.bg, color: COLORS.white, minHeight: "100vh", position: "relative", overflow: "hidden" },
  bgGlow: { position: "fixed", top: "-50%", left: "-50%", width: "200%", height: "200%", background: `radial-gradient(ellipse at 20% 10%, #f9731608 0%, transparent 40%), radial-gradient(ellipse at 80% 10%, ${COLORS.greenLight}07 0%, transparent 40%), radial-gradient(ellipse at 50% 100%, ${COLORS.navy}80 0%, transparent 50%)`, pointerEvents: "none", zIndex: 0 },
  gridOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: `linear-gradient(${COLORS.border}15 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border}15 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0 },

  // Navbar
  nav: { position: "sticky", top: 0, zIndex: 50, background: `${COLORS.bg}e6`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px" },
  navInner: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: 72 },
  logo: { fontFamily: font, fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logoIcon: { width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.greenLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900 },
  navLinks: { display: "flex", gap: 4 },
  navLink: (active) => ({ fontFamily: font, fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase", padding: "8px 16px", borderRadius: 8, background: active ? `${COLORS.greenLight}15` : "transparent", color: active ? COLORS.greenLight : COLORS.gray, cursor: "pointer", transition: "all 0.2s", border: "none", outline: "none" }),
  walletBtn: (connected) => ({ fontFamily: font, fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10, border: connected ? `1px solid ${COLORS.greenLight}40` : `1px solid ${COLORS.gold}60`, background: connected ? `${COLORS.greenLight}10` : `linear-gradient(135deg, ${COLORS.gold}20, ${COLORS.gold}05)`, color: connected ? COLORS.greenLight : COLORS.gold, cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", gap: 8 }),

  // Page
  page: { position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" },
  sectionTitle: { fontFamily: font, fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, textTransform: "uppercase" },
  sectionSub: { color: COLORS.gray, fontSize: 15, marginBottom: 32, lineHeight: 1.6 },

  // Match cards
  matchGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 },
  matchCard: { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.3s", position: "relative" },
  matchCardHover: { borderColor: `${COLORS.greenLight}40`, transform: "translateY(-2px)", boxShadow: `0 8px 32px ${COLORS.greenGlow}` },
  matchHeader: (teamColor) => ({ padding: "20px 24px", background: `linear-gradient(135deg, ${teamColor}15, ${COLORS.bgCard})`, borderBottom: `1px solid ${COLORS.border}`, position: "relative" }),
  matchNum: { fontFamily: font, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.gold, marginBottom: 12 },
  matchTeams: { fontFamily: font, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3 },
  matchVs: { color: COLORS.grayDark, fontSize: 14, fontWeight: 400, margin: "0 6px" },
  matchMeta: { padding: "16px 24px", display: "flex", flexDirection: "column", gap: 8 },
  matchMetaRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.gray },
  matchTiers: { padding: "0 24px 20px", display: "flex", gap: 8 },
  tierBadge: (available) => ({ flex: 1, padding: "10px 12px", borderRadius: 10, background: available ? `${COLORS.greenLight}08` : `${COLORS.red}08`, border: `1px solid ${available ? COLORS.greenLight + "30" : COLORS.red + "30"}`, textAlign: "center" }),
  tierName: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.gray, marginBottom: 4, fontFamily: font },
  tierPrice: { fontSize: 16, fontWeight: 800, color: COLORS.white, fontFamily: font },
  tierAvail: (available) => ({ fontSize: 11, color: available ? COLORS.greenLight : COLORS.red, marginTop: 2 }),

  // Modal
  modal: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  modalContent: { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 20, maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { padding: "24px 28px", borderBottom: `1px solid ${COLORS.border}` },
  modalBody: { padding: "24px 28px" },

  // Tier selector
  tierSelect: (selected) => ({ padding: "16px", borderRadius: 12, border: `2px solid ${selected ? COLORS.greenLight : COLORS.border}`, background: selected ? `${COLORS.greenLight}08` : COLORS.bg, cursor: "pointer", transition: "all 0.2s", marginBottom: 8 }),

  // Buttons
  btnPrimary: (disabled) => ({ fontFamily: font, width: "100%", padding: "14px 24px", borderRadius: 12, border: "none", background: disabled ? COLORS.grayDark : `linear-gradient(135deg, ${COLORS.greenLight}, ${COLORS.green})`, color: disabled ? COLORS.gray : COLORS.white, fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.3s", letterSpacing: "0.01em" }),
  btnSecondary: { fontFamily: font, padding: "10px 20px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.white, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  btnGold: { fontFamily: font, padding: "10px 20px", borderRadius: 10, border: `1px solid ${COLORS.gold}40`, background: `${COLORS.gold}10`, color: COLORS.gold, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  btnDanger: { fontFamily: font, padding: "10px 20px", borderRadius: 10, border: `1px solid ${COLORS.red}40`, background: `${COLORS.red}10`, color: COLORS.red, fontSize: 13, fontWeight: 700, cursor: "pointer" },

  // Tickets
  ticketCard: { background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", transition: "all 0.3s" },
  ticketBadge: (tier) => { const c = tier === "VIP" ? COLORS.gold : tier === "Premium" ? "#a78bfa" : COLORS.greenLight; return { display: "inline-block", padding: "4px 12px", borderRadius: 20, background: `${c}15`, color: c, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: font }; },
  ticketStatus: (status) => { const c = status === "used" ? COLORS.red : status === "listed" ? COLORS.gold : COLORS.greenLight; return { display: "inline-block", padding: "4px 10px", borderRadius: 20, background: `${c}15`, color: c, fontSize: 11, fontWeight: 700, fontFamily: font }; },

  // Verify
  verifyInput: { width: "100%", padding: "14px 18px", borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.white, fontSize: 15, fontFamily: fontBody, outline: "none", transition: "border-color 0.2s" },
  verifyResult: (valid) => ({ marginTop: 24, padding: 32, borderRadius: 16, background: valid ? `${COLORS.greenLight}08` : `${COLORS.red}08`, border: `2px solid ${valid ? COLORS.greenLight : COLORS.red}`, textAlign: "center" }),

  // Toast
  toast: (type) => ({ position: "fixed", bottom: 24, right: 24, zIndex: 200, padding: "14px 24px", borderRadius: 12, background: type === "error" ? COLORS.red : COLORS.greenLight, color: type === "error" ? COLORS.white : COLORS.bg, fontWeight: 700, fontSize: 14, fontFamily: font, boxShadow: `0 8px 32px ${type === "error" ? COLORS.redGlow : COLORS.greenGlow}`, animation: "slideUp 0.3s ease-out" }),
};

// ─── ICONS ───
import { createElement as h } from "react";
const svg = (props, ...children) => h("svg", props, ...children);
const line = (props) => h("line", props);
const rect = (props) => h("rect", props);
const circle = (props) => h("circle", props);
const path = (props) => h("path", props);
const polygon = (props) => h("polygon", props);

export const Icons = {
  calendar: svg({ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }, rect({ x: 3, y: 4, width: 18, height: 18, rx: 2 }), line({ x1: 16, y1: 2, x2: 16, y2: 6 }), line({ x1: 8, y1: 2, x2: 8, y2: 6 }), line({ x1: 3, y1: 10, x2: 21, y2: 10 })),
  pin: svg({ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }, path({ d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" }), circle({ cx: 12, cy: 10, r: 3 })),
  clock: svg({ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }, circle({ cx: 12, cy: 12, r: 10 }), path({ d: "M12 6v6l4 2" })),
  wallet: svg({ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }, rect({ x: 2, y: 6, width: 20, height: 14, rx: 2 }), path({ d: "M2 10h20" }), circle({ cx: 17, cy: 14, r: 1 })),
  check: svg({ width: 48, height: 48, viewBox: "0 0 24 24", fill: "none", stroke: "#22c55e", strokeWidth: 2.5 }, path({ d: "M20 6L9 17l-5-5" })),
  x: svg({ width: 48, height: 48, viewBox: "0 0 24 24", fill: "none", stroke: "#ef4444", strokeWidth: 2.5 }, path({ d: "M18 6L6 18M6 6l12 12" })),
  shield: svg({ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }, path({ d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" })),
  tag: svg({ width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }, path({ d: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" }), circle({ cx: 7, cy: 7, r: 1 })),
  close: svg({ width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }, path({ d: "M18 6L6 18M6 6l12 12" })),
  link: svg({ width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 }, path({ d: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" })),
  star: svg({ width: 14, height: 14, viewBox: "0 0 24 24", fill: COLORS.gold, stroke: COLORS.gold, strokeWidth: 1 }, polygon({ points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" })),
};
