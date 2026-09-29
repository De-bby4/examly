import api from "./api";

export const getQuestions = (examId) =>
  api.get(`/exams/${examId}/questions`).then((res) => res.data);

export const addQuestion = (examId, data) =>
  api.post(`/exams/${examId}/questions`, data).then((res) => res.data);

export const updateQuestion = (questionId, data) =>
  api.put(`/questions/${questionId}`, data).then((res) => res.data);

export const deleteQuestion = (questionId) =>
  api.delete(`/questions/${questionId}`);

export const importQuestionsCsv = (examId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post(`/exams/${examId}/questions/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};