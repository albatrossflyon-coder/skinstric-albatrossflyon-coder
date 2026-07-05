export function DiamondIcon({ direction, active }: { direction: "left" | "right"; active: boolean }) {
  return (
    <div
      className={`w-6 h-6 border border-black rotate-45 flex items-center justify-center shrink-0 transition-transform duration-300 ${active ? "scale-125" : "scale-100"}`}
    >
      <span className="-rotate-45 text-[8px] leading-none">
        {direction === "left" ? "◀" : "▶"}
      </span>
    </div>
  );
}
