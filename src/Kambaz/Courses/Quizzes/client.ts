import axios from "axios";
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUIZZES_API = `${REMOTE_SERVER}/api/quizzes`;

export const deleteQuiz = async (quizId: string) => {
  const response = await axios.delete(`${QUIZZES_API}/${quizId}`);
  return response.data;
};

export const updateQuiz = async (quiz: any) => {
  const { data } = await axios.put(`${QUIZZES_API}/${quiz._id}`, quiz);
  return data;
};

export const updateQuizQuestion = async (quizId: string, newQuestion: any) => {
  const questionId = newQuestion.questionId;
  const { data } = await axios.put(
    `${QUIZZES_API}/${quizId}/${questionId}`,
    newQuestion
  );
  return data; // Passes back the entire Quiz.
};
