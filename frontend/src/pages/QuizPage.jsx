import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuestions, submitAnswer } from "../api";

function QuizPage() {
  const { teamId, categoryId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const navigate = useNavigate();

  const tickSound = useRef(new Audio("/sounds/tick.mp3"));
  const endSound = useRef(new Audio("/sounds/end.mp3"));

  // Load questions
  useEffect(() => {
    async function load() {
      const q = await fetchQuestions(categoryId);
      setQuestions(q);
    }
    load();
  }, [categoryId]);

  // Countdown timer
  useEffect(() => {
    if (!questions.length || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t > 0) tickSound.current.play();
        if (t - 1 <= 0) {
          clearInterval(timer);
          endSound.current.play();
          setTimeout(() => {
            setShowAnswer(true);
            setAnswerRevealed(true);
          }, 3000); // show answer after 3s
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions]);

  if (!questions.length) return <p>Loading...</p>;

  const q = questions[currentIndex];

  // Award points and move to next question/team
  const awardPoints = async (isCorrect) => {
    if (isCorrect) {
      await submitAnswer({ team_id: teamId, question_id: q.id, points: q.points });
    }

    if (currentIndex + 1 < questions.length) {
      // Next question for the same team
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(30);
      setShowAnswer(false);
      setAnswerRevealed(false);
    } else {
      // Mark team as done for this category
      const key = `answered_${categoryId}`;
      let answered = JSON.parse(localStorage.getItem(key) || "[]");
      if (!answered.includes(teamId)) {
        answered.push(teamId);
        localStorage.setItem(key, JSON.stringify(answered));
      }

      // Check if all teams are done
      const allTeams = JSON.parse(localStorage.getItem("all_teams") || "[]");
      if (answered.length >= allTeams.length) {
        localStorage.removeItem(key);
        navigate("/select-quiz"); // go to next session
      } else {
        navigate(`/select-team/${categoryId}`); // next team
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Question {currentIndex + 1}</h1>
      <p className="mb-4 text-lg">{q.text}</p>

      <div className="grid gap-3 mb-6">
        {q.options.map((opt, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border text-center font-medium ${
              showAnswer && opt === q.answer
                ? "bg-green-200 border-green-600"
                : "bg-purple-100 border-purple-300"
            }`}
          >
            {opt}
          </div>
        ))}
      </div>

      <div className="text-center text-xl font-bold mb-4">
        ⏳ {timeLeft > 0 ? timeLeft : 0}s
      </div>

      {answerRevealed && (
        <div className="flex justify-center gap-6">
          <button
            onClick={() => awardPoints(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700"
          >
            Correct ✅
          </button>
          <button
            onClick={() => awardPoints(false)}
            className="px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700"
          >
            Wrong ❌
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
