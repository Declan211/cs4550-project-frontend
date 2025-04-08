import { Button, ListGroup } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import { FaPlus, FaTrash, FaEllipsisV, FaCheck, FaTimes } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { deleteQuiz, setQuizzes } from "./reducer";
import * as quizzesClient from "./client";
import DeleteModal from "./DeleteModal";
import * as coursesClient from "../client";

export default function Quizzes() {
  const { cid } = useParams();
  const { quizzes } = useSelector((state: any) => state.quizzesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser.role === "FACULTY";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [qid, setQid] = useState("");

  const fetchQuizzes = async () => {
    if (!cid) {
      throw new Error("skibidi");
    }

    const quizzes = await coursesClient.findQuizzesForCourse(cid);
    dispatch(setQuizzes(quizzes));
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const removeQuiz = async (quizId: any) => {
    await quizzesClient.deleteQuiz(quizId);
    dispatch(deleteQuiz(quizId));
  };

  const togglePublish = (quiz: any) => {
    quiz.published = !quiz.published;
    quizzesClient.updateQuiz(quiz._id);
    fetchQuizzes();
  };

  return (
    <div id="wd-quizzes">
      <div className="d-flex align-items-center w-100">
        {isFaculty && (
          <Button
            variant="primary"
            size="lg"
            className="ms-auto"
            id="wd-add-quiz"
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/new`)}
          >
            <FaPlus className="me-2" /> Quiz
          </Button>
        )}
      </div>
      <br />
      <ListGroup className="rounded-0" id="wd-quizzes-list">
        {quizzes.length === 0 ? (
          <p>No quizzes available. Click "Add Quiz" to create one.</p>
        ) : (
          quizzes.map((quiz: any) => (
            <ListGroup.Item
              key={quiz._id}
              className="d-flex align-items-center"
            >
              <BsGripVertical className="me-2" />
              <div className="flex-grow-1">
                <Link
                  to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`}
                  className="text-decoration-none"
                >
                  <b>{quiz.title}</b>
                </Link>
                <div>
                  <span>
                    {quiz.points} pts | {quiz.numberOfQuestions} Questions | Due{" "}
                    {quiz.dueDate}
                  </span>
                </div>
              </div>
              <Button variant="link" onClick={() => togglePublish(quiz)}>
                {quiz.published ? (
                  <FaCheck className="text-success" />
                ) : (
                  <FaTimes className="text-danger" />
                )}
              </Button>
              <FaEllipsisV className="ms-2" />
              <FaTrash
                className="text-danger ms-2"
                onClick={() => {
                  setQid(quiz._id);
                  handleShow();
                }}
              />
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
      <DeleteModal
        show={show}
        handleClose={handleClose}
        deleteQuiz={removeQuiz}
        qid={qid}
      />
    </div>
  );
}
