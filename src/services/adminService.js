import api from "./api";

export const getAllUsers = () =>
  api.get("/admin/users").then((res) => res.data);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export const getAllExamsAdmin = () =>
  api.get("/admin/exams").then((res) => res.data);

export const deleteExamAdmin = (id) =>
  api.delete(`/admin/exams/${id}`);

export const getPendingTeachers = () =>
  api.get("/admin/teachers/pending").then((res) => res.data);

export const approveTeacher = (id) =>
  api.put(`/admin/teachers/${id}/approve`);

export const rejectTeacher = (id) =>
  api.put(`/admin/teachers/${id}/reject`);

export const suspendUser = (id) =>
  api.put(`/admin/users/${id}/suspend`);

export const unsuspendUser = (id) =>
  api.put(`/admin/users/${id}/unsuspend`);