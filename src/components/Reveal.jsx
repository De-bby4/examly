import useInView from "../hooks/useInView";

const DIRECTIONS = {
  up: "translate-y-8",
  down: "-translate-y-8",
  left: "-translate-x-8",
  right: "translate-x-8",
};

// Wraps content so it fades and slides in when scrolled into view. `delay` lets
// sibling items stagger; `direction` is the side it drifts in from.
function Reveal({ children, className = "", delay = 0, direction = "up" }) {
  const [ref, inView] = useInView();
  const hidden = DIRECTIONS[direction] ?? DIRECTIONS.up;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition duration-700 ease-out ${
        inView
          ? "translate-x-0 translate-y-0 opacity-100"
          : `opacity-0 ${hidden}`
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default Reveal;
