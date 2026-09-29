import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-text-secondary">
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </span>
        <span className="font-medium text-text-primary">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${
          isDark ? "bg-primary justify-end" : "bg-gray-300 justify-start"
        }`}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow" />
      </button>
    </div>
  );
}

export default ThemeToggle;