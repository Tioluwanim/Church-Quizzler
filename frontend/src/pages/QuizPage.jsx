import { useEffect, useState } from "react";
import { fetchQuestions, fetchTeams, fetchScoreboard } from "../api";

const API_BASE = "https://church-quizzler.onrender.com";

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState({});
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [scoreboard, setScoreboard] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const load = async () => {
      const qs = await fetchQuestions();
      const ts = await fetchTeams();
      setQuestions(qs);
      setTeams(ts);
    };
    load();
  }, []);

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

  const revealAnswer = () => setShowAnswer(true);

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
  if (quizFinished) {
    return (
      <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-yellow-100 via-purple-100 to-indigo-100 p-4 md:p-10 font-serif">
        <h1 className="text-3xl md:text-5xl font-bold text-purple-800 mb-8 md:mb-12 text-center">🏆 Final Scoreboard</h1>
        <ul className="space-y-4 w-full max-w-xl md:max-w-2xl px-2 md:px-0">
          {scoreboard.map((row, idx) => (
            <li
              key={idx}
              className="flex justify-between px-4 md:px-6 py-3 md:py-4 bg-white shadow-xl rounded-lg text-lg md:text-2xl font-semibold"
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
    <div className="w-screen min-h-screen flex flex-col bg-gradient-to-r from-indigo-100 via-purple-50 to-yellow-100 p-4 md:p-8 font-serif">
      {!selectedQuestion ? (
        <>
          <h1 className="text-3xl md:text-5xl font-bold text-center text-purple-800 mb-6 md:mb-8">
            📖 Select a Question
          </h1>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 md:gap-4 place-items-center">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => startQuestion(q)}
                disabled={usedQuestions[q.id]}
                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-lg sm:text-2xl md:text-3xl font-bold rounded-full shadow-lg transition ${
                  usedQuestions[q.id]
                    ? "cursor-not-allowed opacity-70"
                    : "hover:scale-105 bg-purple-600 text-white"
                }`}
                style={{ backgroundColor: usedQuestions[q.id] || "#6B21A8" }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="text-center mt-6 md:mt-8">
            <button
              onClick={finishQuiz}
              className="px-6 md:px-10 py-3 md:py-4 bg-green-600 text-white text-lg md:text-2xl font-bold rounded-full shadow hover:bg-green-700 transition"
            >
              Finish Quiz & Show Scores
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 justify-center items-center px-2 md:px-0">
          <div className="mb-6 md:mb-8">
            <div className="px-6 py-3 md:px-8 md:py-4 bg-purple-600 text-white text-xl md:text-3xl font-semibold rounded-full shadow-lg">
              ⏳ {timeLeft}s
            </div>
          </div>

          <p className="text-xl md:text-4xl font-bold text-center text-gray-800 mb-6 md:mb-10 max-w-xl md:max-w-3xl">
            {selectedQuestion.text}
          </p>

          {showAnswer ? (
            <p className="text-center text-green-600 text-lg md:text-3xl font-semibold mb-6 md:mb-10">
              ✅ {selectedQuestion.answer}
            </p>
          ) : (
            <button
              onClick={revealAnswer}
              className="px-6 md:px-10 py-3 md:py-4 bg-yellow-400 text-white text-lg md:text-2xl font-semibold rounded-full shadow hover:bg-yellow-500 transition"
            >
              Show Answer
            </button>
          )}

          {showAnswer && (
            <div className="mt-4 md:mt-10 flex gap-2 sm:gap-4 flex-wrap justify-center">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => awardPoints(team)}
                  className="px-4 md:px-8 py-2 md:py-4 rounded-full text-white text-sm md:text-xl font-semibold shadow-lg hover:scale-105 transition"
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
