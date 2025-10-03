import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuestionsByCategory, submitAnswer, fetchTeams } from "../api";

function QuizPage() {
  const { teamId, categoryId, questionId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [team, setTeam] = useState(null);
  const navigate = useNavigate();

  const tickSound = useRef(new Audio("/sounds/tick.mp3"));
  const endSound = useRef(new Audio("/sounds/end.mp3"));

  // Load questions & team info
  useEffect(() => {
    async function loadData() {
      const qData = await fetchQuestionsByCategory(categoryId);
      setQuestions(qData);

      const teams = await fetchTeams();
      const selectedTeam = teams.find((t) => t.id === parseInt(teamId));
      setTeam(selectedTeam);

      // Set starting question index based on questionId in URL
      if (questionId) {
        const idx = qData.findIndex((q) => q.id === parseInt(questionId));
        setCurrentIndex(idx >= 0 ? idx : 0);
      }

      if (selectedTeam) setTimeLeft(selectedTeam.timer_seconds || 30);
    }
    loadData();
  }, [categoryId, teamId, questionId]);

  // Timer
  useEffect(() => {
    if (!questions.length || !team) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t > 1) {
          tickSound.current.play();
          return t - 1;
        } else {
          clearInterval(timer);
          endSound.current.play();
          setShowAnswer(true);
          setAnswerRevealed(true);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions, team]);

  if (!questions.length || !team) return <p>Loading...</p>;

  const q = questions[currentIndex];

  const awardPoints = async (isCorrect) => {
    if (isCorrect) {
      await submitAnswer(team.id, q.id, q.points);
    }

    // ✅ Mark this question as answered for this team
    const key = `answered_${categoryId}_${team.id}`;
    let answered = JSON.parse(localStorage.getItem(key) || "[]");
    if (!answered.includes(q.id)) answered.push(q.id);
    localStorage.setItem(key, JSON.stringify(answered));

    // ✅ After awarding points, go back to SelectTeam
    navigate(`/select-team/${categoryId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow flex flex-col lg:flex-row gap-8">
      {/* LEFT SIDE: Question */}
      <div className="flex-1">
        <h1 className="text-3xl font-extrabold mb-6 text-purple-900">
          Team: {team.name} | Question {currentIndex + 1}/{questions.length}
        </h1>

        <p className="mb-6 text-2xl font-bold text-gray-900">{q.text}</p>

        {showAnswer && (
          <p className="mb-6 text-green-700 font-extrabold text-xl">
            ✅ Correct Answer: {q.answer}
          </p>
        )}

        <div className="grid gap-4">
          {q.options?.map((opt, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border text-center text-lg font-bold transition ${
                showAnswer && opt === q.answer
                  ? "bg-green-200 border-green-600"
                  : "bg-purple-100 border-purple-300"
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: Timer + Buttons */}
      <div className="w-full lg:w-1/3 flex flex-col items-center justify-center gap-6">
        <div className="text-5xl font-extrabold text-purple-800 mb-6">
          ⏳ {timeLeft > 0 ? timeLeft : 0}s
        </div>

        {answerRevealed && (
          <div className="flex flex-col gap-6 w-full">
            <button
              onClick={() => awardPoints(true)}
              className="px-8 py-4 bg-green-600 text-white rounded-xl font-extrabold text-xl hover:bg-green-700 shadow-lg"
            >
              Correct ✅
            </button>
            <button
              onClick={() => awardPoints(false)}
              className="px-8 py-4 bg-red-600 text-white rounded-xl font-extrabold text-xl hover:bg-red-700 shadow-lg"
            >
              Wrong ❌
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
