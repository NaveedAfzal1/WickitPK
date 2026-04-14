import { COLORS, S, Icons, font } from "../styles";

export default function Navbar({ page, setPage, wallet, onConnect }) {
  return (
    <nav style={S.nav}>
      <div style={S.navInner}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={S.logo} onClick={() => setPage("browse")}>
            <div style={S.logoIcon}>&#x26A1;</div>
            <span>Wickit<span style={{ color: COLORS.greenLight }}>PK</span></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: `${COLORS.border}60`, border: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #06b6d4)" }} />
            <span style={{ fontFamily: font, fontSize: 10, fontWeight: 600, color: COLORS.gray, letterSpacing: "0.04em" }}>Powered by <span style={{ color: COLORS.white, fontWeight: 700 }}>WireFluid</span></span>
          </div>
        </div>
        <div style={S.navLinks}>
          {[
            ["browse", "Matches"],
            ["my-tickets", "My Tickets"],
            ["verify", "Verify"],
          ].map(([key, label]) => (
            <button key={key} style={S.navLink(page === key)} onClick={() => setPage(key)}>
              {label}
            </button>
          ))}
        </div>
        <button style={S.walletBtn(!!wallet)} onClick={onConnect}>
          {Icons.wallet}
          {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}
