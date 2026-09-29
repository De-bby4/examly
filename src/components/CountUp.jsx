import { useEffect, useState } from "react";
import useInView from "../hooks/useInView";

// Animates the numeric part of a value like "10K+" or "99%" up from zero the
// first time it scrolls into view. The suffix ("K+", "%", ...) is preserved.
function CountUp({ value, duration = 1600 }) {
  const [ref, inView] = useInView({ threshold: 0.4, rootMargin: "0px" });

  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : value;

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [display, setDisplay] = useState(prefersReduced ? target : 0);

  useEffect(() => {
    if (!inView || prefersReduced) return;

    let frame;
    let start;
    const tick = (now) => {
      if (start === undefined) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, prefersReduced, target, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default CountUp;
