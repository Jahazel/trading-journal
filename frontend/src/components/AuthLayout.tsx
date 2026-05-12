type HeatCell = "n" | "g1" | "g2" | "l1" | "l2";

const heatmapData: HeatCell[][] = [
  ["n", "g2", "g1", "l1", "g2", "n", "n"],
  ["n", "g1", "g2", "g2", "g1", "n", "n"],
  ["n", "l2", "l1", "g1", "g2", "n", "n"],
  ["n", "g1", "l1", "g2", "g1", "n", "n"],
  ["n", "g2", "n", "g1", "l1", "n", "n"],
];

const cellFill: Record<HeatCell, string> = {
  g2: "#86EFAC",
  g1: "#D1FAE5",
  l1: "#FEE2E2",
  l2: "#FECACA",
  n: "#D8E0ED",
};

const MiniHeatmap = () => {
  const cellSize = 13;
  const gap = 3;
  const r = 3;
  const cols = 7;
  const rows = heatmapData.length;
  const w = cols * cellSize + (cols - 1) * gap;
  const h = rows * cellSize + (rows - 1) * gap;

  return (
    <div className="mt-auto pt-10">
      <p className="text-xs font-medium text-ink-muted mb-3 tracking-[0.01em] select-none">
        Recent activity
      </p>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
      >
        {heatmapData.map((week, row) =>
          week.map((type, col) => (
            <rect
              key={`${row}-${col}`}
              x={col * (cellSize + gap)}
              y={row * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={r}
              fill={cellFill[type]}
            />
          ))
        )}
      </svg>
    </div>
  );
};

export const BrandPanel = () => (
  <aside
    aria-label="Trading Journal"
    className="hidden md:flex md:w-[42%] flex-col bg-surface-sidebar border-r border-border px-12 py-10 sticky top-0 h-screen"
  >
    <div className="flex-1 flex flex-col justify-center">
      <span className="inline-block text-xs font-medium text-ink-muted tracking-[0.01em] mb-8 select-none">
        Trading Journal
      </span>
      <p className="text-[2.25rem] font-semibold text-ink-primary leading-[1.15] tracking-[-0.02em] mb-4 select-none">
        Your record,
        <br />
        honestly kept.
      </p>
      <p className="text-sm text-ink-secondary leading-[1.65] max-w-[30ch]">
        Log every trade and deliberate no-trade decision. Surface the patterns
        you'd otherwise miss.
      </p>
    </div>
    <MiniHeatmap />
  </aside>
);

export const MobileHeader = () => (
  <div className="md:hidden bg-surface-sidebar border-b border-border px-6 py-4">
    <span className="text-sm font-semibold text-ink-primary select-none">
      Journal
    </span>
  </div>
);

export const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
    <circle cx="8" cy="8" r="2.5" />
  </svg>
);

export const EyeOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
    <circle cx="8" cy="8" r="2.5" />
    <line x1="2.5" y1="13.5" x2="13.5" y2="2.5" />
  </svg>
);

export const AlertCircleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="mt-[1px] shrink-0"
  >
    <circle cx="7" cy="7" r="6" />
    <path d="M7 4.5v3" />
    <circle cx="7" cy="10" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const SpinnerIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    className="animate-spin"
  >
    <circle
      cx="7"
      cy="7"
      r="5.5"
      stroke="currentColor"
      strokeOpacity="0.3"
      strokeWidth="2"
    />
    <path
      d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
