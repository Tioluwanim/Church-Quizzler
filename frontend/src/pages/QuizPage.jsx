import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchQuestionsByCategory, submitAnswer, fetchTeams } from "../api";

function QuizPage() {
  const { teamId, categoryId, questionId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [readingDone, setReadingDone] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [team, setTeam] = useState(null);
  const [speechBlocked, setSpeechBlocked] = useState(false);
  const [attemptingAutoRead, setAttemptingAutoRead] = useState(false);
  const navigate = useNavigate();

  const tickSound = useRef(new Audio("/sounds/tick.mp3"));
  const endSound = useRef(new Audio("/sounds/end.mp3"));
  const autoReadTimeoutRef = useRef(null);

  // helper: remove leading numbering "1.", "2)" etc
  const cleanForSpeech = (text) => text ? text.replace(/^\s*\d+[\.\)\-]?\s*/, "").trim() : "";

  // speak utility with onEnd callback
  const speak = (text, onEnd) => {
    if (!window.speechSynthesis) {
      console.warn("speechSynthesis not supported");
      onEnd?.();
      return;
    }
    const utter = new SpeechSynthesisUtterance(cleanForSpeech(text));
    utter.lang = "en-US";
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onend = () => onEnd?.();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // load questions + team
  useEffect(() => {
    async function loadData() {
      const qData = await fetchQuestionsByCategory(categoryId);
      setQuestions(qData || []);
      const teams = await fetchTeams();
      const sel = teams.find(t => t.id === parseInt(teamId));
      setTeam(sel || null);

      const idx = qData.findIndex(q => q.id === parseInt(questionId));
      setCurrentIndex(idx >= 0 ? idx : 0);

      if (sel) setTimeLeft(sel.timer_seconds || 30);
    }
    loadData();
    // cleanup on unmount
    return () => {
      window.speechSynthesis?.cancel();
      clearTimeout(autoReadTimeoutRef.current);
    };
  }, [categoryId, teamId, questionId]);

  // Attempt auto-read if session token exists; if it fails we show enable button
  useEffect(() => {
    if (!questions.length || !team) return;

    const token = sessionStorage.getItem("quiz_user_gesture");
    const ts = Number(sessionStorage.getItem("quiz_gesture_ts") || "0");
    const now = Date.now();
    // token is valid for ~10s to be safe
    const tokenValid = token && (now - ts) < 10000;

    const q = questions[currentIndex];
    const textToSpeak = `${q.text}. ${q.options ? "Options are: " + q.options.join(", ") : ""}`;

    if (tokenValid) {
      // try to auto-read immediately
      setAttemptingAutoRead(true);
      try {
        speak(textToSpeak, () => {
          setReadingDone(true);
          setAttemptingAutoRead(false);
          // start timer now (use fresh team.timer_seconds)
          setTimeLeft(team.timer_seconds || 30);
          // clear the token (one-time)
          sessionStorage.removeItem("quiz_user_gesture");
          sessionStorage.removeItem("quiz_gesture_ts");
        });
        // set fallback in case speech is blocked silently: if readingDone not set after 800ms assume blocked
        autoReadTimeoutRef.current = setTimeout(() => {
          if (!readingDone) {
            setSpeechBlocked(true);
            setAttemptingAutoRead(false);
          }
        }, 800);
      } catch (err) {
        console.warn("auto-read attempt failed:", err);
        setSpeechBlocked(true);
        setAttemptingAutoRead(false);
      }
    } else {
      // no token — require manual tap to enable reading
      setSpeechBlocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, team, currentIndex]);

  // Timer countdown (runs only when readingDone and timeLeft > 0)
  useEffect(() => {
    if (!readingDone || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingDone, timeLeft]);

  if (!questions.length || !team) return <p>Loading...</p>;
  const q = questions[currentIndex];

  // reveal answer and speak it
  const revealAnswer = () => {
    setShowAnswer(true);
    setAnswerRevealed(true);
    setTimeLeft(0);
    window.speechSynthesis.cancel();
    // speak answer
    speak(`The correct answer is: ${q.answer}`);
  };

  // award points then mark globally answered and return
  const awardPoints = async (isCorrect) => {
    if (isCorrect) {
      await submitAnswer({ team_id: team.id, question_id: q.id, points: q.points });
    }
    const key = `answered_${categoryId}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    if (!existing.includes(q.id)) existing.push(q.id);
    localStorage.setItem(key, JSON.stringify(existing));
    // cleanup
    window.speechSynthesis.cancel();
    sessionStorage.removeItem("quiz_user_gesture");
    sessionStorage.removeItem("quiz_gesture_ts");
    navigate(`/select-team/${categoryId}`);
  };

  // fallback button handler when speech blocked — performs speech then starts timer
  const handleEnableReadAndStart = () => {
    const textToSpeak = `${q.text}. ${q.options ? "Options are: " + q.options.join(", ") : ""}`;
    setSpeechBlocked(false);
    setAttemptingAutoRead(true);
    speak(textToSpeak, () => {
      setReadingDone(true);
      setAttemptingAutoRead(false);
      setTimeLeft(team.timer_seconds || 30);
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-xl shadow flex flex-col lg:flex-row gap-8">
      {/* LEFT */}
      <div className="flex-1">
        <h1 className="text-3xl font-extrabold mb-6 text-purple-900">
          Team: {team.name} | Question {currentIndex + 1}/{questions.length}
        </h1>

        <p className="mb-6 text-2xl font-bold text-gray-900">{q.text}</p>

        {showAnswer && (
          <p className="mb-6 text-green-700 font-extrabold text-xl">✅ Correct Answer: {q.answer}</p>
        )}

        <div className="grid gap-4">
          {q.options?.map((opt, idx) => (
            <div key={idx} className={`p-4 rounded-lg border text-center text-lg font-bold transition ${showAnswer && opt === q.answer ? "bg-green-200 border-green-600" : "bg-purple-100 border-purple-300"}`}>
              {opt}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col items-center justify-center gap-6">
        <div className="text-5xl font-extrabold text-purple-800 mb-6">⏳ {timeLeft > 0 ? timeLeft : 0}s</div>

        {!answerRevealed && (
          <button onClick={revealAnswer} className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold text-lg hover:bg-yellow-600 shadow-lg">
            ⏹ Stop
          </button>
        )}

        {answerRevealed && (
          <div className="flex flex-col gap-6 w-full">
            <button onClick={() => awardPoints(true)} className="px-8 py-4 bg-green-600 text-white rounded-xl font-extrabold text-xl hover:bg-green-700 shadow-lg">Correct ✅</button>
            <button onClick={() => awardPoints(false)} className="px-8 py-4 bg-red-600 text-white rounded-xl font-extrabold text-xl hover:bg-red-700 shadow-lg">Wrong ❌</button>
          </div>
        )}

        {/* If auto read failed, show fallback button */}
        {speechBlocked && (
          <div className="mt-4 text-center">
            <p className="mb-3 text-sm text-gray-600">Auto-read was blocked by the browser. Tap below to enable speech and start the timer.</p>
            <button onClick={handleEnableReadAndStart} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg">
              🔊 Enable Read & Start
            </button>
          </div>
        )}

        {attemptingAutoRead && <p className="text-sm text-gray-500 mt-2">Attempting to read question…</p>}
      </div>
    </div>
  );
}

export default QuizPage;

