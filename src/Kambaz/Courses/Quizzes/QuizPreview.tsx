import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import * as coursesClient from "../client";

export default function QuizPreview() {
  const { cid, qid } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(isFaculty); // faculty skips "Start Quiz" step

  useEffect(() => {
    const fetchQuiz = async () => {
      const quizzes = await coursesClient.findQuizzesForCourse(cid!);
      const currentQuiz = quizzes.find((q: any) => q._id === qid);
      setQuiz(currentQuiz);
    };
    if (cid && qid) {
      fetchQuiz();
    }
  }, [cid, qid]);

  const handleChange = (questionId: string, selected: string) => {
    if (submitted) return; // prevent changes after submission
    setAnswers({ ...answers, [questionId]: selected });
  };

  const handleSubmit = () => {
    if (!quiz?.questions) return;
    let correctCount = 0;
    quiz.questions.forEach((q: any) => {
      if (answers[q._id] === q.correct) {
        correctCount += 1;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  if (!quiz) {
    return <div className="container mt-5">Loading...</div>;
  }

  if (!started && !isFaculty) {
    return (
      <div className="container mt-5 text-center">
        <h3 className="fw-semibold">{quiz.title}</h3>
        <p className="text-muted">This quiz has {quiz.questions?.length} questions.</p>
        <button className="btn btn-primary" onClick={() => setStarted(true)}>
          Start Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="mb-4">
        <h3 className="fw-semibold">{quiz.title} {isFaculty && "(Preview)"}</h3>
        {isFaculty && (
          <div className="text-muted">You are previewing this quiz as a student.</div>
        )}
      </div>

      {quiz.questions?.map((q: any, index: number) => (
        <div key={q._id} className="mb-4">
          <div className="fw-semibold mb-2">
            Q{index + 1}: {q.question}
          </div>
          <div className="ms-3">
            {q.choices?.map((choice: string) => (
              <div key={choice}>
                <input
                  type="radio"
                  name={q._id}
                  value={choice}
                  disabled={submitted}
                  checked={answers[q._id] === choice}
                  onChange={() => handleChange(q._id, choice)}
                />{" "}
                {choice}
                {submitted && choice === q.correct && (
                  <span className="text-success ms-2">✔</span>
                )}
                {submitted &&
                  answers[q._id] === choice &&
                  choice !== q.correct && (
                    <span className="text-danger ms-2">✘</span>
                  )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {!submitted && (
        <button className="btn btn-primary mt-3" onClick={handleSubmit}>
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="mt-4">
          <h5>Final Score</h5>
          <p>
            You scored <strong>{score}</strong> out of{" "}
            <strong>{quiz.questions?.length}</strong>.
          </p>
          {isFaculty && (
            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`)
              }
            >
              Edit Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
