import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "../../services/notificationService";

function TeacherNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <p className="text-text-secondary">Loading notifications...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Notifications</h1>
          <p className="mt-1 text-text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="text-sm font-semibold text-primary hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="mt-6 text-text-secondary">No notifications yet.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`cursor-pointer rounded-xl p-4 shadow-sm transition ${
                n.isRead ? "bg-surface" : "bg-lavender"
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="font-semibold text-text-primary">{n.title}</p>
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <p className="mt-1 text-sm text-text-secondary">{n.message}</p>
              <p className="mt-2 text-xs text-text-secondary/70">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherNotifications;