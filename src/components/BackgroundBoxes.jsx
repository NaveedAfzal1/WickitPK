import { memo, useEffect } from "react";
import { COLORS } from "../styles";

const colors = [
  `${COLORS.greenLight}55`,
  `${COLORS.gold}44`,
  "rgba(125, 211, 252, 0.28)",
  "rgba(216, 180, 254, 0.28)",
  "rgba(147, 197, 253, 0.28)",
  "rgba(134, 239, 172, 0.28)",
  "rgba(249, 168, 212, 0.22)",
  "rgba(196, 181, 253, 0.28)",
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const rows = new Array(150).fill(0);
const cols = new Array(100).fill(0);

function BoxesCore() {
  useEffect(() => {
    let rafId = null;

    const handleMouseMove = (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        // elementsFromPoint (plural) returns ALL elements at that coordinate.
        // Chrome excludes pointer-events:none elements, so the parent must NOT
        // have pointer-events:none — cells inherit auto and ARE found here.
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const cell = elements.find((el) => el.dataset.boxCell);
        if (cell) {
          cell.style.backgroundColor = getRandomColor();
          setTimeout(() => { cell.style.backgroundColor = ""; }, 900);
        }
        rafId = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      style={{
        transform: "translate(-40%, -60%) skewX(-48deg) skewY(14deg) scale(0.675) translateZ(0)",
        position: "absolute",
        left: "25%",
        top: "-25%",
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 16,
        // NO pointerEvents: "none" here — Chrome excludes pointer-events:none
        // elements from elementsFromPoint, so cells would never be found.
        // Cells are at z-index:0 so they don't intercept page content clicks.
      }}
    >
      {rows.map((_, i) => (
        <div
          key={"row" + i}
          style={{
            width: 64,
            height: 32,
            borderLeft: `1px solid ${COLORS.border}`,
            position: "relative",
            flexShrink: 0,
          }}
        >
          {cols.map((_, j) => (
            <div
              key={"col" + j}
              data-box-cell="true"
              style={{
                width: 64,
                height: 32,
                borderRight: `1px solid ${COLORS.border}`,
                borderTop: `1px solid ${COLORS.border}`,
                position: "relative",
                transition: "background-color 0.3s ease",
              }}
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke={COLORS.border}
                  style={{
                    position: "absolute",
                    height: 24,
                    width: 40,
                    top: -14,
                    left: -22,
                    pointerEvents: "none",
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export const Boxes = memo(BoxesCore);
