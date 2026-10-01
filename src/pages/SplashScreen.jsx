import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExamlyPencil } from "../components/ExamlyLogo";
// One hit per bounce contact: the ground hops, the landing on the E, then the
// smaller in-place bounce that follows it.
import hopOne from "../assets/bounce.wav"; // 1st hop
import hopTwo from "../assets/bounce1.wav"; // 2nd hop
import landOnE from "../assets/bounce2.wav"; // lands on the E
import bounceInPlace from "../assets/bounce4.wav"; // bounces in place on the E
// Landing page art, warmed up while the splash is on screen.
import heroImg from "../assets/hero.jpeg";
import examImg from "../assets/exam1.jpeg";

// The logo is two crossed pencils. Each pencil is its own SVG so one can detach
// and write without needing to clip a single asset apart.
const MIN_FONT = 52; // px, floor for small phones
const MAX_FONT = 112; // px, design size - the letters sit level with the X mark

// The word is sized so its capitals match the crossed-pencil mark. Everything the
// animation needs (word width, writing baseline, where the X lands on the E) is
// derived from the font size, so one number drives the whole layout. At the
// design size the logo is ~2.86x the font plus 92px of fixed chrome, so the
// middle term keeps it inside the viewport on narrow screens.
const LOGO_VARS = {
  "--font": `clamp(${MIN_FONT}px, calc((100vw - 140px) / 2.863), ${MAX_FONT}px)`,
  "--word-w": "calc(var(--font) * 2.39)", // rendered width of "AMLY"
  "--e-offset": "calc(-1 * (var(--font) * 0.222 + 44px))", // X centred on the E
  "--e-ground": "calc(-1 * (var(--font) * 0.33 + 34.5px))", // X's ink on the E's top
  "--hop": "calc(var(--font) * -0.85)", // height of a ground hop
};

// The X's entrance differs by screen: phones get a single ground hop, larger
// screens keep the original two. Read once - a splash never resizes mid-play.
const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(max-width: 767px)").matches;

const SLOT = 80; // px, the square the crossed pencils live in

// The word is drawn as SVG text so a wide "pen" stroke can mask it - that is
// what makes the letters appear exactly as the pencil moves over them, while
// keeping the real font shapes. Coordinates below are the design size (the word
// at MAX_FONT); CSS scales the whole thing on smaller screens.
const DESIGN_W = 268; // px, word box width at MAX_FONT
const DESIGN_H = 112; // px, line box height at MAX_FONT
const BASELINE = 87; // px, text baseline inside the line box
const PEN_W = 34; // px, width of the pen stroke as it reveals the letters
const TIP_X = 11.7; // px, the writing pencil's tip inside its 80px box
const TIP_Y = 68.3;
const TIP_DIR = 135; // deg, direction the pencil points when untransformed
// Where the pen travels over A M L Y, in writing order. Widths were measured
// from the rendered word so each stroke lands on its letter.
const PEN = [
  { d: "M8 87 L35 19 L62 87", len: 146.3 }, // A: up the left leg, down the right
  { d: "M16 58 L54 58", len: 38 }, // A: crossbar
  { d: "M77 87 L77 19 L112 62 L148 19 L148 87", len: 246.8 }, // M
  { d: "M165 19 L165 87 L209 87", len: 112 }, // L
  { d: "M215 19 L238 52 L238 87", len: 75.2 }, // Y: left arm into the stem
  { d: "M260 19 L238 52", len: 40.2 }, // Y: right arm
];

const APPROACH_MS = 300; // pencil flies from the X to the first pen stroke
const DRAW_MS = 1100; // total time spent tracing the letters
const GAP_MS = 60; // pen lift between strokes
const RETURN_MS = 340; // pencil flies back into the X
const WRITE_TOTAL =
  APPROACH_MS + DRAW_MS + GAP_MS * (PEN.length - 1) + RETURN_MS;
const HOP_MS = 1350; // X hopping in from the left

const E_AT = 80;
const HOP_AT = 420;
// Landing on the E's top edge, 78% of the way through the hop.
const THUMP_AT = HOP_AT + Math.round(HOP_MS * 0.78);
// The smaller in-place bounce on the E that follows it: 93% on phones, where the
// single hop shifts the beats, 92% on larger screens.
const BOUNCE_AT = HOP_AT + Math.round(HOP_MS * (IS_MOBILE ? 0.93 : 0.92));
const LANDED_AT = HOP_AT + HOP_MS;
// Let the last bounce sound ring out and the X come fully to rest before the
// pencil starts, so the writing never steps on the tail.
const SETTLE_MS = 640;
const WRITE_AT = BOUNCE_AT + SETTLE_MS + 160;
const COMPLETE_AT = WRITE_AT + WRITE_TOTAL;
const LEAVE_AT = COMPLETE_AT + 700;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The bounce's ground contacts, and how long each sound may ring before the
// next one. Phones make a single ground hop, so three sounds; larger screens hop
// twice, so four. Exporters often leave silence in front of a hit, which would
// land it late, so each clip is trimmed to its first real sample at load.
const HITS = IS_MOBILE
  ? [
      { src: hopOne, ms: 640 }, // ground hop     -> room before landing on the E
      { src: landOnE, ms: 200 }, // lands on the E -> tight before the in-place bounce
      { src: bounceInPlace, ms: 640 }, // bounces in place - rings out before writing
    ]
  : [
      { src: hopOne, ms: 270 }, // 1st hop        -> 270ms to the next beat
      { src: hopTwo, ms: 450 }, // 2nd hop        -> 459ms
      { src: landOnE, ms: 180 }, // lands on the E -> 189ms, so keep it tight
      { src: bounceInPlace, ms: 640 }, // bounces in place - rings out before writing
    ];

// When each hit above fires.
const HIT_AT = IS_MOBILE
  ? [HOP_AT + Math.round(HOP_MS * 0.3), THUMP_AT, BOUNCE_AT]
  : [HOP_AT + 324, HOP_AT + 594, THUMP_AT, BOUNCE_AT];

const hitStart = (buffer) => {
  const data = buffer.getChannelData(0);
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const v = Math.abs(data[i]);
    if (v > peak) peak = v;
  }
  const threshold = peak * 0.02;
  for (let i = 0; i < data.length; i++) {
    if (Math.abs(data[i]) > threshold) return i / buffer.sampleRate;
  }
  return 0;
};

const SplashScreen = () => {
  const navigate = useNavigate();

  const [stage, setStage] = useState(() =>
    prefersReducedMotion() ? "complete" : "hidden"
  );
  const [thumped, setThumped] = useState(false);
  const audioRef = useRef(null);
  const hitsRef = useRef([]);
  const slotRef = useRef(null);
  const wordRef = useRef(null);
  const pencilRef = useRef(null);
  const penRefs = useRef([]);
  const writeRef = useRef(null);

  // Decode all four hits up front, so the first beat is never late.
  useEffect(() => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    audioRef.current = ctx;
    let cancelled = false;

    Promise.all(
      HITS.map((hit) =>
        fetch(hit.src)
          .then((r) => r.arrayBuffer())
          .then((b) => ctx.decodeAudioData(b))
          .then((buf) => ({ buf, offset: hitStart(buf), ms: hit.ms }))
          .catch(() => null)
      )
    ).then((loaded) => {
      if (cancelled) return;
      loaded.forEach((hit, i) => {
        if (hit) hitsRef.current[i] = hit;
      });
    });

    return () => {
      cancelled = true;
      if (ctx.close) ctx.close();
    };
  }, []);

  // Fires hit `index`. If the browser is blocking audio (no user gesture yet)
  // this is silently ignored - it never throws and never interrupts the animation.
  const playHit = (index) => {
    const ctx = audioRef.current;
    const hit = hitsRef.current[index];
    if (!ctx || !hit) return;
    if (ctx.state === "suspended") ctx.resume();
    try {
      const source = ctx.createBufferSource();
      source.buffer = hit.buf;
      const gain = ctx.createGain();
      gain.gain.value = 0.85;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(
        0,
        hit.offset,
        Math.max(0.05, Math.min(hit.ms / 1000, hit.buf.duration - hit.offset))
      );
    } catch {
      // Ignore audio errors
    }
  };

  // Pencil-on-paper scratch, synthesised from filtered noise so it needs no
  // extra audio file. Runs for the length of the writing pass.
  const playWriting = (duration) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const seconds = Math.max(0.2, duration / 1000);

    try {
      const frames = Math.floor(ctx.sampleRate * seconds);
      const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2200;
      filter.Q.value = 0.8;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.06);
      gain.gain.setValueAtTime(0.14, now + seconds - 0.18);
      gain.gain.linearRampToValueAtTime(0, now + seconds);

      // A light wobble, so it reads as a hand moving rather than flat hiss.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 17;
      const lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.05;
      lfo.connect(lfoDepth);
      lfoDepth.connect(gain.gain);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(now);
      lfo.stop(now + seconds);
      noise.start(now);
      noise.stop(now + seconds);
      writeRef.current = noise;
    } catch {
      // Ignore audio errors
    }
  };

  // Warm the next page's images while the animation plays, so landing feels instant.
  useEffect(() => {
    [heroImg, examImg].forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  // Drives the pen: each mask stroke reveals in turn, and the pencil rides that
  // same path with its tip leading, so the letters appear under the point.
  useEffect(() => {
    if (stage !== "writing") return;

    const slot = slotRef.current;
    const word = wordRef.current;
    const pencil = pencilRef.current;
    const pens = penRefs.current.filter(Boolean);
    if (!slot || !word || !pencil || pens.length !== PEN.length) return;

    const slotBox = slot.getBoundingClientRect();
    const wordBox = word.getBoundingClientRect();
    // Pen coordinates are design units; map them into the pencil's pixel space.
    const sx = wordBox.width / DESIGN_W;
    const sy = wordBox.height / DESIGN_H;
    const toSlot = (p) => ({
      x: wordBox.left - slotBox.left + p.x * sx,
      y: wordBox.top - slotBox.top + p.y * sy,
    });

    const lens = PEN.map((s, i) => pens[i].getTotalLength() || s.len);
    const total = lens.reduce((a, b) => a + b, 0);

    let acc = 0;
    const plan = PEN.map((s, i) => {
      const share = (lens[i] / total) * DRAW_MS;
      const seg = { i, len: lens[i], start: APPROACH_MS + acc, end: APPROACH_MS + acc + share };
      acc += share + (i < PEN.length - 1 ? GAP_MS : 0);
      return seg;
    });

    const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

    const pointAt = (seg, s) =>
      toSlot(pens[seg.i].getPointAtLength(Math.max(0, Math.min(seg.len, s))));
    const dirAt = (seg, s) => {
      const a = pointAt(seg, Math.max(0, s - 2));
      const b = pointAt(seg, Math.min(seg.len, s + 2));
      if (b.x === a.x && b.y === a.y) return TIP_DIR;
      return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    };

    const place = (x, y, dir) => {
      pencil.style.transform = `translate(${x - TIP_X}px, ${
        y - TIP_Y
      }px) rotate(${dir - TIP_DIR}deg)`;
    };
    const lerpTo = (ax, ay, aDir, bx, by, bDir, k, lift) => {
      let d = ((bDir - aDir + 540) % 360) - 180;
      place(
        ax + (bx - ax) * k,
        ay + (by - ay) * k - lift,
        aDir + d * k
      );
    };
    const rest = { x: TIP_X, y: TIP_Y, dir: TIP_DIR };

    const drawAt = (t) => {
      pens.forEach((path, i) => {
        const seg = plan[i];
        const p =
          t <= seg.start
            ? 0
            : t >= seg.end
            ? 1
            : (t - seg.start) / (seg.end - seg.start);
        path.style.strokeDashoffset = 1 - p;
      });

      const first = plan[0];
      const last = plan[plan.length - 1];

      // Flying out to the first stroke.
      if (t < APPROACH_MS) {
        const k = ease(t / APPROACH_MS);
        const a = pointAt(first, 0);
        lerpTo(rest.x, rest.y, rest.dir, a.x, a.y, dirAt(first, 0), k, 0);
        return;
      }

      // Flying back into the X.
      if (t > last.end) {
        const k = ease(Math.min(1, (t - last.end) / RETURN_MS));
        const z = pointAt(last, last.len);
        lerpTo(z.x, z.y, dirAt(last, last.len), rest.x, rest.y, rest.dir, k, 0);
        return;
      }

      // On a stroke.
      const active = plan.find((s) => t >= s.start && t <= s.end);
      if (active) {
        const s = ((t - active.start) / (active.end - active.start)) * active.len;
        const p = pointAt(active, s);
        place(p.x, p.y, dirAt(active, s));
        return;
      }

      // Pen lift between two strokes.
      const prev = [...plan].reverse().find((s) => s.end <= t);
      const next = plan.find((s) => s.start >= t);
      if (!prev || !next) return;
      const k = ease(Math.min(1, (t - prev.end) / GAP_MS));
      const a = pointAt(prev, prev.len);
      const b = pointAt(next, 0);
      lerpTo(a.x, a.y, dirAt(prev, prev.len), b.x, b.y, dirAt(next, 0), k, Math.sin(Math.PI * k) * 14);
    };

    let raf = 0;
    const startedAt = performance.now();
    const tick = (now) => {
      const t = now - startedAt;
      if (t >= WRITE_TOTAL) {
        drawAt(WRITE_TOTAL);
        pencil.style.transform = "";
        return;
      }
      drawAt(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      pencil.style.transform = "";
    };
  }, [stage]);

  // Let people tap, click or press a key to go straight on.
  useEffect(() => {
    const skip = () => navigate("/landing");

    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [navigate]);

  useEffect(() => {
    // Respect reduced-motion: the finished logo is already on screen, so just move on.
    if (prefersReducedMotion()) {
      const only = setTimeout(() => navigate("/landing"), 500);
      return () => clearTimeout(only);
    }

    const timers = [
      // E appears
      setTimeout(() => setStage("e"), E_AT),

      // X starts hopping in from the left
      setTimeout(() => setStage("x-hop"), HOP_AT),

      // A hit on each of the bounce's contacts.
      ...HIT_AT.map((at, i) => setTimeout(() => playHit(i), at)),

      // X lands on the top of the E, and the E takes the impact
      setTimeout(() => setThumped(true), THUMP_AT),

      // X has landed on the E and settled beside it
      setTimeout(() => setStage("landed"), LANDED_AT),

      // The pencil traces the letters, then returns into the X
      setTimeout(() => setStage("writing"), WRITE_AT),

      // The scratch of the pencil on paper, once the tip reaches the first letter
      setTimeout(
        () => playWriting(DRAW_MS + GAP_MS * (PEN.length - 1)),
        WRITE_AT + APPROACH_MS
      ),

      // The pencil is back in place
      setTimeout(() => setStage("complete"), COMPLETE_AT),

      // Navigate
      setTimeout(() => navigate("/landing"), LEAVE_AT),
    ];

    return () => {
      timers.forEach(clearTimeout);
      if (writeRef.current) {
        try {
          writeRef.current.stop();
        } catch {
          // already finished
        }
      }
    };
  }, [navigate]);

  const reducedMotion = prefersReducedMotion();
  const attached =
    stage === "landed" || stage === "writing" || stage === "complete";

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap');

          .examly-font {
            font-family: 'Baloo 2', sans-serif;
          }

          /* larger screens: two ground hops, then the leap onto the E */
          @keyframes pencilHop {
            0% {
              transform: translate(-46vw, 0) rotate(-25deg);
              opacity: 0;
            }

            6% {
              opacity: 1;
            }

            /* hop 1 */
            14% {
              transform: translate(-34vw, var(--hop)) rotate(-15deg);
              animation-timing-function: ease-in;
            }

            24% {
              transform: translate(-30vw, 0) rotate(12deg);
              animation-timing-function: ease-out;
            }

            /* hop 2 */
            34% {
              transform: translate(-30vw, var(--hop)) rotate(-10deg);
              animation-timing-function: ease-in;
            }

            44% {
              transform: translate(-17vw, 0) rotate(10deg);
              animation-timing-function: ease-out;
            }

            /* the leap up onto the E */
            56% {
              transform: translate(-11.5vw, calc(var(--e-ground) - 135px)) rotate(6deg) scale(1);
              animation-timing-function: ease-in;
            }

            68% {
              transform: translate(var(--e-offset), calc(var(--e-ground) - 136px)) rotate(2deg);
              animation-timing-function: ease-in;
            }

            /* SQUASH on the top of the E */
            78% {
              transform: translate(var(--e-offset), var(--e-ground)) rotate(-4deg) scale(1.16, 0.82);
              animation-timing-function: ease-out;
            }

            /* STRETCH as it springs back up */
            85% {
              transform: translate(var(--e-offset), calc(var(--e-ground) - 80px)) rotate(4deg) scale(0.94, 1.07);
              animation-timing-function: ease-in;
            }

            /* second, smaller bounce on the E */
            92% {
              transform: translate(var(--e-offset), var(--e-ground)) rotate(-2deg) scale(1.07, 0.93);
              animation-timing-function: ease-out;
            }

            100% {
              transform: translate(0, 0) rotate(0deg) scale(1);
              opacity: 1;
            }
          }

          /* phones: a single ground hop, then the leap onto the E */
          @keyframes pencilHopMobile {
            0% {
              transform: translate(-46vw, 0) rotate(-25deg);
              opacity: 0;
            }

            6% {
              opacity: 1;
            }

            /* the one ground hop */
            18% {
              transform: translate(-33vw, var(--hop)) rotate(-15deg);
              animation-timing-function: ease-in;
            }

            30% {
              transform: translate(-22vw, 0) rotate(12deg);
              animation-timing-function: ease-out;
            }

            /* the leap up onto the E */
            58% {
              transform: translate(-13vw, calc(var(--e-ground) - 135px)) rotate(6deg) scale(1);
              animation-timing-function: ease-in;
            }

            70% {
              transform: translate(var(--e-offset), calc(var(--e-ground) - 136px)) rotate(2deg);
              animation-timing-function: ease-in;
            }

            /* SQUASH on the top of the E */
            78% {
              transform: translate(var(--e-offset), var(--e-ground)) rotate(-4deg) scale(1.16, 0.82);
              animation-timing-function: ease-out;
            }

            /* STRETCH as it springs back up */
            86% {
              transform: translate(var(--e-offset), calc(var(--e-ground) - 80px)) rotate(4deg) scale(0.94, 1.07);
              animation-timing-function: ease-in;
            }

            /* the smaller bounce on the E */
            93% {
              transform: translate(var(--e-offset), var(--e-ground)) rotate(-2deg) scale(1.07, 0.93);
              animation-timing-function: ease-out;
            }

            100% {
              transform: translate(0, 0) rotate(0deg) scale(1);
              opacity: 1;
            }
          }

          /* the E takes the hit: pressed down, then wobbles back */
          @keyframes eReact {
            0% {
              transform: translateY(0) scale(1, 1);
            }

            18% {
              transform: translateY(calc(var(--font) * 0.07)) scale(1.07, 0.87);
            }

            46% {
              transform: translateY(calc(var(--font) * -0.027)) scale(0.97, 1.05);
            }

            70% {
              transform: translateY(calc(var(--font) * 0.01)) scale(1.02, 0.98);
            }

            100% {
              transform: translateY(0) scale(1, 1);
            }
          }

          /* ground shadow the X hops along: it stays put while the X rises,
             shrinking and fading with height, and spreads on each landing.
             Larger screens: two ground contacts. */
          @keyframes xShadow {
            0% {
              transform: translate(-46vw, 0) scale(0.5, 0.7);
              opacity: 0;
            }

            6% {
              transform: translate(-40vw, 0) scale(0.6, 0.75);
              opacity: 0.14;
            }

            14% {
              transform: translate(-34vw, 0) scale(0.62, 0.75);
              opacity: 0.16;
              animation-timing-function: ease-in;
            }

            24% {
              transform: translate(-30vw, 0) scale(1.24, 0.72);
              opacity: 0.46;
              animation-timing-function: ease-out;
            }

            34% {
              transform: translate(-30vw, 0) scale(0.62, 0.75);
              opacity: 0.16;
              animation-timing-function: ease-in;
            }

            44% {
              transform: translate(-17vw, 0) scale(1.24, 0.72);
              opacity: 0.46;
              animation-timing-function: ease-out;
            }

            56% {
              transform: translate(-11.5vw, 0) scale(0.35, 0.6);
              opacity: 0.06;
              animation-timing-function: ease-out;
            }

            68% {
              transform: translate(var(--e-offset), 0) scale(0.35, 0.6);
              opacity: 0.06;
            }

            78% {
              transform: translate(var(--e-offset), 0) scale(0.5, 0.68);
              opacity: 0.12;
            }

            85% {
              transform: translate(var(--e-offset), 0) scale(0.36, 0.6);
              opacity: 0.07;
            }

            92% {
              transform: translate(var(--e-offset), 0) scale(0.5, 0.68);
              opacity: 0.12;
            }

            100% {
              transform: translate(0, 0) scale(1, 1);
              opacity: 0.45;
            }
          }

          /* phones: a single ground contact. */
          @keyframes xShadowMobile {
            0% {
              transform: translate(-46vw, 0) scale(0.5, 0.7);
              opacity: 0;
            }

            6% {
              transform: translate(-40vw, 0) scale(0.6, 0.75);
              opacity: 0.14;
            }

            18% {
              transform: translate(-33vw, 0) scale(0.62, 0.75);
              opacity: 0.16;
              animation-timing-function: ease-in;
            }

            30% {
              transform: translate(-22vw, 0) scale(1.24, 0.72);
              opacity: 0.46;
              animation-timing-function: ease-out;
            }

            58% {
              transform: translate(-13vw, 0) scale(0.35, 0.6);
              opacity: 0.06;
              animation-timing-function: ease-out;
            }

            70% {
              transform: translate(var(--e-offset), 0) scale(0.35, 0.6);
              opacity: 0.06;
            }

            78% {
              transform: translate(var(--e-offset), 0) scale(0.5, 0.68);
              opacity: 0.12;
            }

            86% {
              transform: translate(var(--e-offset), 0) scale(0.36, 0.6);
              opacity: 0.07;
            }

            93% {
              transform: translate(var(--e-offset), 0) scale(0.5, 0.68);
              opacity: 0.12;
            }

            100% {
              transform: translate(0, 0) scale(1, 1);
              opacity: 0.45;
            }
          }

          /* jelly wobble as the X settles into its resting place: the squash
             and stretch die away over three diminishing oscillations */
          @keyframes landWobble {
            0% {
              transform: translateY(0) scale(1, 1);
              animation-timing-function: cubic-bezier(0.2, 0.85, 0.4, 1);
            }

            14% {
              transform: translateY(7px) scale(1.2, 0.78);
              animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
            }

            34% {
              transform: translateY(-5px) scale(0.88, 1.14);
              animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
            }

            54% {
              transform: translateY(3px) scale(1.11, 0.89);
              animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
            }

            71% {
              transform: translateY(-2px) scale(0.95, 1.06);
              animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
            }

            86% {
              transform: translateY(1px) scale(1.04, 0.96);
              animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
            }

            100% {
              transform: translateY(0) scale(1, 1);
            }
          }
        `}
      </style>

      <div
        className="flex min-h-screen items-center justify-center overflow-hidden bg-lavender"
        style={LOGO_VARS}
      >
        <div className="examly-font flex items-center">

          {/* E - takes the hit when the X lands on it */}
          <span
            className={`
              font-extrabold tracking-tight text-primary
              transition-all duration-500 ease-out
              ${
                stage === "hidden"
                  ? "-translate-y-10 scale-75 opacity-0"
                  : "translate-y-0 scale-100 opacity-100"
              }
            `}
            style={{
              fontSize: "var(--font)",
              lineHeight: 1,
              animation:
                thumped && !reducedMotion
                  ? "eReact 520ms ease-out forwards"
                  : "none",
            }}
          >
            E
          </span>

          {/* Crossed Pencil X - z-10 keeps the pencils in front of the word */}
          <div
            ref={slotRef}
            className="relative z-10 ml-1 shrink-0"
            style={{
              width: SLOT,
              height: SLOT,
              opacity: stage === "hidden" || stage === "e" ? 0 : 1,
            }}
          >
            {/* ground shadow that travels with the X (drawn under it) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              style={{
                top: "calc(50% + var(--font) * 0.36)",
                left: "50%",
                width: "calc(var(--font) * 0.62)",
                height: "calc(var(--font) * 0.09)",
                marginLeft: "calc(var(--font) * -0.31)",
                marginTop: "calc(var(--font) * -0.045)",
                background: "#0F0E28",
                filter: "blur(calc(var(--font) * 0.045))",
                opacity: 0.45,
                animation: reducedMotion
                  ? "none"
                  : stage === "x-hop"
                  ? `${IS_MOBILE ? "xShadowMobile" : "xShadow"} ${HOP_MS}ms cubic-bezier(0.25, 0.8, 0.25, 1) forwards`
                  : "none",
              }}
            />

            {/* the crossed pencils hop together, above the shadow */}
            <div
              className="absolute inset-0"
              style={{
                animation: reducedMotion
                  ? "none"
                  : stage === "x-hop"
                  ? `${IS_MOBILE ? "pencilHopMobile" : "pencilHop"} ${HOP_MS}ms cubic-bezier(0.25, 0.8, 0.25, 1) forwards`
                  : attached
                  ? "landWobble 650ms cubic-bezier(0.4, 0, 0.6, 1) forwards"
                  : "none",
              }}
            >

            {/* The pencil that lays flat and writes (drawn first, so the
                other pencil still crosses over it like the original logo) */}
            <div
              ref={pencilRef}
              className="absolute inset-0"
              style={{ transformOrigin: `${TIP_X}px ${TIP_Y}px` }}
            >
              <ExamlyPencil point="left" className="h-full w-full" />
            </div>

            {/* The pencil that stays behind */}
            <ExamlyPencil
              point="right"
              className="absolute inset-0 h-full w-full"
            />
            </div>
          </div>

          {/* AMLY, drawn as SVG text and masked by a wide pen stroke that grows
              along the writing path - so each letter appears under the pencil's
              point while the real font shapes are left untouched. */}
          <svg
            ref={wordRef}
            viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
            className="shrink-0 text-primary"
            style={{
              marginLeft: 8,
              width: "var(--word-w)",
              height: "var(--font)",
              overflow: "visible",
            }}
            role="img"
            aria-label="AMLY"
          >
            <defs>
              <mask
                id="examly-pen"
                maskUnits="userSpaceOnUse"
                x={-20}
                y={-20}
                width={DESIGN_W + 40}
                height={DESIGN_H + 40}
              >
                {PEN.map((pen, i) => (
                  <path
                    key={pen.d}
                    ref={(el) => {
                      penRefs.current[i] = el;
                    }}
                    d={pen.d}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={PEN_W}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray={1}
                    strokeDashoffset={1}
                  />
                ))}
              </mask>
            </defs>

            <text
              x="0"
              y={BASELINE}
              {...(reducedMotion || stage === "complete"
                ? {}
                : { mask: "url(#examly-pen)" })}
              fill="currentColor"
              fontSize={MAX_FONT}
              fontWeight={800}
              letterSpacing="-0.025em"
              fontFamily="'Baloo 2', sans-serif"
            >
              AMLY
            </text>
          </svg>

        </div>
      </div>
    </>
  );
};

export default SplashScreen;
