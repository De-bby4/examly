// Shared brand panel for the auth screens (login / register). It wears the brand
// primary rather than a neutral surface - it's an identity panel, so the text is
// always white and the decorative shapes are lighter tints of the same colour.
// Copy sits high, with soft decorative shapes in the background.
function AuthBrandPanel({ headline, subtext }) {
  return (
    <div
      className="relative hidden flex-col justify-between overflow-hidden bg-primary p-14 md:flex lg:p-20"
      style={{ viewTransitionName: "auth-brand" }}
    >
      {/* Soft, lighter abstract shapes */}
      <div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/30 blur-xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-20 -top-12 h-64 w-64 rounded-full bg-white/25 blur-xl"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-white/30 blur-xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-white/25 blur-xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mt-12 max-w-md">
        <h2 className="text-balance text-5xl font-extrabold leading-tight tracking-tight text-white">
          {headline}
        </h2>

        <p className="mt-5 text-pretty text-base text-white/80">{subtext}</p>
      </div>

      <p className="relative z-10 text-sm text-white/50">
        © 2026 Examly. All rights reserved.
      </p>
    </div>
  );
}

export default AuthBrandPanel;
