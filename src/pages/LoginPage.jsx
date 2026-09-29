import { useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import AuthBrandPanel from "../components/AuthBrandPanel";
import Logo from "../components/ExamlyLogo";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Drives the login <-> register swap with the native View Transitions API.
  // React Router's own `viewTransition` prop needs the data router, so we call
  // the API directly and flush the route change inside the transition.
  const switchTo = (to) => (event) => {
    if (typeof document.startViewTransition !== "function") return;

    event.preventDefault();
    document.startViewTransition(() => {
      flushSync(() => navigate(to));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await login(email, password);
      redirectByRole(userData.role);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === "TEACHER") navigate("/teacher/dashboard");
    else if (role === "ADMIN") navigate("/admin/dashboard");
    else navigate("/student/dashboard");
  };

  return (
    <div className="grid h-screen overflow-hidden md:grid-cols-2">
      {/* Brand panel on the left, form on the right - matching the register */}
      <AuthBrandPanel
        headline={
          <>
            Pick up right
            <br />
            where you left off.
          </>
        }
        subtext="Log in to see your upcoming exams, track your progress, and finish any attempt you haven't submitted yet."
      />

      {/* Form */}
      <div
        className="relative flex h-full flex-col overflow-y-auto bg-app-bg px-6 py-12"
        style={{ viewTransitionName: "auth-form" }}
      >
        <Link
          to="/landing"
          aria-label="Back to home"
          className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-primary/15 hover:text-primary"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>

        <div className="mx-auto my-auto w-full max-w-sm">
          {/* Brand, only where the panel is hidden */}
          <div className="mb-10 md:hidden">
            <Logo variant="arc" className="text-xl text-primary" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Log in to continue to Examly
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </div>
            )}

            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-primary"
            >
              Email
            </label>
            <div className="relative mt-1.5 mb-4">
              <Mail
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-primary"
            >
              Password
            </label>
            <div className="relative mt-1.5 mb-6">
              <Lock
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-11 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition hover:bg-app-bg hover:text-primary"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {loading && (
                <Loader2 size={17} className="animate-spin" aria-hidden="true" />
              )}
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Don't have an account?{" "}
              <Link
                to="/register"
                onClick={switchTo("/register")}
                className="font-semibold text-primary transition hover:text-primary-dark hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
