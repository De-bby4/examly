import api from "./api";

export const getNotifications = () =>
  api.get("/notifications").then((res) => res.data);

export const markAsRead = (id) =>
  api.put(`/notifications/${id}/read`);

export const markAllAsRead = () =>
  api.put("/notifications/read-all");

export const getUnreadCount = () =>
  api.get("/notifications").then((res) => res.data.filter((n) => !n.isRead).length);