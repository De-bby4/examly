import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/landing");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#1E1B4B]">
          Welcome, {user?.name} 👋
        </h1>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Log Out
        </button>
      </div>
      <p className="mt-2 text-gray-500">Student Dashboard — coming together next.</p>
    </div>
  );
}

export default StudentDashboard;