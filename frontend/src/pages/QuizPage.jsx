import { useState, useEffect } from "react";
import { fetchQuestions, awardScore } from "../api";

function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await fetchQuestions();
      setQuestions(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentIndex];
    // send points logic (example: 10 points if answer matches)
    if (selectedAnswer) {
      await awardScore({
        team_id: 1, // replace with dynamic team
        question_id: currentQuestion.id,
        points: selectedAnswer === currentQuestion.answer ? 10 : 0,
      });
    }
    setSelectedAnswer("");
    if (currentIndex + 1 < questions.length) setCurrentIndex(currentIndex + 1);
  };

  if (loading) return <p className="text-center mt-8 text-lg">Loading questions...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (questions.length === 0) return <p className="text-center mt-8 text-gray-500">No questions available.</p>;

  const question = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-12 bg-gradient-to-b from-yellow-50 via-white to-purple-50 rounded-3xl shadow-2xl flex flex-col gap-6 font-serif">
      <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 text-center">
        Question {currentIndex + 1} of {questions.length}
      </h2>
      <p className="text-lg sm:text-xl text-gray-700">{question.text}</p>

      <div className="flex flex-col gap-3">
        {["A", "B", "C", "D"].map((option, idx) => (
          <button
            key={idx}
            className={`px-4 py-3 rounded-2xl shadow text-left text-lg sm:text-xl transition hover:scale-105 ${
              selectedAnswer === option ? "bg-purple-600 text-white" : "bg-white"
            }`}
            onClick={() => setSelectedAnswer(option)}
          >
            {option}: {question[option.toLowerCase()]}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="self-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-lg sm:text-xl font-bold rounded-full shadow hover:scale-105 transition"
      >
        {currentIndex + 1 === questions.length ? "Finish Quiz" : "Next Question"}
      </button>
    </div>
  );
}

export default QuizPage;
