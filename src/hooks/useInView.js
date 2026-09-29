import { useEffect, useRef, useState } from "react";

// Reveals an element once it scrolls into view. Starts "in view" when the user
// prefers reduced motion, so those users see content immediately, un-animated.
function useInView({ threshold = 0.15, rootMargin = "0px 0px -80px 0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold, rootMargin]);

  return [ref, inView];
}

export default useInView;
