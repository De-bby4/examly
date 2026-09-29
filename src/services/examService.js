import api from "./api";

export const getPublishedExams = (search) =>
  api.get("/exams", { params: { search } }).then((res) => res.data);

export const getExamById = (id) =>
  api.get(`/exams/${id}`).then((res) => res.data);

export const getMyExams = (search) =>
  api.get("/exams/my-exams", { params: { search } }).then((res) => res.data);

export const createExam = (data) =>
  api.post("/exams", data).then((res) => res.data);

export const updateExam = (id, data) =>
  api.put(`/exams/${id}`, data).then((res) => res.data);

export const deleteExam = (id) =>
  api.delete(`/exams/${id}`);

export const togglePublish = (id) =>
  api.patch(`/exams/${id}/publish`).then((res) => res.data);

