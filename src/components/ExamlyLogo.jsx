// Examly's logo: two crossed pencils forming the X of the wordmark. Drawn as
// an original vector (no image asset) so it stays crisp at any size and carries
// no watermark. The pencils keep the flat, bold-outlined look of the brand.
const INK = "#1E1B4B"; // outline + graphite, matches the brand ink
const YELLOW = "#F7C948"; // pencil body
const PINK = "#F8A5C0"; // eraser
const METAL = "#C7CBD4"; // ferrule
const WOOD = "#F3D9A4"; // sharpened wood

// One pencil, drawn upright (eraser top, tip bottom) and centred on the origin.
// The ferrule carries its ridge lines and the body a centre facet line, matching
// the original mark. Rotating a copy by +45 and -45 crosses them into the X.
function Pencil() {
  return (
    <g>
      <rect
        x="-11"
        y="-63"
        width="22"
        height="15"
        rx="5"
        fill={PINK}
        stroke={INK}
        strokeWidth="4"
      />
      <rect
        x="-11"
        y="-48"
        width="22"
        height="9"
        fill={METAL}
        stroke={INK}
        strokeWidth="4"
      />
      <line x1="-11" y1="-46" x2="11" y2="-46" stroke={INK} strokeWidth="2" />
      <line x1="-11" y1="-43.5" x2="11" y2="-43.5" stroke={INK} strokeWidth="2" />
      <line x1="-11" y1="-41" x2="11" y2="-41" stroke={INK} strokeWidth="2" />
      <rect
        x="-11"
        y="-39"
        width="22"
        height="83"
        rx="1"
        fill={YELLOW}
        stroke={INK}
        strokeWidth="4"
      />
      <path
        d="M-11 44 L11 44 L0 64 Z"
        fill={WOOD}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <line x1="0" y1="-39" x2="0" y2="44" stroke={INK} strokeWidth="2.5" />
      <path d="M-4.5 56.5 L4.5 56.5 L0 64 Z" fill={INK} />
    </g>
  );
}

export function ExamlyMark({ className, title = "Examly", decorative = false }) {
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      {...(decorative
        ? { "aria-hidden": "true" }
        : { role: "img", "aria-label": title })}
    >
      <g transform="translate(64 64)">
        <g transform="rotate(45)">
          <Pencil />
        </g>
        <g transform="rotate(-45)">
          <Pencil />
        </g>
      </g>
    </svg>
  );
}

// A single pencil, for contexts that need to animate one of them (the splash).
// "left" points down-left, "right" points down-right.
export function ExamlyPencil({ className, point = "left" }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-hidden="true">
      <g transform={`translate(64 64) rotate(${point === "left" ? 45 : -45})`}>
        <Pencil />
      </g>
    </svg>
  );
}

// Letters of the wordmark. The X is drawn as the crossed pencils, not a glyph.
const WORDMARK = ["E", "X", "A", "M", "L", "Y"];

// Sits each unit on a gentle upward arc: the middle lifts and the outer letters
// tilt outward, reading as one bent wordmark.
function arcTransform(index, count) {
  const center = (count - 1) / 2;
  const d = index - center;
  const lift = 1 - (d / center) ** 2; // 1 at the middle, 0 at the ends
  return `translateY(${(-lift * 0.3).toFixed(3)}em) rotate(${(d * 5.5).toFixed(2)}deg)`;
}

// The lockup, reading "EXAMLY" with the pencils as the X.
//   flat (default) - sits on a straight baseline, for navbars and small spots
//   arc            - bent onto an upward curve, for large lockups like the footer
function Logo({
  className = "",
  markClassName = "h-[1em] w-[1em] shrink-0",
  variant = "flat",
}) {
  if (variant === "arc") {
    return (
      <span
        role="img"
        aria-label="Examly"
        className={`inline-flex items-end font-display font-extrabold uppercase leading-none tracking-tight ${className}`}
      >
        {WORDMARK.map((letter, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="inline-block origin-bottom"
            style={{ transform: arcTransform(i, WORDMARK.length) }}
          >
            {letter === "X" ? (
              <ExamlyMark
                decorative
                className={`inline-block ${markClassName}`}
              />
            ) : (
              letter
            )}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label="Examly"
      className={`inline-flex items-center font-display font-extrabold uppercase tracking-tight ${className}`}
    >
      <span aria-hidden="true">E</span>
      <ExamlyMark
        decorative
        className={`mx-[0.1em] shrink-0 ${markClassName}`}
      />
      <span aria-hidden="true">amly</span>
    </span>
  );
}

export default Logo;
