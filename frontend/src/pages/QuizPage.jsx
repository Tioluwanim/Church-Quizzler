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
  const [voiceReady, setVoiceReady] = useState(false);
  const navigate = useNavigate();

  const tickSound = useRef(new Audio("/sounds/tick.mp3"));
  const endSound = useRef(new Audio("/sounds/end.mp3"));

  // ✅ Prepare speech synthesis voices
  useEffect(() => {
    const handleVoicesChanged = () => setVoiceReady(true);
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged();
  }, []);

  // 🗣️ Clean & Speak Question Aloud
  const speakQuestion = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis not supported on this browser.");
      return;
    }

    // ✅ Remove leading numbers, bullets, or dots like "1.", "2)", "3 -"
    const cleanText = text.replace(/^\s*\d+[\.\)\-]?\s*/, "");

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = "en-US";
    utter.rate = 0.9;
    utter.pitch = 1;
    utter.volume = 1;

    window.speechSynthesis.cancel(); // stop any previous speech
    window.speechSynthesis.speak(utter);
  };

  // Load questions & team info
  useEffect(() => {
    async function loadData() {
      const qData = await fetchQuestionsByCategory(categoryId);
      setQuestions(qData);

      const teams = await fetchTeams();
      const selectedTeam = teams.find((t) => t.id === parseInt(teamId));
      setTeam(selectedTeam);

      if (questionId) {
        const idx = qData.findIndex((q) => q.id === parseInt(questionId));
        setCurrentIndex(idx >= 0 ? idx : 0);
      }

      if (selectedTeam) setTimeLeft(selectedTeam.timer_seconds || 30);
    }
    loadData();
  }, [categoryId, teamId, questionId]);

  // Timer countdown
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
          revealAnswer();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions, team]);

  if (!questions.length || !team) return <p>Loading...</p>;

  const q = questions[currentIndex];

  // ✅ Reveal answer (for Stop button & timer end)
  const revealAnswer = () => {
    setShowAnswer(true);
    setAnswerRevealed(true);
    setTimeLeft(0);
    window.speechSynthesis.cancel();
  };

  const awardPoints = async (isCorrect) => {
    if (isCorrect) {
      await submitAnswer({ team_id: team.id, question_id: q.id, points: q.points });
    }

    const key = `answered_${categoryId}`;
    let answered = JSON.parse(localStorage.getItem(key) || "[]");
    if (!answered.includes(q.id)) answered.push(q.id);
    localStorage.setItem(key, JSON.stringify(answered));

    navigate(`/select-team/${categoryId}`);
  };

  const handleReadAloud = () => {
    const textToSpeak = `${q.text}. ${
      q.options ? "Options are: " + q.options.join(", ") : ""
    }`;
    speakQuestion(textToSpeak);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow flex flex-col lg:flex-row gap-8">
      {/* LEFT: Question */}
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

        {/* 🔊 Read Aloud Controls */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleReadAloud}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg"
          >
            🔊 Read Question
          </button>
          <button
            onClick={() => window.speechSynthesis.cancel()}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold text-lg hover:bg-gray-700 shadow-lg"
          >
            🔇 Stop Reading
          </button>
        </div>
      </div>

      {/* RIGHT: Timer & Buttons */}
      <div className="w-full lg:w-1/3 flex flex-col items-center justify-center gap-6">
        <div className="text-5xl font-extrabold text-purple-800 mb-6">
          ⏳ {timeLeft > 0 ? timeLeft : 0}s
        </div>

        {!answerRevealed && (
          <button
            onClick={revealAnswer}
            className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold text-lg hover:bg-yellow-600 shadow-lg"
          >
            ⏹ Stop
          </button>
        )}

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
