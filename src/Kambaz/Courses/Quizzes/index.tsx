import { Button, ListGroup, Dropdown } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import { FaPlus, FaTrash, FaEllipsisV, FaCheck } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { deleteQuiz, setQuizzes } from "./reducer";
import * as quizzesClient from "./client";
import DeleteModal from "./DeleteModal";
import * as coursesClient from "../client";
import CopyQuizModal from "./QuizCopyModal";
import { MdDoNotDisturb } from "react-icons/md";

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

  const [showCopyModal, setShowCopyModal] = useState(false);
  const [quizToCopy, setQuizToCopy] = useState<any>(null);
  const [courseList, setCourseList] = useState<any[]>([]);

  const fetchQuizzes = async () => {
    if (!cid) {
      throw new Error("skibidi");
    }

    const quizzes1 = await coursesClient.findQuizzesForCourse(cid);
    dispatch(setQuizzes(quizzes1));
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchCourses = async () => {
    const allCourses = await coursesClient.fetchAllCourses();
    setCourseList(allCourses.filter((c: any) => c._id !== cid)); // exclude current course
  };

  useEffect(() => {
    fetchQuizzes();
    fetchCourses();
  }, []);

  const removeQuiz = async (quizId: any) => {
    await quizzesClient.deleteQuiz(quizId);
    dispatch(deleteQuiz(quizId));
  };

  const togglePublish = async (quiz: any) => {
    const updatedQuiz = { ...quiz, published: !quiz.published };
    await quizzesClient.updateQuiz(updatedQuiz);
    fetchQuizzes();
  };

  const buildDateObj = (date: Date) => ({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  });
  

  const formatDate = (dateObj: any) => {
    if (!dateObj || typeof dateObj !== "object") return "Invalid date";
    const { year, month, day, hour, minute } = dateObj;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`;
  };

  const getAvailability = (quiz: any) => {
    if (!quiz.availableDate || !quiz.untilDate) return "Availability unknown";

    const available = new Date(
      quiz.availableDate.year,
      quiz.availableDate.month - 1,
      quiz.availableDate.day,
      quiz.availableDate.hour,
      quiz.availableDate.minute
    );
    const until = new Date(
      quiz.untilDate.year,
      quiz.untilDate.month - 1,
      quiz.untilDate.day,
      quiz.untilDate.hour,
      quiz.untilDate.minute
    );

    const now = new Date();

    if (now > until) {
      return "Closed";
    } else if (now >= available && now <= until) {
      return "Available";
    } else {
      return `Not available until ${formatDate(quiz.availableDate)}`;
    }
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
            onClick={async () => {
              const now = new Date();
              const newQuiz = {
                title: "New Quiz",
                points: 0,
                published: false,
                questions: [],
                availableDate: buildDateObj(now),
                untilDate: buildDateObj(now),
                dueDate: buildDateObj(now),
                quizType: "Graded Quiz",
                assignmentGroup: "Quizzes",
                shuffleAnswers: "Yes",
                timeLimit: 20,
                multipleAttempts: false,
                howManyAttempts: 1,
                showCorrectAnswers: "Never",
                accessCode: "",
                oneQuestionAtATime: "Yes",
                webcamRequired: "No",
                lockQuestionsAfterAnswering: false,              
              };

              const createdQuiz = await quizzesClient.createQuiz(cid!, newQuiz);
              fetchQuizzes();
              navigate(`/Kambaz/Courses/${cid}/Quizzes/${createdQuiz._id}`);
            }}
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
          quizzes
            .filter((quiz: any) => isFaculty || quiz.published) // Students only see published quizzes
            .map((quiz: any) => (
              <ListGroup.Item
                key={quiz._id}
                className="d-flex align-items-center"
              >
                <BsGripVertical className="me-2" />
                <div className="flex-grow-1">
                  {isFaculty ? (
                    <Link
                      to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`}
                      className="text-decoration-none"
                    >
                      <b>{quiz.title}</b>
                    </Link>
                  ) : (
                    <Link
                      to={`/Kambaz/Courses/${cid}/Quizzes/${quiz._id}`}
                      className="text-decoration-none"
                    >
                      <b>{quiz.title}</b>
                    </Link>
                  )}
                  <div>
                    {getAvailability(quiz)} | {quiz.points} pts |{" "}
                    {quiz.questions ? quiz.questions.length : 0} Questions | Due{" "}
                    {formatDate(quiz.dueDate)}
                  </div>
                </div>

                {/* Only show to faculty */}
                {isFaculty && (
                  <>
                    <Button
                      variant="link"
                      onClick={async () => await togglePublish(quiz)}
                    >
                      {quiz.published ? (
                        <FaCheck className="text-success" />
                      ) : (
                        <MdDoNotDisturb className="text-danger" />
                      )}
                    </Button>

                    {isFaculty && (
                      <Dropdown className="ms-2">
                        <Dropdown.Toggle
                          as="div"
                          style={{ cursor: "pointer" }}
                          id={`dropdown-${quiz._id}`}
                        >
                          <FaEllipsisV />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              navigate(
                                `/Kambaz/Courses/${cid}/Quizzes/${quiz._id}/edit`
                              )
                            }
                          >
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => {
                              setQid(quiz._id);
                              handleShow();
                            }}
                          >
                            Delete
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={async () => await togglePublish(quiz)}
                          >
                            {quiz.published ? "Unpublish" : "Publish"}
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => {
                              setQuizToCopy(quiz);
                              setShowCopyModal(true);
                            }}
                          >
                            Copy
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}

                    <FaTrash
                      className="text-danger ms-2"
                      onClick={() => {
                        setQid(quiz._id);
                        handleShow();
                      }}
                    />
                  </>
                )}
              </ListGroup.Item>
            ))
        )}
      </ListGroup>
      <CopyQuizModal
        show={showCopyModal}
        handleClose={() => setShowCopyModal(false)}
        handleCopy={async (destinationCid) => {
          const copiedQuiz = { ...quizToCopy };
          delete copiedQuiz._id;
          copiedQuiz.title += " (Copy)";
          await quizzesClient.createQuiz(destinationCid, copiedQuiz);
          fetchQuizzes();
        }}
        courseList={courseList}
        quiz={quizToCopy}
      />

      <DeleteModal
        show={show}
        handleClose={handleClose}
        deleteQuiz={removeQuiz}
        qid={qid}
      />
    </div>
  );
}
