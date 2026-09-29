import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, Bell, Settings, UserCheck, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/ExamlyLogo";
import { getUnreadCount } from "../services/notificationService";
import { getProfile } from "../services/profileService";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/pending-teachers", label: "Pending Teachers", icon: UserCheck },
  { to: "/admin/exams", label: "Exams", icon: FileText },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
];

const API_ORIGIN = "http://localhost:8080";

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {});
  }, []);

  const pictureUrl = profile?.profilePictureUrl ? `${API_ORIGIN}${profile.profilePictureUrl}` : null;

  return (
    <div className="flex min-h-screen bg-app-bg">
      {/* Mobile scrim */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${
          menuOpen ? "flex animate-drawer-in-left" : "hidden"
        } fixed inset-y-0 left-0 z-50 w-64 flex-col overflow-y-auto border-r border-border bg-surface px-4 py-6 md:z-auto md:flex`}
      >
        <div className="mb-8 px-2">
          <Logo variant="arc" className="text-xl text-primary" />
        </div>

        <nav className="-mr-4 flex flex-1 flex-col gap-1 pr-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between py-2.5 pl-4 pr-6 text-sm font-semibold transition ${
                    isActive ? "nav-active-curve text-primary" : "rounded-lg text-text-secondary hover:bg-app-bg"
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={17} />
                  {item.label}
                </span>
                {item.to === "/admin/notifications" && unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-xs font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 rounded-xl bg-app-bg px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white">
            {pictureUrl ? (
              <img src={pictureUrl} alt={user?.name} className="h-full w-full object-cover" />
            ) : (
              initials(user?.name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">{user?.name}</p>
            <p className="text-xs text-text-secondary">{user?.role}</p>
          </div>
          <button
            onClick={() => navigate("/admin/profile")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-primary/15 hover:text-primary"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-app-bg hover:text-primary"
            >
              <Menu size={20} />
            </button>

            <Logo variant="arc" className="text-lg text-primary" />
          </div>
          <button
            onClick={() => navigate("/admin/profile")}
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

export default AdminLayout;