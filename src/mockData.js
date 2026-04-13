// ═══════════════════════════════════════════════════════════════
// PSL TrustTicket — Demo / Mock Data
// Shown when contract is not yet deployed.
// Once CONTRACT_ADDRESS is set, all of this is bypassed.
// ═══════════════════════════════════════════════════════════════

export const MATCHES = [
  { id: 1, home: "Lahore Qalandars", away: "Islamabad United", date: "March 26, 2026", time: "7:00 PM", venue: "Gaddafi Stadium, Lahore", matchNum: 1, resaleCap: 120, tickets: { General: { price: 800, total: 50, sold: 12 }, Premium: { price: 2000, total: 30, sold: 8 }, VIP: { price: 5000, total: 10, sold: 3 } } },
  { id: 2, home: "Karachi Kings", away: "Multan Sultans", date: "March 28, 2026", time: "7:00 PM", venue: "National Bank Stadium, Karachi", matchNum: 5, resaleCap: 120, tickets: { General: { price: 800, total: 50, sold: 30 }, Premium: { price: 2000, total: 30, sold: 20 }, VIP: { price: 5000, total: 10, sold: 8 } } },
  { id: 3, home: "Peshawar Zalmi", away: "Quetta Gladiators", date: "March 30, 2026", time: "3:00 PM", venue: "Rawalpindi Cricket Stadium", matchNum: 8, resaleCap: 115, tickets: { General: { price: 800, total: 50, sold: 5 }, Premium: { price: 2000, total: 30, sold: 2 }, VIP: { price: 5000, total: 10, sold: 0 } } },
  { id: 4, home: "Lahore Qalandars", away: "Karachi Kings", date: "April 2, 2026", time: "7:00 PM", venue: "Gaddafi Stadium, Lahore", matchNum: 12, resaleCap: 125, tickets: { General: { price: 800, total: 50, sold: 45 }, Premium: { price: 2000, total: 30, sold: 28 }, VIP: { price: 5000, total: 10, sold: 9 } } },
];

export const RESALE_LISTINGS = [
  { tokenId: 101, matchId: 1, tier: "Premium", faceValue: 2000, listPrice: 2400, seller: "0x7a3B...e4F2" },
  { tokenId: 102, matchId: 4, tier: "VIP", faceValue: 5000, listPrice: 6000, seller: "0x9c1D...a8B3" },
];

export const MOCK_MY_TICKETS = [
  { tokenId: 201, matchId: 1, tier: "Premium", faceValue: 2000, status: "active", listPrice: null },
  { tokenId: 202, matchId: 1, tier: "General", faceValue: 800, status: "listed", listPrice: 950 },
  { tokenId: 203, matchId: 4, tier: "VIP", faceValue: 5000, status: "active", listPrice: null },
  { tokenId: 204, matchId: 2, tier: "General", faceValue: 800, status: "used", listPrice: null },
  { tokenId: 205, matchId: 3, tier: "VIP", faceValue: 5000, status: "collectible", listPrice: null },
  { tokenId: 206, matchId: 1, tier: "VIP", faceValue: 5000, status: "collectible", listPrice: null },
];

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const mockTxHash = () =>
  "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
