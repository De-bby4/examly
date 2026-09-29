import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  History,
  Bell,
  Settings,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Logo from "../components/ExamlyLogo";

import { getUnreadCount } from "../services/notificationService";

import { getProfile } from "../services/profileService";

const navItems = [
  {
    to: "/student/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    to: "/student/exams",
    label: "My Exams",
    icon: FileText,
  },

  {
    to: "/student/history",
    label: "Exam History",
    icon: History,
  },

  {
    to: "/student/notifications",
    label: "Notifications",
    icon: Bell,
  },
];

const API_ORIGIN = "http://localhost:8080";

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StudentLayout() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState(null);

  // Active sidebar animation
  const navRef = useRef(null);
  const itemRefs = useRef({});

  const [indicator, setIndicator] = useState({
    top: 0,
    height: 0,
  });

  useEffect(() => {
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {});
  }, []);

  // Move the active background whenever the route changes
  useLayoutEffect(() => {
    const activeItem = navItems.find((item) => {
      if (item.to === "/student/dashboard") {
        return (
          location.pathname === "/student/dashboard" ||
          location.pathname === "/student/dashboard/"
        );
      }

      return location.pathname.startsWith(item.to);
    });

    if (!activeItem) return;

    const activeElement = itemRefs.current[activeItem.to];
    const navElement = navRef.current;

    if (!activeElement || !navElement) return;

    const navRect = navElement.getBoundingClientRect();
    const itemRect = activeElement.getBoundingClientRect();

    setIndicator({
      top: itemRect.top - navRect.top,
      height: itemRect.height,
    });
  }, [location.pathname]);

  const pictureUrl = profile?.profilePictureUrl
    ? `${API_ORIGIN}${profile.profilePictureUrl}`
    : null;

  return (
    <div className="flex min-h-screen bg-app-bg">

      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-surface px-4 py-6 md:fixed md:inset-y-0 md:flex">

        {/* Logo */}
        <div className="mb-8 px-2">
          <Logo variant="arc" className="text-xl text-primary" />
        </div>

        {/* Navigation */}
        <nav
          ref={navRef}
          className="relative flex flex-1 flex-col gap-1"
        >

          {/* Sliding active background */}
          <div
            className="pointer-events-none absolute left-0 right-0 z-0 rounded-lg bg-primary transition-all duration-300 ease-in-out"
            style={{
              top: indicator.top,
              height: indicator.height,
            }}
          />

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                ref={(element) => {
                  itemRefs.current[item.to] = element;
                }}
                className={({ isActive }) =>
                  `relative z-10 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-text-secondary hover:bg-app-bg"
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={17} />
                  {item.label}
                </span>

                {item.to === "/student/notifications" &&
                  unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile card */}
        <div className="flex items-center gap-3 rounded-xl bg-app-bg px-3 py-2.5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white">
            {pictureUrl ? (
              <img
                src={pictureUrl}
                alt={user?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(user?.name)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {user?.name}
            </p>

            <p className="text-xs text-text-secondary">
              {user?.role}
            </p>
          </div>

          <button
            onClick={() => navigate("/student/profile")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-primary/15 hover:text-primary"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64">

        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 md:hidden">

          <Logo variant="arc" className="text-lg text-primary" />

          <button
            onClick={() => navigate("/student/profile")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary"
          >
            <Settings size={16} />
          </button>

        </header>

        <main className="p-6 md:p-10">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default StudentLayout;