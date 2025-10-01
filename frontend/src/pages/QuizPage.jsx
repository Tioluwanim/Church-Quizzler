import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuestions, submitAnswer } from "../api";

function QuizPage() {
  const { teamId, categoryId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => Number(localStorage.getItem("quiz_timer")) || 30);
  const [autoNext, setAutoNext] = useState(false);
  const navigate = useNavigate();

  const tickSound = useRef(new Audio("/sounds/tick.mp3"));
  const endSound = useRef(new Audio("/sounds/end.mp3"));

  useEffect(() => {
    async function load() {
      const q = await fetchQuestions(categoryId);
      setQuestions(q);
    }
    load();
  }, [categoryId]);

  // countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      endSound.current.play();
      setTimeout(() => {
        setAutoNext(true);
      }, 5000);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t > 1) tickSound.current.play();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // auto go back after delay
  useEffect(() => {
    if (autoNext) handleFinish();
  }, [autoNext]);

  if (!questions.length) return <p>Loading...</p>;

  const q = questions[currentIndex];

  const handleAnswer = async (option) => {
    await submitAnswer({ teamId, questionId: q.id, answer: option });
    handleFinish();
  };

  const handleFinish = () => {
    // Track answered teams per category
    const key = `answered_${categoryId}`;
    let answered = JSON.parse(localStorage.getItem(key) || "[]");
    if (!answered.includes(teamId)) {
      answered.push(teamId);
      localStorage.setItem(key, JSON.stringify(answered));
    }

    // Check if all teams answered
    const allTeams = JSON.parse(localStorage.getItem("all_teams") || "[]");
    if (answered.length >= allTeams.length) {
      // Reset for this category
      localStorage.removeItem(key);
      navigate("/select-quiz");
    } else {
      navigate(`/select-team/${categoryId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Question</h1>
      <p className="mb-4">{q.text}</p>
      <div className="grid gap-3 mb-6">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="text-center text-xl font-bold">⏳ {timeLeft}s</div>
    </div>
  );
}

export default QuizPage;
