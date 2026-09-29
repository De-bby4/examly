import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, GraduationCap, Bell, BookOpen, Pencil, LogOut } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile, updateProfilePicture } from "../../services/profileService";

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const API_ORIGIN = "http://localhost:8080";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data);
      setName(data.name);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateProfile(name);
      setProfile(updated);
      setEditing(false);
      setMessage("Profile updated.");
    } catch {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPicture(true);
    setMessage("");
    try {
      const updated = await updateProfilePicture(file);
      setProfile(updated);
      setMessage("Profile picture updated.");
    } catch {
      setMessage("Failed to upload picture.");
    } finally {
      setUploadingPicture(false);
      e.target.value = "";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/landing");
  };

  if (!profile) return <p className="text-text-secondary">Loading profile...</p>;

  const pictureUrl = profile.profilePictureUrl
    ? `${API_ORIGIN}${profile.profilePictureUrl}`
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-extrabold text-text-primary">Profile</h1>
      <p className="mt-1 text-text-secondary">Manage your account details.</p>

      {/* Identity card */}
      <div className="mt-6 flex items-center gap-5 rounded-2xl bg-surface p-6 shadow-sm">
        <div className="relative shrink-0">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-lavender text-2xl font-bold text-primary">
            {pictureUrl ? (
              <img src={pictureUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              initials(profile.name)
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPicture}
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary-dark disabled:opacity-60"
            title="Change photo"
          >
            {uploadingPicture ? "…" : <Pencil size={15} />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            className="hidden"
          />
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary">{profile.name}</p>
          <p className="text-sm text-text-secondary">{profile.email}</p>
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm font-semibold text-primary">{message}</p>
      )}

      {/* Account section */}
      <p className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Account
      </p>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        {!editing ? (
          <Row
            icon={<User size={18} />}
            label="Manage profile"
            value={profile.name}
            onClick={() => setEditing(true)}
          />
        ) : (
          <form onSubmit={handleSave} className="p-5">
            <label className="block text-sm font-medium text-text-primary">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 mb-4 w-full rounded-lg border border-border bg-app-bg px-4 py-2.5 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setName(profile.name);
                }}
                className="flex-1 rounded-lg border border-border py-2.5 font-semibold text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <Divider />
        <Row icon={<Mail size={18} />} label="Email" value={profile.email} disabled />
        <Divider />
        <Row icon={<GraduationCap size={18} />} label="Role" value={profile.role} disabled />

        <Divider />
       
          <ThemeToggle />
        
      </div>

      {/* Preferences section */}
      <p className="mb-2 mt-8 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Preferences
      </p>
      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        <Row
          icon={<Bell size={18} />}
          label="Notifications"
          onClick={() => navigate("/student/notifications")}
        />
        <Divider />
        <Row
          icon={<BookOpen size={18} />}
          label="Exam history"
          onClick={() => navigate("/student/history")}
        />
      </div>

      {/* Log out */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-surface shadow-sm">
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left font-medium text-error hover:bg-error/10"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Log out?"
        message="You'll need to log in again to access your dashboard."
        confirmLabel="Log Out"
        onConfirm={handleLogout}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function Row({ icon, label, value, onClick, disabled }) {
  const clickable = !!onClick && !disabled;
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`flex items-center justify-between px-5 py-4 ${
        clickable ? "cursor-pointer hover:bg-app-bg" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-text-secondary">{icon}</span>
        <span className="font-medium text-text-primary">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-text-secondary">{value}</span>}
        {clickable && <span className="text-text-secondary">›</span>}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border" />;
}

export default Profile;