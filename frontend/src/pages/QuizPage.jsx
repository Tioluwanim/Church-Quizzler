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
      // ✅ Fixed call (pass 3 args, not an object)
      await submitAnswer(team.id, q.id, q.points);
    }

    // Next question or next team
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(team.timer_seconds || 30);
      setShowAnswer(false);
      setAnswerRevealed(false);
    } else {
      // Mark team done for this category
      const key = `answered_${categoryId}`;
      let answered = JSON.parse(localStorage.getItem(key) || "[]");
      if (!answered.includes(team.id)) answered.push(team.id);
      localStorage.setItem(key, JSON.stringify(answered));

      // Check if all teams are done
      const allTeams = JSON.parse(localStorage.getItem("all_teams") || "[]");
      if (answered.length >= allTeams.length) {
        localStorage.removeItem(key);
        navigate("/select-quiz");
      } else {
        navigate(`/select-team/${categoryId}`);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">
        Team: {team.name} | Question {currentIndex + 1}/{questions.length}
      </h1>
      <p className="mb-4 text-lg">{q.text}</p>

      <div className="grid gap-3 mb-6">
        {q.options?.map((opt, idx) => (
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
