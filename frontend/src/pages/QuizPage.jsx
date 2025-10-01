import { useEffect, useState } from "react";
import { fetchQuestions, fetchTeams, fetchScoreboard } from "../api";

const API_BASE = "https://church-quizzler.onrender.com"; // adjust if backend URL differs

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scoreboard, setScoreboard] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  // Load questions + teams on mount
  useEffect(() => {
    const load = async () => {
      const qs = await fetchQuestions();
      const ts = await fetchTeams();
      setQuestions(qs);
      setTeams(ts);
    };
    load();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!selectedQuestion || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, selectedQuestion]);

  const startQuestion = (q) => {
    setSelectedQuestion(q);
    setShowAnswer(false);
    setTimeLeft(30);
  };

  const revealAnswer = () => {
    setShowAnswer(true);
  };

  const awardPoints = async (team) => {
    try {
      const res = await fetch(`${API_BASE}/scores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: team.id,
          question_id: selectedQuestion.id,
          points: selectedQuestion.points || 10,
        }),
      });
      if (!res.ok) throw new Error("Failed to award points");

      setUsedQuestions((prev) => ({
        ...prev,
        [selectedQuestion.id]: team.color || "#6A0DAD",
      }));


      setSelectedQuestion(null);
    } catch (err) {
      alert("Error awarding points: " + err.message);
    }
  };


  const finishQuiz = async () => {
    const data = await fetchScoreboard();
    setScoreboard(data);
    setQuizFinished(true);
  };

  // ==============================
  // FULL SCREEN RENDER
  // ==============================
  if (quizFinished) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-r from-yellow-100 via-purple-100 to-indigo-100 p-10 font-serif">
        <h1 className="text-5xl font-bold text-purple-800 mb-12">🏆 Final Scoreboard</h1>
        <ul className="space-y-4 w-full max-w-2xl">
          {scoreboard.map((row, idx) => (
            <li
              key={idx}
              className="flex justify-between px-6 py-4 bg-white shadow-xl rounded-lg text-2xl font-semibold"
            >
              <span>{row.team_name}</span>
              <span className="text-purple-700">{row.total_points} pts</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-r from-indigo-100 via-purple-50 to-yellow-100 p-8 font-serif">
      {!selectedQuestion ? (
        <>
          {/* Question Grid */}
          <h1 className="text-5xl font-bold text-center text-purple-800 mb-8">
            📖 Select a Question
          </h1>
          <div className="grid grid-cols-8 gap-4 flex-1 place-items-center">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => startQuestion(q)}
                disabled={usedQuestions[q.id]}
                className={`w-24 h-24 text-3xl font-bold rounded-full shadow-lg transition ${
                  usedQuestions[q.id]
                    ? "cursor-not-allowed opacity-70"
                    : "hover:scale-105 bg-purple-600 text-white"
                }`}
                style={{
                  backgroundColor: usedQuestions[q.id] || "#6B21A8",
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Finish Button */}
          <div className="text-center mt-8">
            <button
              onClick={finishQuiz}
              className="px-10 py-4 bg-green-600 text-white text-2xl font-bold rounded-full shadow hover:bg-green-700 transition"
            >
              Finish Quiz & Show Scores
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 justify-center items-center">
          {/* Timer */}
          <div className="mb-8">
            <div className="px-8 py-4 bg-purple-600 text-white text-3xl font-semibold rounded-full shadow-lg">
              ⏳ {timeLeft}s
            </div>
          </div>

          {/* Question */}
          <p className="text-4xl font-bold text-center text-gray-800 mb-10 max-w-3xl">
            {selectedQuestion.text}
          </p>

          {/* Answer */}
          {showAnswer ? (
            <p className="text-center text-green-600 text-3xl font-semibold mb-10">
              ✅ {selectedQuestion.answer}
            </p>
          ) : (
            <button
              onClick={revealAnswer}
              className="px-10 py-4 bg-yellow-400 text-white text-2xl font-semibold rounded-full shadow hover:bg-yellow-500 transition"
            >
              Show Answer
            </button>
          )}

          {/* Award Points */}
          {showAnswer && (
            <div className="mt-10 flex gap-4 flex-wrap justify-center">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => awardPoints(team)}
                  className="px-8 py-4 rounded-full text-white text-xl font-semibold shadow-lg hover:scale-105 transition"
                  style={{ backgroundColor: team.color || "#6A0DAD" }}
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizPage;
