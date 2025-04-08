import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import * as coursesClient from "../client";

export default function QuizDetails() {
  const { cid, qid } = useParams();
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    if (!cid) return;

    const fetchQuiz = async () => {
      const quizzes = await coursesClient.findQuizzesForCourse(cid);
      const currentQuiz = quizzes.find((q: any) => q._id === qid);
      setQuiz(currentQuiz);
    };

    fetchQuiz();
  }, [cid, qid]);

  if (!quiz) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-secondary me-2">Preview</button>
        <button className="btn btn-outline-secondary">Edit</button>
      </div>

      <h3 className="fw-semibold mb-4">{quiz.title}</h3>

      <div className="mb-4">
        <div><strong>Quiz Type</strong> &nbsp; {quiz["quiz type"]}</div>
        <div><strong>Points</strong> &nbsp; {quiz.points}</div>
        <div><strong>Assignment Group</strong> &nbsp; {quiz["assignment group"]}</div>
        <div><strong>Shuffle Answers</strong> &nbsp; {quiz["shuffle answers"]}</div>
        <div><strong>Time Limit</strong> &nbsp; {quiz["time limit"]}</div>
        <div><strong>Multiple Attempts</strong> &nbsp; {quiz["multiple attempts"]}</div>
        <div><strong>View Responses</strong> &nbsp; {quiz["view responses"]}</div>
        <div><strong>Show Correct Answers</strong> &nbsp; {quiz["show correct answers"]}</div>
        <div><strong>One Question at a Time</strong> &nbsp; {quiz["one question at a time"]}</div>
        <div><strong>Require Respondus LockDown Browser</strong> &nbsp; {quiz["require lockdown browser"]}</div>
        <div><strong>Required to View Quiz Results</strong> &nbsp; {quiz["required to view quiz results"]}</div>
        <div><strong>Webcam Required</strong> &nbsp; {quiz["webcam required"]}</div>
        <div><strong>Lock Questions After Answering</strong> &nbsp; {quiz["lock questions after answering"]}</div>
      </div>

      <table className="table w-auto">
        <thead>
          <tr>
            <th scope="col">Due</th>
            <th scope="col">For</th>
            <th scope="col">Available from</th>
            <th scope="col">Until</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{quiz["due date"]}</td>
            <td>Everyone</td>
            <td>{quiz["available date"]}</td>
            <td>{quiz["until date"]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
