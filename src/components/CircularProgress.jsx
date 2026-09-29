function CircularProgress({
  value,
  size = 104,
  strokeWidth = 10,
  color = "var(--color-primary)",
  marker,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  // Optional tick showing a reference point (e.g. the pass mark). The svg is
  // rotated -90 so angle 0 is 12 o'clock and angles run clockwise.
  const hasMarker = typeof marker === "number" && marker > 0 && marker < 100;
  const theta = hasMarker ? (marker / 100) * 2 * Math.PI : 0;
  const inner = radius - strokeWidth / 2 - 2;
  const outer = radius + strokeWidth / 2 + 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="drop-shadow-[0_0_6px_rgba(0,0,0,0.08)] transition-all duration-700 ease-out"
        />

        {hasMarker && (
          <line
            x1={size / 2 + inner * Math.cos(theta)}
            y1={size / 2 + inner * Math.sin(theta)}
            x2={size / 2 + outer * Math.cos(theta)}
            y2={size / 2 + outer * Math.sin(theta)}
            stroke="var(--color-text-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
      </svg>

      <span className="absolute text-2xl font-black text-text-primary">
        {Math.round(value)}%
      </span>
    </div>
  );
}

export default CircularProgress;
