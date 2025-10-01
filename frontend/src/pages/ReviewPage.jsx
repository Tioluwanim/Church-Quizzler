import { useEffect, useState } from "react";
import { fetchQuestions } from "../api";

function ReviewPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (err) {
        console.error("Error loading questions:", err);
        alert("Failed to load questions. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  return (
    <div className="min-h-screen p-12 bg-gradient-to-b from-purple-50 to-yellow-50 font-serif">
      <h1 className="text-4xl font-bold mb-10 text-center text-purple-800">
        📖 Review Questions
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <p className="text-gray-500 text-center text-xl">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-gray-500 text-center text-xl">
            No questions available
          </p>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-purple-400"
            >
              <h2 className="text-2xl font-semibold text-purple-700 mb-2">
                Q{idx + 1}: {q.text}
              </h2>
              <p className="text-xl text-green-700 font-medium">
                ✅ Answer: {q.answer}
              </p>
              {q.category && (
                <p className="text-sm text-gray-500">Category: {q.category}</p>
              )}
              <p className="text-sm text-gray-500">Points: {q.points}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewPage;
