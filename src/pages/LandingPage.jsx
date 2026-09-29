import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  BarChart3,
  Flag,
  Users,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import exam1 from "../assets/exam1.jpeg";
import avatar from "../assets/avatar-cutout.png";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import Logo from "../components/ExamlyLogo";
import ExamCardMock from "../components/ExamCardMock";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#results", label: "Results" },
  { href: "#get-started", label: "Get Started" },
];

const FEATURES = [
  {
    icon: FileText,
    title: "Easy Examinations",
    body: "Take online exams with a clean and simple interface that keeps you focused.",
  },
  {
    icon: Clock,
    title: "Smart Timer",
    body: "Keep track of your exam time with a reliable countdown timer.",
  },
  {
    icon: BarChart3,
    title: "Instant Results",
    body: "Get your score and performance details immediately after completing an exam.",
  },
  {
    icon: Flag,
    title: "Flag Questions",
    body: "Mark questions for review and easily return to them before submitting.",
  },
  {
    icon: Users,
    title: "Teacher Management",
    body: "Create exams, manage questions, publish exams and view student performance.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Platform",
    body: "Role-based access and secure authentication keep your examination system protected.",
  },
];

const STATS = [
  { value: "10K+", label: "Exams Taken" },
  { value: "5K+", label: "Students" },
  { value: "500+", label: "Examinations" },
  { value: "99%", label: "Reliability" },
];

function TypewriterText({ words, typingSpeed = 80, deletingSpeed = 40, pause = 1800 }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!deleting && subIndex === words[index].length) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }

    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, words, typingSpeed, deletingSpeed, pause]);

  return (
    <span className="text-primary">
      {words[index].substring(0, subIndex)}
      <span className="animate-pulse">|</span>
    </span>
  );
}

const HUB_POS = [
  "lg:right-[65%] lg:top-[6%] lg:text-right",
  "lg:right-[83%] lg:top-[40%] lg:text-right",
  "lg:right-[73%] lg:top-[82%] lg:text-right",
  "lg:left-[65%] lg:top-[6%]",
  "lg:left-[83%] lg:top-[40%]",
  "lg:left-[73%] lg:top-[82%]",
];

function HubItem({ icon: Icon, title, body, side }) {
  const left = side === "left";

  return (
    <div
      className={`flex w-full flex-col ${
        left ? "lg:items-end lg:text-right" : ""
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={18} strokeWidth={2} aria-hidden="true" />
      </span>

      <h3 className="mt-3 whitespace-nowrap text-base font-bold tracking-tight text-indigo-deep">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-text-secondary">{body}</p>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // The section anchors need smooth scrolling, but scroll-behavior has to sit on
  // the scrolling element (html) - so scope it to this page rather than globally.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "smooth";
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-app-bg/80 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4">
          {/* Brand */}
          <Logo variant="arc" className="text-xl text-primary" />

          {/* Section links */}
          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary transition hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="hidden rounded-lg px-4 py-2 font-semibold text-indigo-deep transition hover:bg-lavender md:block"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="hidden rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary-dark md:block"
            >
              Get Started
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-lavender hover:text-primary md:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-border bg-surface px-6 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 font-medium text-text-secondary transition hover:bg-app-bg hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 font-semibold text-indigo-deep transition hover:bg-app-bg"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary-dark"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
<main id="home" className="relative flex min-h-[78vh] scroll-mt-24 items-center overflow-hidden px-6 py-16">
  <div
    aria-hidden="true"
    className="absolute inset-0 bg-gradient-to-b from-lavender to-app-bg dark:from-lavender/30"
  />
  <div
    aria-hidden="true"
    className="absolute -right-40 top-1/2 h-[40rem] w-[40rem] -translate-y-1/2 rounded-full bg-primary/20 blur-3xl dark:bg-primary/15"
  />

  <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
    <Reveal className="text-center lg:text-left">
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-indigo-deep sm:text-5xl xl:text-6xl">
        Take Your Exams.
        <span className="block">
          <TypewriterText
            words={["Track Your Progress.", "Boost Your Scores.", "Achieve Your Goals."]}
          />
        </span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-text-secondary lg:mx-0">
        Examly makes online examinations simple, organized, and easy to
        manage for both students and teachers.
      </p>

      <button
        onClick={() => navigate("/register")}
        className="mt-8 rounded-xl bg-primary px-8 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-primary-dark"
      >
        Get Started →
      </button>
    </Reveal>

    <Reveal delay={140} className="mx-auto w-full max-w-md">
      <ExamCardMock />
    </Reveal>
  </div>
</main>
      {/* Features */}
<section id="features" className="scroll-mt-24 bg-surface px-6 pt-10 pb-20 md:pt-14 md:pb-28">
  <div className="mx-auto max-w-7xl">
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        Why Examly
      </p>

      <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-indigo-deep md:text-4xl">
        Everything you need for better online exams
      </h2>

      <p className="mt-4 text-pretty leading-7 text-text-secondary">
        A simple and powerful platform designed to make examinations
        easier for students and teachers.
      </p>
    </Reveal>

    <div className="relative mt-16 lg:h-[36rem]">
      <Reveal className="relative mx-auto flex w-full max-w-md flex-col items-center lg:absolute lg:left-1/2 lg:top-[57%] lg:h-[30rem] lg:w-auto lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2">
        <div
          aria-hidden="true"
          className="absolute bottom-2 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <img
          src={avatar}
          alt=""
          className="relative w-full lg:h-full lg:w-auto lg:max-w-none"
        />
      </Reveal>

      <div className="mt-10 grid gap-10 lg:mt-0 lg:block">
        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className={`animate-hub-float lg:absolute lg:w-44 ${HUB_POS[index]}`}
            style={{ animationDelay: `${index * 0.4}s` }}
          >
            <HubItem {...feature} side={index < 3 ? "left" : "right"} />
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
{/* How It Works */}
<section id="how-it-works" className="scroll-mt-24 bg-app-bg px-6 py-20">
  <div className="mx-auto max-w-6xl">

    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="font-semibold text-primary">
        HOW IT WORKS
      </p>

      <h2 className="mt-2 text-3xl font-extrabold text-indigo-deep md:text-4xl">
        Get started in three simple steps
      </h2>

      <p className="mt-4 text-text-secondary">
        From choosing an exam to viewing your results, Examly keeps
        everything simple.
      </p>
    </Reveal>

    <div className="mt-14 grid gap-10 md:grid-cols-3">

      {/* Step 1 */}
      <Reveal className="text-center" delay={0}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white shadow-lg">
          1
        </div>

        <h3 className="mt-6 text-xl font-bold text-indigo-deep">
          Choose an Exam
        </h3>

        <p className="mt-3 leading-7 text-text-secondary">
          Browse available examinations and choose the one you want
          to take.
        </p>
      </Reveal>

      {/* Step 2 */}
      <Reveal className="text-center" delay={120}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white shadow-lg">
          2
        </div>

        <h3 className="mt-6 text-xl font-bold text-indigo-deep">
          Take the Exam
        </h3>

        <p className="mt-3 leading-7 text-text-secondary">
          Answer each question, flag questions for review and keep
          track of your remaining time.
        </p>
      </Reveal>

      {/* Step 3 */}
      <Reveal className="text-center" delay={240}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-white shadow-lg">
          3
        </div>

        <h3 className="mt-6 text-xl font-bold text-indigo-deep">
          Get Your Results
        </h3>

        <p className="mt-3 leading-7 text-text-secondary">
          Submit your exam and instantly see your score, performance
          and detailed answers.
        </p>
      </Reveal>

    </div>
  </div>
</section>
{/* Stats */}
<section id="results" className="scroll-mt-24 bg-surface px-6 py-16">
  <div className="mx-auto grid max-w-5xl gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">

    {STATS.map((stat, index) => (
      <Reveal key={stat.label} delay={index * 100}>
        <h3 className="text-4xl font-extrabold text-primary">
          <CountUp value={stat.value} />
        </h3>
        <p className="mt-2 text-text-secondary">{stat.label}</p>
      </Reveal>
    ))}

  </div>
</section>

{/* CTA */}
<section id="get-started" className="relative scroll-mt-24 overflow-hidden px-6 py-24 text-center md:px-16">
  {/* Background image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: `url(${exam1})` }}
  />

  {/* Brand color overlay */}
  <div className="absolute inset-0 bg-primary/80" />

  {/* Content sits above the overlay */}
  <Reveal className="relative z-10">
    <p className="font-semibold text-white/90">
      GET STARTED WITH EXAMLY
    </p>

    <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
      Ready to take your next exam?
    </h2>

    <p className="mx-auto mt-4 max-w-xl text-white/85">
      Join Examly and experience a smarter, simpler way to take
      online examinations.
    </p>

    <button
      onClick={() => navigate("/register")}
      className="mt-8 rounded-xl bg-white px-8 py-4 font-bold text-primary shadow-lg transition hover:-translate-y-1 hover:bg-gray-100"
    >
      Get Started →
    </button>
  </Reveal>
</section>
{/* Footer */}
<footer className="border-t border-border bg-surface px-6 py-10">
  <div className="mx-auto max-w-6xl">

    <div className="grid gap-8 md:grid-cols-3">

      {/* Brand */}
      <div>
        <Logo variant="arc" className="text-2xl text-primary" />

        <p className="mt-3 max-w-sm text-sm leading-6 text-text-secondary">
          A simple and powerful platform for modern online examinations.
        </p>
      </div>

      {/* Platform */}
      <div>
        <h3 className="font-bold text-indigo-deep">
          Platform
        </h3>

        <div className="mt-4 space-y-3 text-sm text-text-secondary">
          <a href="#features" className="block hover:text-primary">
            Features
          </a>

          <a href="#how-it-works" className="block hover:text-primary">
            How It Works
          </a>

          <button
            onClick={() => navigate("/login")}
            className="block hover:text-primary"
          >
            Login
          </button>
        </div>
      </div>

      {/* Get Started */}
      <div>
        <h3 className="font-bold text-indigo-deep">
          Get Started
        </h3>

        <p className="mt-4 text-sm leading-6 text-text-secondary">
          Ready to experience a smarter way to take online exams?
        </p>

        <button
          onClick={() => navigate("/register")}
          className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Get Started →
        </button>
      </div>

    </div>

    <div className="mt-10 border-t border-border pt-6 text-center">
      <p className="text-sm text-text-secondary">
        © 2026 Examly. All rights reserved.
      </p>
    </div>

  </div>
</footer>
    </div>
  )
}

export default LandingPage
