import { useState } from "react";
import { flushSync } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  User,
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

const ROLES = [
  { value: "STUDENT", label: "Student", icon: GraduationCap },
  { value: "TEACHER", label: "Teacher", icon: Users },
];

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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
      const userData = await register(name, email, password, role);
      redirectByRole(userData.role);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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
      {/* Brand panel on the left, following the role being signed up for */}
      <AuthBrandPanel
        headline={
          <>
            Welcome to
            <br />
            {role === "STUDENT" ? "student portal" : "teacher portal"}
          </>
        }
        subtext={
          role === "STUDENT"
            ? "Create your account and start taking smarter exams."
            : "Create your account and start managing smarter exams."
        }
      />

      {/* Form */}
      <div
        className="relative flex h-full flex-col overflow-hidden bg-app-bg px-6 py-6 md:order-first"
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

          {/* Mobile brand */}
          <div className="mb-8 md:hidden">
            <Logo variant="arc" className="text-xl text-primary" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            Create your account
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Join Examly to get started
          </p>

          <form onSubmit={handleSubmit} className="mt-6">

            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-primary"
            >
              Full Name
            </label>

            <div className="relative mt-1.5 mb-3">
              <User
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-4 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Email */}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-primary"
            >
              Email
            </label>

            <div className="relative mt-1.5 mb-3">
              <Mail
                size={17}
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
                className="w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-4 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-primary"
            >
              Password
            </label>

            <div className="relative mt-1.5 mb-3">
              <Lock
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-11 text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-secondary transition hover:bg-app-bg hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>

            {/* Role */}
            <fieldset className="mb-4">
              <legend className="text-sm font-medium text-text-primary">
                I am a...
              </legend>

              <div className="mt-1.5 grid grid-cols-2 gap-3">
                {ROLES.map(({ value, label, icon: Icon }) => {
                  const selected = role === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      aria-pressed={selected}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2 font-semibold transition ${
                        selected
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-text-secondary hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      <Icon size={17} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {loading && (
                <Loader2 size={17} className="animate-spin" />
              )}

              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="mt-5 text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                onClick={switchTo("/login")}
                className="font-semibold text-primary transition hover:text-primary-dark hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>

    </div>
  );
}

export default RegisterPage;