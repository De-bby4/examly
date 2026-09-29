import api from "./api";

export const getStudentHistory = () =>
  api.get("/students/history").then((res) => res.data);

export const startAttempt = (examId) =>
  api.post(`/exams/${examId}/start`).then((res) => res.data);

export const getQuestionsForAttempt = (attemptId) =>
  api.get(`/attempts/${attemptId}/questions`).then((res) => res.data);

export const submitAnswer = (attemptId, questionId, selectedOptionId) =>
  api.post(`/attempts/${attemptId}/answers`, { questionId, selectedOptionId });

export const submitExam = (attemptId) =>
  api.post(`/attempts/${attemptId}/submit`).then((res) => res.data);

export const getResult = (attemptId) =>
  api.get(`/attempts/${attemptId}/result`).then((res) => res.data);

export const getAnswerReview = (attemptId) =>
  api.get(`/attempts/${attemptId}/review`).then((res) => res.data);

export const recordTabSwitch = (attemptId) =>
  api.post(`/attempts/${attemptId}/tab-switch`);

export const getExamResults = (examId, params) =>
  api.get(`/exams/${examId}/results`, { params }).then((res) => res.data);

export const getExamAnalytics = (examId) =>
  api.get(`/exams/${examId}/analytics`).then((res) => res.data);