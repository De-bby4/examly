import { useLocation, Outlet } from "react-router-dom";
import AuthBrandPanel from "./AuthBrandPanel";

function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  return (
    <div className="relative h-screen overflow-hidden bg-app-bg">
      <div
        className={`flex h-full w-[200%] transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          isRegister ? "-translate-x-1/2" : "translate-x-0"
        }`}
      >
        {/* LOGIN SIDE */}
        <div className="grid h-full w-1/2 grid-cols-2">
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

          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>
        </div>

        {/* REGISTER SIDE */}
        <div className="grid h-full w-1/2 grid-cols-2">
          <div className="h-full overflow-y-auto">
            <Outlet />
          </div>

          <AuthBrandPanel
            headline={
              <>
                Welcome to
                <br />
                student portal
              </>
            }
            subtext="Create your account and start taking smarter exams."
          />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;