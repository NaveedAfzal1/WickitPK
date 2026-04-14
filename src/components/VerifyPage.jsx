import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
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

  // QR Scanner state
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const html5QrRef = useRef(null);
  const [autoVerify, setAutoVerify] = useState(false);

  // Auto-trigger verify after QR scan fills in the fields
  useEffect(() => {
    if (autoVerify && tokenId && walletAddr) {
      setAutoVerify(false);
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoVerify, tokenId, walletAddr]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setScanError(null);
    setScanning(true);
    const html5Qr = new Html5Qrcode("qr-reader-container");
    html5QrRef.current = html5Qr;
    try {
      await html5Qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          handleQrSuccess(decodedText);
        },
        undefined
      );
    } catch {
      try { html5Qr.clear(); } catch {}
      html5QrRef.current = null;
      setScanError("Camera access denied or unavailable. Use manual entry below.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  const handleQrSuccess = async (text) => {
    await stopScanner();
    try {
      const data = JSON.parse(text);
      const { tokenId: scannedToken, wallet: scannedWallet, timestamp } = data;
      if (timestamp && Date.now() - Number(timestamp) > 300000) {
        setScanError("QR expired — please generate a new one from My Tickets.");
        return;
      }
      if (scannedToken !== undefined && scannedWallet) {
        setScanError(null);
        setTokenId(String(scannedToken));
        setWalletAddr(scannedWallet);
        setAutoVerify(true);
      } else {
        setScanError("Invalid QR code format.");
      }
    } catch {
      setScanError("Could not parse QR code — not a WickitPK ticket.");
    }
  };

  const handleVerify = async () => {
    if (!tokenId || !walletAddr) return;

    const parsedToken = parseInt(tokenId);
    if (!Number.isInteger(parsedToken) || parsedToken <= 0) {
      showToast("Invalid token ID — must be a positive integer.", "error");
      return;
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddr.trim())) {
      showToast("Invalid wallet address — must be a valid 0x address.", "error");
      return;
    }

    setVerifying(true);
    setResult(null);
    try {
      if (deployed) {
        const valid = await verifyOwnership(parsedToken, walletAddr.trim());
        setResult(valid);
      } else {
        await wait(1500);
        setResult(parsedToken % 2 === 0);
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

      {/* QR Scanner Section */}
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28, marginBottom: 16 }}>
        <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: COLORS.greenLight, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
          Scan Ticket QR
        </div>

        {!scanning ? (
          <button
            onClick={startScanner}
            style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: `1px solid ${COLORS.greenLight}40`, background: `${COLORS.greenLight}10`, color: COLORS.greenLight, fontFamily: font, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            <span style={{ fontSize: 18 }}>&#x1F4F7;</span>
            Open Camera &amp; Scan Ticket
          </button>
        ) : (
          <div>
            <div
              id="qr-reader-container"
              style={{ width: "100%", borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.greenLight}30` }}
            />
            <button
              onClick={stopScanner}
              style={{ width: "100%", marginTop: 12, padding: "10px 16px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: "none", color: COLORS.gray, fontFamily: font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Cancel Scan
            </button>
          </div>
        )}

        {scanError && (
          <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 10, background: `${COLORS.red}08`, border: `1px solid ${COLORS.red}30`, fontFamily: font, fontSize: 13, color: COLORS.red }}>
            {scanError}
          </div>
        )}

        {!scanning && !scanError && (
          <p style={{ marginTop: 12, fontFamily: font, fontSize: 12, color: COLORS.grayDark, textAlign: "center" }}>
            Points camera at the fan&apos;s QR code after purchase
          </p>
        )}
      </div>

      {/* Manual Input Form */}
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 28 }}>
        <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: COLORS.gray, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
          Manual Entry (Fallback)
        </div>
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

      {/* WireFluid IBC section */}
      <div style={{ marginTop: 16, padding: "20px 24px", borderRadius: 12, background: COLORS.bgCard, border: `1px solid ${COLORS.greenLight}30`, textAlign: "left", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ minWidth: 22, marginTop: 2, color: COLORS.greenLight }}>{Icons.shield}</div>
        <div>
          <div style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: COLORS.greenLight, marginBottom: 8, letterSpacing: "0.04em" }}>
            Why WireFluid?
          </div>
          <p style={{ fontSize: 13, color: COLORS.gray, lineHeight: 1.7, margin: 0 }}>
            Ticket verification at a stadium gate requires sub-5-second confirmation — you cannot tell 10,000 fans to wait for Ethereum finality. WireFluid delivers instant reorg-proof finality via CometBFT consensus. Gas per transaction is under 0.001 WIRE — affordable for every PSL fan. Phase 2: our contract will call WireFluid's <span style={{ color: COLORS.greenLight, fontFamily: "monospace" }}>ibcTransferPrecompile</span> directly from Solidity, making PSL collectibles natively queryable by 50+ IBC-connected Cosmos chains including Osmosis and Cosmos Hub. This is not just a ticketing platform for Pakistan — it is PSL fan identity infrastructure for the entire Cosmos ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}
