import { useState } from "react";
import { COLORS, S, Icons, font } from "../styles";
import { isContractDeployed } from "../contract";
import { verifyOwnership, markTicketAsUsed, handleBlockchainError } from "../blockchain";
import { wait } from "../mockData";

export default function VerifyPage({ showToast }) {
  const [tokenId, setTokenId] = useState("");
  const [walletAddr, setWalletAddr] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const deployed = isContractDeployed();

  const handleVerify = async () => {
    if (!tokenId || !walletAddr) return;
    setVerifying(true);
    setResult(null);
    try {
      if (deployed) {
        const valid = await verifyOwnership(parseInt(tokenId), walletAddr);
        setResult(valid);
      } else {
        await wait(1500);
        setResult(parseInt(tokenId) % 2 === 0);
      }
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
      setResult(false);
    }
    setVerifying(false);
  };

  const handleMarkUsed = async () => {
    try {
      if (deployed) {
        showToast("Marking ticket as used on-chain...");
        await markTicketAsUsed(parseInt(tokenId));
      } else {
        await wait(800);
      }
      setResult("used");
      showToast("Ticket marked as used!", "success");
    } catch (err) {
      showToast(handleBlockchainError(err), "error");
    }
  };

  return (
    <div style={{ ...S.page, maxWidth: 560, paddingTop: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: `${COLORS.greenLight}10`, border: `1px solid ${COLORS.greenLight}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>&#x1F50D;</div>
        <h1 style={{ ...S.sectionTitle, fontSize: 32 }}>Gate Verification</h1>
        <p style={{ color: COLORS.gray, fontSize: 15 }}>Verify ticket ownership at stadium entry</p>
      </div>
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28 }}>
        <label style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.gray, display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>TOKEN ID</label>
        <input type="text" value={tokenId} onChange={e => setTokenId(e.target.value)} placeholder="Enter ticket token ID" style={{ ...S.verifyInput, marginBottom: 20 }} />
        <label style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.gray, display: "block", marginBottom: 8, letterSpacing: "0.04em" }}>WALLET ADDRESS</label>
        <input type="text" value={walletAddr} onChange={e => setWalletAddr(e.target.value)} placeholder="0x..." style={{ ...S.verifyInput, marginBottom: 24 }} />
        <button style={S.btnPrimary(!tokenId || !walletAddr)} onClick={handleVerify} disabled={!tokenId || !walletAddr || verifying}>
          {verifying ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span className="spinner" />
              {deployed ? "Querying WireFluid..." : "Simulating verification..."}
            </span>
          ) : "Verify Ticket"}
        </button>
        {result !== null && (
          <div style={S.verifyResult(result === true || result === "used")}>
            {result === true || result === "used" ? Icons.check : Icons.x}
            <h3 style={{ fontFamily: font, fontSize: 24, fontWeight: 800, marginTop: 16, color: (result === true || result === "used") ? COLORS.greenLight : COLORS.red }}>
              {result === true ? "VALID TICKET" : result === "used" ? "TICKET USED" : "INVALID"}
            </h3>
            <p style={{ fontSize: 14, color: COLORS.gray, marginTop: 8 }}>
              {result === true ? "Ownership verified on WireFluid blockchain. Allow entry." : result === "used" ? "Ticket marked as used on-chain." : "Ticket does not belong to this wallet. Deny entry."}
            </p>
            {result === true && (
              <button style={{ ...S.btnPrimary(false), marginTop: 16, background: COLORS.greenLight }} onClick={handleMarkUsed}>
                Mark as Used
              </button>
            )}
            {result === "used" && (
              <div style={{ marginTop: 12, fontFamily: font, fontSize: 14, color: COLORS.greenLight, fontWeight: 700 }}>{"\u2713"} Ticket marked as used on-chain</div>
            )}
          </div>
        )}
      </div>
      <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: `${COLORS.gold}05`, border: `1px solid ${COLORS.gold}15`, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: COLORS.grayDark }}>This page is for stadium gate operators. No wallet connection required.</p>
      </div>
      <div style={{ marginTop: 12, padding: "16px 20px", borderRadius: 12, background: `${COLORS.greenLight}05`, border: `1px solid ${COLORS.greenLight}15`, textAlign: "left", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ minWidth: 20, marginTop: 1, color: COLORS.greenLight, opacity: 0.7 }}>{Icons.shield}</div>
        <p style={{ fontSize: 12, color: COLORS.gray, lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: COLORS.greenLight }}>Production flow:</span> Fan shows QR &rarr; Scanner reads wallet &rarr; WireFluid verifies instantly. This demo uses manual Token ID entry to simulate the same verification logic.
        </p>
      </div>
    </div>
  );
}
