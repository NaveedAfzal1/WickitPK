import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { COLORS, S, Icons, font } from "../styles";

const MAX_RECIPIENTS = 12;

function isValidAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr.trim());
}

export default function BuyModal({ match, onClose, wallet, onPurchase, onGiftPurchase, deployed }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [buying, setBuying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchasedTokenId, setPurchasedTokenId] = useState(null);

  // QR code
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    if (success && purchasedTokenId && wallet) {
      const payload = JSON.stringify({ tokenId: purchasedTokenId, wallet, matchId: match.id, timestamp: Date.now() });
      QRCode.toDataURL(payload, { width: 160, margin: 1, color: { dark: "#0a0f1a", light: "#ffffff" } })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null));
    }
  }, [success, purchasedTokenId, wallet, match]);

  // Gift mode
  const [giftMode, setGiftMode] = useState(false);
  const [recipients, setRecipients] = useState([""]);
  const [giftProgress, setGiftProgress] = useState(null);
  const [giftDone, setGiftDone] = useState(false);
  const [giftError, setGiftError] = useState(null);

  const validRecipients = recipients.filter(r => isValidAddress(r));

  const addRecipient = () => {
    if (recipients.length < MAX_RECIPIENTS) setRecipients(prev => [...prev, ""]);
  };

  const removeRecipient = (i) => setRecipients(prev => prev.filter((_, idx) => idx !== i));

  const updateRecipient = (i, val) =>
    setRecipients(prev => prev.map((r, idx) => idx === i ? val : r));

  const handleBuy = async () => {
    if (!wallet || !selectedTier) return;
    setBuying(true);
    try {
      const tokenId = await onPurchase(match, selectedTier);
      setPurchasedTokenId(tokenId);
      setSuccess(true);
    } catch {
      // error handled by parent
    }
    setBuying(false);
  };

  const handleGift = async () => {
    if (!wallet || !selectedTier || validRecipients.length === 0 || giftProgress) return;
    setGiftError(null);
    setGiftProgress({ current: 0, total: validRecipients.length * 2, message: "Starting..." });
    try {
      await onGiftPurchase(match, selectedTier, validRecipients, (current, total, message) => {
        setGiftProgress({ current, total, message });
      });
      setGiftDone(true);
      setGiftProgress(null);
    } catch (err) {
      setGiftError(err?.message || "Gift purchase failed.");
      setGiftProgress(null);
    }
  };

  // ── Gift success screen ──
  if (giftDone) {
    return (
      <div style={S.modal} onClick={onClose}>
        <div style={{ ...S.modalContent, textAlign: "center", padding: 48 }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${COLORS.greenLight}15`, border: `2px solid ${COLORS.greenLight}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 32 }}>
            🎁
          </div>
          <h2 style={{ fontFamily: font, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Tickets Gifted!</h2>
          <p style={{ color: COLORS.gray, marginBottom: 24, fontSize: 14 }}>
            {validRecipients.length} {selectedTier} ticket{validRecipients.length !== 1 ? "s" : ""} sent to your family & friends.
          </p>
          <button style={{ ...S.btnPrimary(false), width: "auto", display: "inline-block", padding: "12px 32px" }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Self-purchase success screen ──
  if (success) {
    return (
      <div style={S.modal} onClick={onClose}>
        <div style={{ ...S.modalContent, textAlign: "center", padding: 48 }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${COLORS.greenLight}15`, border: `2px solid ${COLORS.greenLight}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            {Icons.check}
          </div>
          <h2 style={{ fontFamily: font, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Ticket Purchased!</h2>
          <p style={{ color: COLORS.gray, marginBottom: 8, fontSize: 14 }}>
            Your {selectedTier} ticket NFT has been minted to your wallet.
          </p>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: COLORS.bg, border: `1px solid ${COLORS.border}`, marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, color: COLORS.gray }}>Token ID: #{purchasedTokenId}</span>
            {Icons.link}
          </div>
          {/* QR Code */}
          <div style={{ margin: "0 auto 24px", width: 180, textAlign: "center" }}>
            <div style={{ padding: 12, background: COLORS.white, borderRadius: 12, display: "inline-block" }}>
              {qrDataUrl
                ? <img src={qrDataUrl} alt="Ticket QR Code" width={156} height={156} style={{ display: "block", borderRadius: 4 }} />
                : <div style={{ width: 156, height: 156, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12 }}>Generating...</div>
              }
            </div>
            <p style={{ fontFamily: font, fontSize: 12, fontWeight: 600, color: COLORS.gray, marginTop: 10, lineHeight: 1.4 }}>
              Your entry QR Code — show this at the stadium gate
            </p>
          </div>
          <button style={{ ...S.btnPrimary(false), width: "auto", display: "inline-block", padding: "12px 32px" }} onClick={onClose}>
            View My Tickets
          </button>
        </div>
      </div>
    );
  }

  // ── Main modal ──
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalContent} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.08em", marginBottom: 4 }}>MATCH {match.matchNum}</div>
              <h2 style={{ fontFamily: font, fontSize: 20, fontWeight: 800 }}>{match.home} vs {match.away}</h2>
              <p style={{ fontSize: 13, color: COLORS.gray, marginTop: 4 }}>{match.date} &middot; {match.venue}</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.gray, cursor: "pointer", padding: 8 }}>{Icons.close}</button>
          </div>
        </div>

        <div style={S.modalBody}>
          {/* Tier selector */}
          <p style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.gray, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>Select Tier</p>
          {Object.entries(match.tickets).map(([tier, data]) => {
            const avail = data.total - data.sold;
            return (
              <div key={tier} style={S.tierSelect(selectedTier === tier)} onClick={() => avail > 0 && setSelectedTier(tier)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={S.ticketBadge(tier)}>{tier}</span>
                    <div style={{ marginTop: 8, fontFamily: font, fontSize: 22, fontWeight: 800 }}>{data.price} WIRE</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: avail > 0 ? COLORS.greenLight : COLORS.red, fontWeight: 600 }}>{avail > 0 ? `${avail} available` : "Sold Out"}</div>
                    <div style={{ fontSize: 11, color: COLORS.grayDark, marginTop: 4 }}>of {data.total} total</div>
                  </div>
                </div>
              </div>
            );
          })}

          {!wallet && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: `${COLORS.gold}08`, border: `1px solid ${COLORS.gold}30`, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: COLORS.gold, fontWeight: 600 }}>Connect your MetaMask wallet to purchase</p>
            </div>
          )}

          {/* Buy for self */}
          <button style={{ ...S.btnPrimary(!wallet || !selectedTier || buying), marginTop: 20 }} onClick={handleBuy} disabled={!wallet || !selectedTier || buying}>
            {buying ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span className="spinner" />
                {deployed ? "Confirming on WireFluid..." : "Simulating purchase..."}
              </span>
            ) : (
              `Buy ${selectedTier || "Ticket"} — ${selectedTier ? match.tickets[selectedTier].price : "\u2014"} WIRE`
            )}
          </button>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: COLORS.grayDark, fontSize: 12 }}>
            {Icons.shield}
            <span>Secured by WireFluid Blockchain &middot; 5s Finality</span>
          </div>

          {/* ── Divider ── */}
          <div style={{ margin: "24px 0 0", borderTop: `1px solid ${COLORS.border}` }} />

          {/* ── Buy for Family & Friends toggle ── */}
          <button
            onClick={() => setGiftMode(m => !m)}
            style={{ width: "100%", marginTop: 16, padding: "12px 16px", borderRadius: 12, background: giftMode ? `${COLORS.gold}10` : COLORS.bg, border: `1px solid ${giftMode ? COLORS.gold + "50" : COLORS.border}`, color: COLORS.gold, fontFamily: font, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}
          >
            <span>🎁 Buy for Family &amp; Friends</span>
            <span style={{ fontSize: 11, color: COLORS.grayDark }}>{giftMode ? "▲ Hide" : "▼ Expand"}</span>
          </button>

          {giftMode && (
            <div style={{ marginTop: 12, padding: 16, borderRadius: 12, background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
              <p style={{ fontFamily: font, fontSize: 12, fontWeight: 600, color: COLORS.gray, marginBottom: 12, letterSpacing: "0.04em" }}>
                RECIPIENT WALLETS ({recipients.length}/{MAX_RECIPIENTS})
              </p>

              {/* Address rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recipients.map((addr, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      value={addr}
                      onChange={e => updateRecipient(i, e.target.value)}
                      placeholder={`Recipient ${i + 1} — 0x...`}
                      style={{ ...S.verifyInput, flex: 1, fontSize: 12, padding: "10px 12px", borderColor: addr && !isValidAddress(addr) ? COLORS.red + "80" : undefined }}
                    />
                    {recipients.length > 1 && (
                      <button
                        onClick={() => removeRecipient(i)}
                        style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "none", color: COLORS.gray, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add recipient */}
              {recipients.length < MAX_RECIPIENTS && (
                <button
                  onClick={addRecipient}
                  style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, border: `1px dashed ${COLORS.border}`, background: "none", color: COLORS.gray, fontFamily: font, fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}
                >
                  + Add Recipient
                </button>
              )}

              {/* Progress bar */}
              {giftProgress && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 6, borderRadius: 6, background: COLORS.border, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${COLORS.greenLight}, ${COLORS.gold})`, width: `${Math.round((giftProgress.current / giftProgress.total) * 100)}%`, transition: "width 0.4s ease" }} />
                  </div>
                  <p style={{ marginTop: 8, fontSize: 12, color: COLORS.gray, fontFamily: font }}>
                    {giftProgress.message} ({Math.round((giftProgress.current / giftProgress.total) * 100)}%)
                  </p>
                </div>
              )}

              {/* Error */}
              {giftError && (
                <p style={{ marginTop: 10, fontSize: 12, color: COLORS.red, fontFamily: font }}>{giftError}</p>
              )}

              {/* Gift info note */}
              {!giftProgress && (
                <p style={{ marginTop: 10, fontSize: 11, color: COLORS.grayDark, lineHeight: 1.5 }}>
                  Each recipient gets 1 {selectedTier || "ticket"} NFT transferred directly to their wallet. Requires {validRecipients.length > 0 ? validRecipients.length : "N"} on-chain tx{validRecipients.length !== 1 ? "s" : ""}.
                </p>
              )}

              {/* Buy & Gift button */}
              <button
                onClick={handleGift}
                disabled={!wallet || !selectedTier || validRecipients.length === 0 || !!giftProgress}
                style={{ ...S.btnPrimary(!wallet || !selectedTier || validRecipients.length === 0 || !!giftProgress), marginTop: 14, background: (!wallet || !selectedTier || validRecipients.length === 0 || !!giftProgress) ? undefined : `linear-gradient(135deg, ${COLORS.gold}, #f59e0b)`, color: (!wallet || !selectedTier || validRecipients.length === 0 || !!giftProgress) ? undefined : "#0a0f1a" }}
              >
                {giftProgress ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span className="spinner" style={{ borderTopColor: "#0a0f1a", borderColor: "rgba(0,0,0,0.2)" }} />
                    Gifting in progress...
                  </span>
                ) : (
                  `🎁 Buy & Gift ${validRecipients.length || 0} Ticket${validRecipients.length !== 1 ? "s" : ""}`
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
